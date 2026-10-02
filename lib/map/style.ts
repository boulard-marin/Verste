import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";

/**
 * VERSTE night style for MapLibre, on OpenFreeMap vector tiles (OpenMapTiles
 * schema, OpenStreetMap data, no key, no tracking). Palette = design tokens:
 * night background, midnight water, steel roads. Red is never used here: it
 * belongs to the route, drawn on top by the map component.
 */

export const OPENFREEMAP_TILES = "https://tiles.openfreemap.org/planet";
export const OPENFREEMAP_GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
/** Open elevation tiles (Mapzen Terrain Tiles on AWS Open Data, Terrarium encoding, no key, CORS allowed). */
export const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
export const TERRAIN_ATTRIBUTION = "Relief : Terrain Tiles (Mapzen, AWS)";

/** Buildings mapped in detail come as parts; their outline (hide_3d) would be a crude box around them. */
const SHOW_3D: ExpressionSpecification = ["!", ["to-boolean", ["coalesce", ["get", "hide_3d"], false]]];

/** The globe's atmosphere: visible from space, gone once the camera is over a city. */
const ATMOSPHERE: ExpressionSpecification = ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 0.85, 8, 0];

/** Sky and horizon, by light: the default night blue, deep night, dawn over the Volga. */
export const skies = {
  night: { "sky-color": "#08101f", "horizon-color": "#1d3b6e", "fog-color": "#0f141c", "sky-horizon-blend": 0.55, "horizon-fog-blend": 0.5, "fog-ground-blend": 0.75, "atmosphere-blend": ATMOSPHERE },
  deep: { "sky-color": "#05070b", "horizon-color": "#15223a", "fog-color": "#07090d", "sky-horizon-blend": 0.5, "horizon-fog-blend": 0.45, "fog-ground-blend": 0.8, "atmosphere-blend": ATMOSPHERE },
  dawn: { "sky-color": "#3f5f8f", "horizon-color": "#f0c9a0", "fog-color": "#27344a", "sky-horizon-blend": 0.7, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.65, "atmosphere-blend": ATMOSPHERE },
  /** The white nights of Saint Petersburg: a pale sky, a pink horizon to the north. */
  white: { "sky-color": "#7488aa", "horizon-color": "#f3d3c4", "fog-color": "#5a6780", "sky-horizon-blend": 0.75, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.6, "atmosphere-blend": ATMOSPHERE },
} as const;

/**
 * Light on the volumes. Night: a low, warm light from the south-west, façades
 * read as volumes. Dawn: the sun rises in the east (azimuth ≈ 95° at the end
 * of September at 56° N), low and orange, raking the kremlin walls.
 */
export const lights = {
  night: { anchor: "map", color: "#fff1dc", intensity: 0.42, position: [1.3, 215, 38] },
  dawn: { anchor: "map", color: "#ffd2a1", intensity: 0.5, position: [1.25, 95, 64] },
  /** White nights: the sun just under the northern horizon, a soft cool light from the north. */
  white: { anchor: "map", color: "#f1ecff", intensity: 0.55, position: [1.3, 340, 52] },
} as const satisfies Record<string, NonNullable<StyleSpecification["light"]>>;

export const mapColors = {
  background: "#0f141c",
  water: "#0d2240",
  waterLine: "#1d3b6e",
  wood: "#121a17",
  park: "#132019",
  road: "#5e7c9c",
  roadMajor: "#8aa2bd",
  rail: "#a9b8cc",
  building: "#182233",
  buildingTop: "#243149",
  border: "#a9b8cc",
  label: "#c9d5e6",
  labelHalo: "#0c0f14",
  waterLabel: "#6f8fb8",
} as const;

const zoomWidth = (base: number, z14: number, z18: number): ExpressionSpecification => [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  5,
  base,
  14,
  z14,
  18,
  z18,
];

export function buildNightStyle(): StyleSpecification {
  return {
    version: 8,
    name: "VERSTE nuit",
    glyphs: OPENFREEMAP_GLYPHS,
    // A globe from space (the opening flight, the whole of Russia), flat Mercator from zoom 12.
    projection: { type: "globe" },
    sky: skies.night,
    light: { ...lights.night, position: [...lights.night.position] },
    sources: {
      openmaptiles: { type: "vector", url: OPENFREEMAP_TILES, attribution: "© OpenStreetMap · OpenFreeMap" },
      relief: { type: "raster-dem", tiles: [TERRAIN_TILES], encoding: "terrarium", tileSize: 256, maxzoom: 14, attribution: TERRAIN_ATTRIBUTION },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": mapColors.background } },
      {
        id: "landcover-wood",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["match", ["get", "class"], ["wood", "forest"], true, false],
        // Faded in from zoom 6: from space the land stays one atlas tone, not a camouflage.
        paint: { "fill-color": mapColors.wood, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0, 9, 0.9] },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": mapColors.park, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0, 10, 0.8] },
      },
      {
        id: "hillshade",
        type: "hillshade",
        source: "relief",
        minzoom: 9,
        paint: {
          "hillshade-shadow-color": "#05070b",
          "hillshade-highlight-color": "#2a3a55",
          "hillshade-accent-color": "#0b1220",
          "hillshade-exaggeration": 0.45,
          "hillshade-illumination-direction": 300,
        },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": mapColors.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": mapColors.waterLine, "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.4, 12, 1.4, 16, 3] },
      },
      {
        id: "boundary-country",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["all", ["==", ["get", "admin_level"], 2], ["!=", ["get", "maritime"], 1]],
        paint: { "line-color": mapColors.border, "line-opacity": 0.28, "line-width": 0.8, "line-dasharray": [3, 2] },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 12,
        filter: ["match", ["get", "class"], ["minor", "service", "tertiary", "path", "pedestrian", "track"], true, false],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": mapColors.road,
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0.12, 16, 0.4],
          "line-width": zoomWidth(0.2, 1.2, 6),
        },
      },
      {
        id: "road-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 6,
        filter: ["match", ["get", "class"], ["motorway", "trunk", "primary", "secondary"], true, false],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": mapColors.roadMajor,
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.12, 12, 0.3, 16, 0.5],
          "line-width": zoomWidth(0.3, 2.4, 12),
        },
      },
      {
        id: "rail",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 7,
        filter: ["==", ["get", "class"], "rail"],
        paint: { "line-color": mapColors.rail, "line-opacity": 0.22, "line-width": 0.8, "line-dasharray": [2, 2] },
      },
      {
        id: "building-flat",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        filter: SHOW_3D,
        minzoom: 13,
        maxzoom: 15,
        paint: { "fill-color": mapColors.building, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.8] },
      },
      {
        id: "building-3d",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 14.5,
        filter: SHOW_3D,
        paint: {
          "fill-extrusion-color": ["interpolate", ["linear"], ["get", "render_height"], 0, mapColors.building, 60, mapColors.buildingTop],
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14.5, 0, 15.5, ["get", "render_height"]],
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-opacity": 0.92,
        },
      },
      {
        id: "water-name",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        minzoom: 9,
        layout: {
          "text-field": ["coalesce", ["get", "name:ru"], ["get", "name"]],
          "text-font": ["Noto Sans Italic"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 15, 15],
          "text-letter-spacing": 0.2,
          "symbol-placement": "line",
        },
        paint: { "text-color": mapColors.waterLabel, "text-halo-color": mapColors.labelHalo, "text-halo-width": 1.2 },
      },
      {
        id: "waterway-name",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "waterway",
        minzoom: 11,
        filter: ["==", ["get", "class"], "river"],
        layout: {
          "text-field": ["coalesce", ["get", "name:ru"], ["get", "name"]],
          "text-font": ["Noto Sans Italic"],
          "text-size": 13,
          "text-letter-spacing": 0.2,
          "symbol-placement": "line",
        },
        paint: { "text-color": mapColors.waterLabel, "text-halo-color": mapColors.labelHalo, "text-halo-width": 1.2 },
      },
      {
        id: "street-name",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 15,
        layout: {
          "text-field": ["coalesce", ["get", "name:ru"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "symbol-placement": "line",
        },
        paint: { "text-color": mapColors.label, "text-opacity": 0.7, "text-halo-color": mapColors.labelHalo, "text-halo-width": 1.2 },
      },
    ],
  };
}
