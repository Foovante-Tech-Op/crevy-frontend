// src/components/SpatialCoordinatePicker.tsx
"use client";

import { Loader2, MapPinOff, Maximize2, Minimize2, Move } from "lucide-react";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_MAP_STYLE, MAP_STYLE_URL } from "@/lib/map-style";
import { cn } from "@/lib/utils";
import "maplibre-gl/dist/maplibre-gl.css";

interface SpatialPickerProps {
  latitude: string;
  longitude: string;
  // Enhanced callback payload to pass upstream resolved telemetry fields
  onChange: (coords: {
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
}

export function SpatialCoordinatePicker({
  latitude,
  longitude,
  onChange,
  defaultCountryCenter = [-1.0232, 7.9465],
  className,
}: SpatialPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Counts tile-load failures on the primary (MapTiler) style so a single
  // transient blip doesn't trigger a fallback switch, but a real outage
  // (bad/quota-exhausted/domain-restricted key) does. Not React state —
  // this only needs to gate a one-time setStyle() call, not trigger renders.
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

  const initialLat = parseFloat(latitude) || defaultCountryCenter[1];
  const initialLng = parseFloat(longitude) || defaultCountryCenter[0];

  // Helper utility executing reverse-geocoding lookups via Nominatim.
  // This is a nice-to-have auto-fill, not a hard requirement — region/
  // country stay manually editable regardless, so any failure here (network
  // hiccup, Nominatim rate-limiting, ad-blocker) should degrade quietly
  // rather than interrupt the person filling in the form. Deliberately
  // does NOT use console.error: in Next's dev overlay, console.error pops
  // a full-screen red error page even for an error that's already safely
  // caught and handled here — console.warn still shows up in devtools for
  // anyone debugging, without the intrusive overlay.
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        // Nominatim fair-use policy requests an identifiable User-Agent header
        // — note browsers silently strip a custom User-Agent set via fetch()
        // (it's a forbidden header per the Fetch spec), so this is best-effort
        // only. For real production volume, proxy this through our own
        // backend instead of calling Nominatim directly from the browser —
        // that's the only way to reliably set the header Nominatim's policy
        // actually wants, and avoids every visitor's browser being subject
        // to Nominatim's shared public rate limit individually.
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: { "User-Agent": "CrevyPlatform/1.0" },
            signal: controller.signal,
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.address) {
            const addr = data.address;

            // Abstract localized geographic hierarchies cleanly
            const regionName =
              addr.state ||
              addr.region ||
              addr.province ||
              addr.county ||
              addr.state_district ||
              addr.suburb ||
              "";
            const countryISO = addr.country_code
              ? addr.country_code.toUpperCase()
              : "";

            const label = [regionName, data.address.country]
              .filter(Boolean)
              .join(", ");
            setResolvedLocation(label);

            return { region: regionName, countryCode: countryISO };
          }
        }
        setResolvedLocation("Auto-lookup unavailable — enter manually");
      } catch (err) {
        console.warn("Reverse geocoding lookup failed (non-fatal):", err);
        setResolvedLocation("Auto-lookup unavailable — enter manually");
      } finally {
        clearTimeout(timeout);
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
      style: MAP_STYLE_URL,
      center: [initialLng, initialLat],
      zoom: latitude && longitude ? 13 : 5,
      trackResize: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    // MapLibre emits 'error' per failed tile/resource request rather than
    // throwing — without a listener these are completely silent, which is
    // exactly why a bad MapTiler key looked like "nothing happened" instead
    // of a diagnosable failure. Requires 3 cumulative failures (not 1)
    // before falling back, so a single dropped request on a flaky
    // connection doesn't unnecessarily abandon the primary style.
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
          "[SpatialCoordinatePicker] Primary map style failing repeatedly — switching to fallback tiles. Check NEXT_PUBLIC_MAPTILER_KEY's validity, domain restrictions, and usage quota in the MapTiler dashboard.",
        );
        map.setStyle(FALLBACK_MAP_STYLE as any);
        setUsingFallbackTiles(true);
      }
    });

    map.on("moveend", async () => {
      const center = map.getCenter();
      const latStr = center.lat.toFixed(6);
      const lngStr = center.lng.toFixed(6);

      setCurrentCoords({ lat: latStr, lng: lngStr });

      const latNum = parseFloat(latStr);
      const lngNum = parseFloat(lngStr);

      if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
        const geoInfo = await performReverseGeocode(latNum, lngNum);
        onChange({
          lat: latStr,
          lng: lngStr,
          region: geoInfo?.region || "",
          countryCode: geoInfo?.countryCode || "",
        });
      } else {
        onChange({ lat: latStr, lng: lngStr });
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    initialLng,
    initialLat,
    onChange,
    longitude,
    latitude,
    performReverseGeocode,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
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
  }, [latitude, longitude]);

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

      {/* Center Target Pointer Grid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-px bg-slate-950 absolute" />
          <div className="h-8 w-px bg-slate-950 absolute" />
          <div className="w-3 h-3 border border-slate-950 rounded-full bg-white/40 backdrop-blur-xs" />
        </div>
      </div>

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
        <div className="flex gap-4">
          <div>
            LAT: <span className="text-brand">{currentCoords.lat || "—"}</span>
          </div>
          <div>
            LNG: <span className="text-brand">{currentCoords.lng || "—"}</span>
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
      </div>

      <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 px-3 py-2 font-mono text-[9px] tracking-wider uppercase pointer-events-none hidden sm:flex items-center gap-1.5">
        <Move size={12} className="text-slate-400" /> Drag grid to isolate
        coordinate bounds
      </div>
    </div>
  );
}
