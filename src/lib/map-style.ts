// src/lib/map-style.ts

/**
 * Single shared basemap style for every map in the app.
 *
 * Previously this pointed at MapTiler's hosted "Streets" style, gated behind
 * NEXT_PUBLIC_MAPTILER_KEY. That had two compounding problems in practice:
 *   1. Tile/style requests would start failing after the map had already
 *      initialized (quota exhaustion, a domain-restricted key, etc.) — the
 *      very first view often loads fine off browser/CDN cache, then goes
 *      blank as soon as you pan or zoom into anything uncached.
 *   2. Because the interactive picker's reverse-geocode lookup fires on the
 *      map's `moveend` event, a map that's stuck retrying failed tile
 *      requests can stop firing `moveend` cleanly, which made reverse
 *      geocoding look broken too — even though geocoding itself (Nominatim)
 *      was never the thing actually failing.
 *
 * We now render the basemap as a plain MapLibre raster style pointed at
 * CARTO's Voyager tiles instead: free, keyless, no quota/domain-restriction
 * failure mode, and visually vibrant (colored road hierarchy, green
 * vegetation, blue water) rather than one of CARTO's grayscale variants
 * (Positron/Dark Matter), which we deliberately avoid — the product wants a
 * map that reads as a clear visual break from the rest of the (mostly
 * monochrome) UI, not another muted panel.
 *
 * Every map in the product should import MAP_STYLE from here rather than
 * each component picking its own tiles/style, so the whole app shares one
 * visual language for maps. No environment variable is required anymore.
 */
export const MAP_STYLE = {
  version: 8,
  sources: {
    "carto-voyager": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: "carto-voyager-layer",
      type: "raster",
      source: "carto-voyager",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
} as const;

/**
 * Kept for backward compatibility with existing imports — same value as
 * MAP_STYLE. Prefer MAP_STYLE in new code; this alias just avoids a
 * breaking rename for anything still importing MAP_STYLE_URL.
 */
export const MAP_STYLE_URL = MAP_STYLE;

/**
 * Independent secondary fallback — a different tile provider/CDN entirely
 * (OSM's own standard raster tiles), used only if CARTO's tiles themselves
 * start failing outright. Genuinely independent rather than retrying the
 * same failing source.
 */
export const FALLBACK_MAP_STYLE = {
  version: 8,
  sources: {
    "osm-standard": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-standard-layer",
      type: "raster",
      source: "osm-standard",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
} as const;
