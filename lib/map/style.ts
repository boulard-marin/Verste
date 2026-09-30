import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";

/**
 * VERSTE night style for MapLibre, on OpenFreeMap vector tiles (OpenMapTiles
 * schema, OpenStreetMap data, no key, no tracking). Palette = design tokens:
 * night background, midnight water, steel roads. Red is never used here: it
 * belongs to the route, drawn on top by the map component.
 */

export const OPENFREEMAP_TILES = "https://tiles.openfreemap.org/planet";
export const OPENFREEMAP_GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

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
    sources: {
      openmaptiles: { type: "vector", url: OPENFREEMAP_TILES, attribution: "© OpenStreetMap · OpenFreeMap" },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": mapColors.background } },
      {
        id: "landcover-wood",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["match", ["get", "class"], ["wood", "forest"], true, false],
        paint: { "fill-color": mapColors.wood, "fill-opacity": 0.9 },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": mapColors.park, "fill-opacity": 0.8 },
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
