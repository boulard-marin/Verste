import type { ExpressionSpecification, Map as MapLibreMap } from "maplibre-gl";

import { mapColors } from "./style";

/**
 * Each city has its secondary palette on the map, so the journey tells the
 * difference: Moscow night blue and density, Saint Petersburg cold blue and
 * water, Nizhny the Volga at dawn, Kazan white stone and turquoise. Only the
 * ground, the water and the buildings change; red stays the route's.
 */
export const palettes = {
  moscou: { background: mapColors.background, water: mapColors.water, building: mapColors.building, buildingTop: mapColors.buildingTop },
  nijni: { background: "#1a2230", water: "#284a7a", building: "#28324a", buildingTop: "#3a4762" },
  spb: { background: "#141c26", water: "#335f88", building: "#34425a", buildingTop: "#5a6d8c" },
  kazan: { background: "#16181a", water: "#1c5a5c", building: "#35302b", buildingTop: "#5b5145" },
  neutre: { background: mapColors.background, water: mapColors.water, building: mapColors.building, buildingTop: mapColors.buildingTop },
} as const;

export type PaletteName = keyof typeof palettes;

/** Applies a palette; colours glide thanks to the style transition. */
export function applyPalette(map: MapLibreMap, name: PaletteName) {
  const p = palettes[name];
  const building: ExpressionSpecification = ["interpolate", ["linear"], ["get", "render_height"], 0, p.building, 60, p.buildingTop];
  if (map.getLayer("background")) map.setPaintProperty("background", "background-color", p.background);
  if (map.getLayer("water")) map.setPaintProperty("water", "fill-color", p.water);
  if (map.getLayer("building-3d")) map.setPaintProperty("building-3d", "fill-extrusion-color", building);
  if (map.getLayer("building-flat")) map.setPaintProperty("building-flat", "fill-color", p.building);
}
