// src/lib/map-style.ts

/**
 * Single shared basemap style for every map in the app.
 *
 * MapLibre is our map renderer everywhere (SpatialCoordinatePicker and any
 * future map component); MapTiler's "Streets" style is the standard
 * open-source basemap built to work with it out of the box. It's the
 * vibrant, full-color style (visible greens for vegetation, blue water,
 * colored road hierarchy) — not one of MapTiler's grayscale variants
 * (Positron/Toner/etc.), which we deliberately avoid here.
 *
 * Every map in the product should import MAP_STYLE_URL from here rather
 * than each component picking its own tiles/style, so the whole app shares
 * one visual language for maps.
 *
 * Requires NEXT_PUBLIC_MAPTILER_KEY (see .env.example). Get a free key at
 * https://cloud.maptiler.com/account/keys/.
 */
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

if (!MAPTILER_KEY && typeof window !== "undefined") {
  // Fails loudly in the console (rather than silently as a blank map)
  // so a missing key is obvious in dev instead of looking like a bug.
  console.warn(
    "[map-style] NEXT_PUBLIC_MAPTILER_KEY is not set — maps will fail to load tiles. Add it to .env.local (see .env.example).",
  );
}

export const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY ?? ""}`;

/**
 * Fallback basemap — used when MapTiler tile requests start failing after
 * the map has already initialized (a missing/quota-exhausted/domain-
 * restricted key often lets the very first view load fine, since it can
 * ride on browser/CDN caching, then fails on every subsequent tile request
 * as you pan or zoom into new, uncached tiles — which looks exactly like
 * "the map loads correctly for a second, then goes blank").
 *
 * CARTO's Voyager tiles are free, keyless, and don't share MapTiler's
 * quota, so they're a genuinely independent fallback rather than just
 * retrying the same failing source. A raw style OBJECT (not a URL) since
 * MapLibre's setStyle() accepts either, and this one is simple enough not
 * to need a hosted style.json.
 */
export const FALLBACK_MAP_STYLE = {
  version: 8,
  sources: {
    "cartodb-voyager": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    },
  },
  layers: [
    {
      id: "raster-tiles",
      type: "raster",
      source: "cartodb-voyager",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
} as const;
