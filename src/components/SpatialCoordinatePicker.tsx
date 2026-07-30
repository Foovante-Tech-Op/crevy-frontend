// src/components/SpatialCoordinatePicker.tsx
"use client";

import {
  Loader2,
  MapPinOff,
  Maximize2,
  Minimize2,
  Move,
  Navigation,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { axiosClient } from "@/lib/axiosClient";
import { FALLBACK_MAP_STYLE, MAP_STYLE } from "@/lib/map-style";
import { cn } from "@/lib/utils";
import "maplibre-gl/dist/maplibre-gl.css";

type ReverseGeocodeInfo = {
  region?: string;
  countryCode?: string;
  label?: string;
};

// Rounds to 4 decimal places (~11m) — the same bucket size the backend uses
// for its own cache, so "already resolved this session" and "already
// resolved server-side" line up.
function geocodeCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// Cheap equirectangular approximation — accurate enough at the few-tens-of-
// meters scale this is used for, without pulling in a full haversine.
function approxDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const meanLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const x = dLng * Math.cos(meanLat);
  const y = dLat;
  return Math.sqrt(x * x + y * y) * R;
}

// Below this, region/country is essentially guaranteed unchanged, so a new
// lookup isn't worth the request — reuse the last resolved result instead.
const MOVEMENT_GATE_METERS = 30;

interface SpatialPickerProps {
  latitude: string;
  longitude: string;
  /**
   * "write" (default) — the original interactive picker: a fixed crosshair
   * stays centered in the viewport and the *map* is dragged underneath it;
   * every drag resolves a new lat/lng (and reverse-geocodes it) via onChange.
   * Used wherever someone is choosing/adjusting a location.
   *
   * "read" — a static marker pinned at the given latitude/longitude; the
   * map itself can still be panned/zoomed to look around, but the marker
   * doesn't move and nothing is reverse-geocoded. Used wherever a location
   * is being displayed, not edited (e.g. a profile's "current location").
   */
  mode?: "write" | "read";
  // Enhanced callback payload to pass upstream resolved telemetry fields.
  // Required in "write" mode; ignored in "read" mode.
  onChange?: (coords: {
    lat: string;
    lng: string;
    region?: string;
    countryCode?: string;
  }) => void;
  defaultCountryCenter?: [number, number];
  /**
   * Overrides the default compact `w-full h-64` sizing. Pass a taller
   * class (e.g. `"w-full h-[70vh]"`) for full-width display contexts like
   * a project detail page; leave unset for the default inline picker size
   * used in forms.
   */
  className?: string;
  /** Label shown in the read-mode telemetry box, e.g. a place name. */
  locationLabel?: string;
}

export function SpatialCoordinatePicker({
  latitude,
  longitude,
  mode = "write",
  onChange,
  defaultCountryCenter = [-1.0232, 7.9465],
  className,
  locationLabel,
}: SpatialPickerProps) {
  const isReadOnly = mode === "read";

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  // Counts tile-load failures on the primary style so a single transient
  // blip doesn't trigger a fallback switch, but a real outage (CDN down)
  // does. Not React state — this only needs to gate a one-time setStyle()
  // call, not trigger renders.
  const tileErrorCountRef = useRef(0);
  const hasFallenBackRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [usingFallbackTiles, setUsingFallbackTiles] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({
    lat: latitude,
    lng: longitude,
  });
  const [resolvedLocation, setResolvedLocation] = useState<string>("");

  // Distinguishes "the map moved because WE just told it to" from "the map
  // moved because the user dragged it" — see the recenter effect below for
  // why this matters (it's what stops the auto-zoom/auto-pan glitch).
  const lastEmittedRef = useRef<{ lat: string; lng: string } | null>(null);
  // Bumped on every moveend; a geocode response is only applied if it's
  // still the most recent request by the time it resolves, so a slow
  // response from an earlier drag can't clobber a newer one (or fire a
  // stale onChange that yanks the map back to where it used to be).
  const geocodeRequestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Session-lived cache of already-resolved lookups, keyed by coordinates
  // rounded to 4 decimal places (~11m buckets — matches the backend's own
  // rounding in geo.service.ts). Panning back over ground already visited
  // in this session, or nudging the pin by a few meters, hits this instead
  // of the network.
  const geocodeCacheRef = useRef<Map<string, ReverseGeocodeInfo>>(new Map());
  // The position (and result) of the last lookup we actually performed —
  // network or cache hit, doesn't matter. Used by the movement gate below:
  // region/country practically never changes over a few tens of meters, so
  // there's no need to re-resolve on every single moveend while dragging
  // continuously through brand-new territory (where the cache above can't
  // help, since every cell is new).
  const lastResolvedRef = useRef<{
    lat: number;
    lng: number;
    info: ReverseGeocodeInfo;
  } | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initialLat = parseFloat(latitude) || defaultCountryCenter[1];
  const initialLng = parseFloat(longitude) || defaultCountryCenter[0];

  // Helper utility executing reverse-geocoding lookups via our backend's
  // Nominatim proxy (see crevy-backend's geo.service.ts) rather than
  // calling Nominatim directly from the browser — the backend can set a
  // real identifying User-Agent (browsers silently strip custom ones) and
  // enforces Nominatim's ~1 req/sec fair-use budget across every user of
  // the app, not per-tab. This is a nice-to-have auto-fill, not a hard
  // requirement — region/country stay manually editable regardless, so any
  // failure here should degrade quietly rather than interrupt the person
  // filling in the form. Deliberately does NOT use console.error: in
  // Next's dev overlay, console.error pops a full-screen red error page
  // even for an error that's already safely caught and handled here —
  // console.warn still shows up in devtools for anyone debugging, without
  // the intrusive overlay. Only relevant in "write" mode.
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number, requestId: number) => {
      setIsGeocoding(true);
      try {
        const response = await axiosClient.get("/geo/reverse", {
          params: { lat, lng },
        });

        // A newer drag has already started a fresher request — drop this
        // one instead of applying a stale result.
        if (!isMountedRef.current || requestId !== geocodeRequestIdRef.current)
          return null;

        const result = response.data?.data;
        if (result) {
          const info: ReverseGeocodeInfo = {
            region: result.region,
            countryCode: result.countryCode,
            label: result.label || "",
          };
          setResolvedLocation(info.label || "");
          geocodeCacheRef.current.set(geocodeCacheKey(lat, lng), info);
          lastResolvedRef.current = { lat, lng, info };
          return info;
        }
        setResolvedLocation("Auto-lookup unavailable — enter manually");
      } catch (err) {
        if (!isMountedRef.current || requestId !== geocodeRequestIdRef.current)
          return null;
        console.warn("Reverse geocoding lookup failed (non-fatal):", err);
        setResolvedLocation("Auto-lookup unavailable — enter manually");
      } finally {
        if (isMountedRef.current && requestId === geocodeRequestIdRef.current)
          setIsGeocoding(false);
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE as any,
      center: [initialLng, initialLat],
      zoom: latitude && longitude ? 13 : 5,
      trackResize: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    // MapLibre emits 'error' per failed tile/resource request rather than
    // throwing — without a listener these are completely silent. Requires
    // 3 cumulative failures (not 1) before falling back, so a single
    // dropped request on a flaky connection doesn't unnecessarily abandon
    // the primary style.
    map.on("error", (e) => {
      if (hasFallenBackRef.current) return; // already on the fallback, nothing more to do

      tileErrorCountRef.current += 1;
      console.warn(
        `[SpatialCoordinatePicker] Tile/style load error (${tileErrorCountRef.current}):`,
        e.error,
      );

      if (tileErrorCountRef.current >= 3) {
        hasFallenBackRef.current = true;
        console.warn(
          "[SpatialCoordinatePicker] Primary map tiles failing repeatedly — switching to fallback tiles.",
        );
        map.setStyle(FALLBACK_MAP_STYLE as any);
        setUsingFallbackTiles(true);
      }
    });

    if (isReadOnly) {
      // Static marker pinned at the given coordinates. The map can still
      // be panned/zoomed to look around, but the marker itself never moves
      // and nothing is reverse-geocoded — this view is for display only.
      const marker = new maplibregl.Marker({ color: "#0f172a" }).setLngLat([
        initialLng,
        initialLat,
      ]);
      if (latitude && longitude) {
        marker.addTo(map);
      }
      markerRef.current = marker;
    } else {
      // Debounced: a flurry of quick successive drags (or a fast flick)
      // collapses into a single lookup ~700ms after motion settles, instead
      // of firing one per moveend. Combined with the cache + movement gate
      // below, this is what keeps normal map use (and, by extension, this
      // endpoint's own request budget — see geoRateLimiter on the backend)
      // to a small handful of actual network calls per session rather than
      // one per drag gesture. The requestId guard in performReverseGeocode
      // and lastEmittedRef further down are what stop a slow, now-stale
      // response from snapping the map back to an old position mid-drag.
      map.on("moveend", () => {
        const center = map.getCenter();
        const latStr = center.lat.toFixed(6);
        const lngStr = center.lng.toFixed(6);

        setCurrentCoords({ lat: latStr, lng: lngStr });

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(async () => {
          const latNum = parseFloat(latStr);
          const lngNum = parseFloat(lngStr);

          if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            lastEmittedRef.current = { lat: latStr, lng: lngStr };
            onChange?.({ lat: latStr, lng: lngStr });
            return;
          }

          // 1. Already resolved this exact ~11m cell this session? Reuse it.
          const cached = geocodeCacheRef.current.get(
            geocodeCacheKey(latNum, lngNum),
          );
          // 2. Otherwise, moved only a short distance since the last lookup
          //    (anywhere, not just this cell)? Region/country won't have
          //    changed — reuse that result rather than re-querying.
          const nearLast =
            !cached &&
            lastResolvedRef.current &&
            approxDistanceMeters(
              latNum,
              lngNum,
              lastResolvedRef.current.lat,
              lastResolvedRef.current.lng,
            ) < MOVEMENT_GATE_METERS;

          const reused =
            cached ?? (nearLast ? lastResolvedRef.current!.info : null);

          if (reused) {
            setResolvedLocation(reused.label || "");
            lastEmittedRef.current = { lat: latStr, lng: lngStr };
            onChange?.({
              lat: latStr,
              lng: lngStr,
              region: reused.region || "",
              countryCode: reused.countryCode || "",
            });
            return;
          }

          // 3. Genuinely new ground — actually hit the backend.
          const requestId = ++geocodeRequestIdRef.current;
          const geoInfo = await performReverseGeocode(
            latNum,
            lngNum,
            requestId,
          );
          // Only the most recent debounced lookup gets to emit — an
          // older one resolving late must not overwrite where the map
          // actually is now.
          if (requestId !== geocodeRequestIdRef.current) return;
          lastEmittedRef.current = { lat: latStr, lng: lngStr };
          onChange?.({
            lat: latStr,
            lng: lngStr,
            region: geoInfo?.region || "",
            countryCode: geoInfo?.countryCode || "",
          });
        }, 700);
      });
    }

    mapRef.current = map;

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      markerRef.current?.remove();
      markerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Deliberately only re-initializes on mode change (a fresh map instance
    // per mode) — lat/lng updates while mounted are handled by the effects
    // below instead of tearing down and rebuilding the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isReadOnly,
    initialLng,
    longitude,
    onChange,
    performReverseGeocode,
    latitude,
    initialLat,
  ]);

  // Write mode: recenter the map (crosshair stays put, map moves under it)
  // when the controlled lat/lng props change from OUTSIDE this component
  // (e.g. "Capture GPS location" jumping to a new point).
  //
  // The lastEmittedRef check is the actual glitch fix: every drag ends by
  // calling onChange with the map's own current position, which the parent
  // then feeds straight back in as the latitude/longitude props. Without
  // this check, that round-trip alone would re-enter this effect and
  // flyTo() the map back to "itself" on every drag — and because
  // performReverseGeocode is async, a late-resolving lookup could deliver
  // an *older* position after the user had already dragged further,
  // snapping the map backward and resetting the zoom to 14 mid-interaction
  // (the "auto-zooms in and auto-pans around" glitch). Skipping recenter
  // whenever the incoming coords match what we ourselves last emitted
  // means flyTo() only ever fires for genuinely external position changes.
  useEffect(() => {
    if (isReadOnly || !mapRef.current) return;
    if (
      lastEmittedRef.current &&
      lastEmittedRef.current.lat === latitude &&
      lastEmittedRef.current.lng === longitude
    ) {
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const center = mapRef.current.getCenter();
      if (
        center.lat.toFixed(6) !== lat.toFixed(6) ||
        center.lng.toFixed(6) !== lng.toFixed(6)
      ) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
      }
    }
  }, [latitude, longitude, isReadOnly]);

  // Read mode: move the marker (and recenter on it) when lat/lng change.
  useEffect(() => {
    if (!isReadOnly || !mapRef.current || !markerRef.current) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    markerRef.current.setLngLat([lng, lat]);
    if (!markerRef.current.getElement().isConnected) {
      markerRef.current.addTo(mapRef.current);
    }
    setCurrentCoords({ lat: latitude, lng: longitude });
    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
  }, [latitude, longitude, isReadOnly]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 300);
    }
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out border border-slate-200 bg-slate-50 relative",
        isFullscreen
          ? "fixed inset-0 z-[999] w-screen h-screen m-0"
          : (className ?? "w-full h-64"),
      )}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {usingFallbackTiles && (
        <div className="absolute top-3 right-3 z-20 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 font-mono text-[9px] tracking-wider uppercase flex items-center gap-1.5 shadow-md max-w-[240px]">
          <MapPinOff size={12} className="shrink-0" /> Primary map tiles
          unavailable — showing backup tiles
        </div>
      )}

      {/* Center Target Pointer Grid — write mode only; read mode uses a real marker instead */}
      {!isReadOnly && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-px bg-slate-950 absolute" />
            <div className="h-8 w-px bg-slate-950 absolute" />
            <div className="w-3 h-3 border border-slate-950 rounded-full bg-white/40 backdrop-blur-xs" />
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-slate-950 text-white p-2.5 shadow-md hover:bg-brand transition-colors flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider"
        >
          {isFullscreen ? (
            <>
              <Minimize2 size={14} /> Close Precise Viewport
            </>
          ) : (
            <>
              <Maximize2 size={14} /> Expand Full Screen View
            </>
          )}
        </button>
      </div>

      {/* Floating Telemetry Box featuring dynamic Location Labels */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-950 text-white px-3 py-2 font-mono text-[10px] tracking-widest uppercase flex flex-col gap-1 shadow-md min-w-[200px]">
        {isReadOnly ? (
          <div className="flex items-center gap-1.5">
            <Navigation size={10} className="text-brand shrink-0" />
            <span className="truncate max-w-[280px]">
              {locationLabel ? (
                <span className="text-brand">{locationLabel}</span>
              ) : (
                <>
                  LAT:{" "}
                  <span className="text-brand">{currentCoords.lat || "—"}</span>
                  {"  "}LNG:{" "}
                  <span className="text-brand">{currentCoords.lng || "—"}</span>
                </>
              )}
            </span>
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <div>
                LAT:{" "}
                <span className="text-brand">{currentCoords.lat || "—"}</span>
              </div>
              <div>
                LNG:{" "}
                <span className="text-brand">{currentCoords.lng || "—"}</span>
              </div>
            </div>
            {(isGeocoding || resolvedLocation) && (
              <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-1 mt-0.5 flex items-center gap-1.5 transition-all">
                {isGeocoding ? (
                  <>
                    <Loader2 size={10} className="animate-spin text-brand" />{" "}
                    Resolving Matrix...
                  </>
                ) : (
                  <span className="truncate max-w-[280px]">
                    LOC: <span className="text-brand">{resolvedLocation}</span>
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!isReadOnly && (
        <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 px-3 py-2 font-mono text-[9px] tracking-wider uppercase pointer-events-none hidden sm:flex items-center gap-1.5">
          <Move size={12} className="text-slate-400" /> Drag grid to isolate
          coordinate bounds
        </div>
      )}
    </div>
  );
}

/**
 * Convenience alias for display-only usage — same component, `mode="read"`
 * pre-set so call sites that only ever show a location don't need to pass
 * the prop (or an onChange they'll never use) themselves.
 */
export function LocationMap(
  props: Omit<SpatialPickerProps, "mode" | "onChange">,
) {
  return <SpatialCoordinatePicker {...props} mode="read" />;
}
