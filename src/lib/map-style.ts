// src/lib/map-style.ts

/**
 * Mapbox access token, read once at module load. Every map in the app
 * shares this — see SpatialCoordinatePicker.tsx, the sole place that
 * actually constructs a mapboxgl.Map.
 */
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Primary style: Mapbox's Satellite Streets — high-resolution satellite
 * imagery with a vibrant road/place/label overlay on top. Chosen
 * specifically because field agents need to zoom into actual land parcels
 * (crop rows, tree cover, structures, field edges) well enough to position
 * a site accurately and, eventually, trace a boundary around it — a plain
 * vector "streets" style shows roads and place names but not the land
 * itself, which is the whole point here. It's also simply the most vibrant,
 * visually distinctive option available, which matters for a map meant to
 * read as a clear break from the rest of the (mostly monochrome) UI.
 *
 * Previously this pointed at CARTO Voyager raster tiles via a hand-rolled
 * MapLibre style spec (free, keyless, but plain street-map only — no
 * imagery). Switched providers entirely to Mapbox for the imagery-detail
 * requirement above; mapbox-gl's API is a near-drop-in replacement for
 * maplibre-gl (MapLibre is itself a fork of pre-v2 Mapbox GL JS), so this
 * only required changes in SpatialCoordinatePicker.tsx, not every call site.
 */
export const MAP_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

/**
 * Fallback if satellite-streets tiles start failing outright (e.g. a
 * transient Mapbox imagery-tile outage) — Mapbox's standard vector
 * "Streets" style. Deliberately still Mapbox/same token rather than a
 * different provider entirely: satellite imagery is the heavier of the two
 * to fetch, so a plain vector style is meaningfully more likely to succeed
 * even under the same network conditions, while keeping one consistent
 * provider/token to reason about.
 */
export const FALLBACK_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
