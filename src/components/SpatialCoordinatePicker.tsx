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
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { axiosClient } from "@/lib/axiosClient";
import {
  FALLBACK_MAP_STYLE,
  MAP_STYLE,
  MAPBOX_ACCESS_TOKEN,
} from "@/lib/map-style";
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

type ReverseGeocodeInfo = {
  region?: string;
  locality?: string;
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

// Below this, region/locality is essentially guaranteed unchanged, so a new
// lookup isn't worth the request — reuse the last resolved result instead.
const MOVEMENT_GATE_METERS = 30;

// Below this, an incoming lat/lng prop is treated as "the same position we
// ourselves last emitted" rather than a genuinely new external position —
// see the recenter effect for why this has to be a distance tolerance
// rather than exact equality.
const SELF_ECHO_TOLERANCE_METERS = 5;

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
    locality?: string;
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
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
  // region/locality practically never changes over a few tens of meters,
  // so there's no need to re-resolve on every single moveend while
  // dragging continuously through brand-new territory (where the cache
  // above can't help, since every cell is new).
  const lastResolvedRef = useRef<{
    lat: number;
    lng: number;
    info: ReverseGeocodeInfo;
  } | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
  // requirement — region/locality stay manually editable regardless, so
  // any failure here should degrade quietly rather than interrupt the
  // person filling in the form. Deliberately does NOT use console.error:
  // in Next's dev overlay, console.error pops a full-screen red error page
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
            locality: result.locality,
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

  // Deliberately only re-initializes on mode change (a fresh map instance
  // per mode) — lat/lng updates while mounted are handled by the effects
  // below instead of tearing down and rebuilding the map.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally mode-only, see comment above
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [initialLng, initialLat],
      zoom: latitude && longitude ? 13 : 5,
      maxZoom: 22,
      trackResize: true,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    // mapbox-gl emits 'error' per failed tile/resource request rather than
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
        map.setStyle(FALLBACK_MAP_STYLE);
        setUsingFallbackTiles(true);
      }
    });

    if (isReadOnly) {
      // Static marker pinned at the given coordinates. The map can still
      // be panned/zoomed to look around, but the marker itself never moves
      // and nothing is reverse-geocoded — this view is for display only.
      const marker = new mapboxgl.Marker({ color: "#0f172a" }).setLngLat([
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
            onChangeRef.current?.({ lat: latStr, lng: lngStr });
            return;
          }

          // 1. Already resolved this exact ~11m cell this session? Reuse it.
          const cached = geocodeCacheRef.current.get(
            geocodeCacheKey(latNum, lngNum),
          );
          // 2. Otherwise, moved only a short distance since the last lookup
          //    (anywhere, not just this cell)? Region/locality won't have
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
            cached ?? (nearLast ? lastResolvedRef.current?.info : null);

          if (reused) {
            setResolvedLocation(reused.label || "");
            lastEmittedRef.current = { lat: latStr, lng: lngStr };
            onChangeRef.current?.({
              lat: latStr,
              lng: lngStr,
              region: reused.region || "",
              locality: reused.locality || "",
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
          onChangeRef.current?.({
            lat: latStr,
            lng: lngStr,
            region: geoInfo?.region || "",
            locality: geoInfo?.locality || "",
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
  }, [isReadOnly]);

  // Write mode: recenter the map (crosshair stays put, map moves under it)
  // when the controlled lat/lng props change from OUTSIDE this component
  // (e.g. "Capture GPS location" jumping to a new point).
  //
  // This compares the incoming prop against what WE OURSELVES last emitted
  // (lastEmittedRef), not against the map's live center — that distinction
  // is the actual fix for "zooming in snaps back out". Every drag/zoom ends
  // by calling onChange with the map's position at that moment, which the
  // parent feeds straight back in as props. Fast continuous interactions
  // (a scroll-wheel zoom fires many moveend events well faster than
  // React's render/effect cycle, and Mapbox zooms toward the cursor, not
  // the exact center, so each step shifts position slightly too) mean
  // that by the time this effect actually runs for a given prop update,
  // the user may have already zoomed further and the LIVE map center has
  // moved on past the position that update was requested for. Comparing
  // against that live center then makes a self-triggered echo look like
  // an external change, and flyTo() yanks the map back to the stale
  // position while resetting zoom to 14 — mid-gesture, repeatedly. Diffing
  // against our own emission history instead of live map state sidesteps
  // that race entirely: anything within a few meters of something we sent
  // up ourselves is treated as an echo and skipped, however far the map
  // has actually moved on since.
  useEffect(() => {
    if (isReadOnly || !mapRef.current) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    if (
      lastEmittedRef.current &&
      approxDistanceMeters(
        lat,
        lng,
        parseFloat(lastEmittedRef.current.lat),
        parseFloat(lastEmittedRef.current.lng),
      ) < SELF_ECHO_TOLERANCE_METERS
    ) {
      return;
    }

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: Math.max(mapRef.current.getZoom(), 14),
    });
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
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: Math.max(mapRef.current.getZoom(), 14),
    });
  }, [latitude, longitude, isReadOnly]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 300);
    }
  }, []);

  // isFullscreen isn't read in the body — it's the resize trigger itself,
  // nudging mapbox after the fullscreen CSS transition changes container size.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-run trigger, not a stale-closure risk
  useEffect(() => {
    const firstResize = requestAnimationFrame(() => mapRef.current?.resize());
    const secondResize = setTimeout(() => mapRef.current?.resize(), 350);

    return () => {
      cancelAnimationFrame(firstResize);
      clearTimeout(secondResize);
    };
  }, [isFullscreen]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out border border-slate-200 bg-slate-50 relative",
        isFullscreen
          ? "fixed inset-0 z-[999] w-screen h-screen m-0"
          : (className ?? "w-full h-64"),
      )}
    >
      {!MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100 text-center p-4">
          <p className="text-xs text-slate-500 font-mono">
            Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN isn't configured.
          </p>
        </div>
      )}

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
            <div className="w-8 h-px bg-white shadow-[0_0_2px_rgba(0,0,0,0.8)] absolute" />
            <div className="h-8 w-px bg-white shadow-[0_0_2px_rgba(0,0,0,0.8)] absolute" />
            <div className="w-3 h-3 border-2 border-white rounded-full bg-black/20 backdrop-blur-xs shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
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
