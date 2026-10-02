import type { LonLat } from "@/lib/travel/types";

/**
 * Where the Saint Petersburg models stand, how they are turned, and which
 * OpenStreetMap parts they replace. Anchors, bearings and footprints come
 * from the OSM building parts served by OpenFreeMap (© OpenStreetMap
 * contributors, ODbL), read on 02/10/2026; heights from Russian Wikipedia
 * (same date). Bearing: rotation of the model's main axis, degrees clockwise
 * from east.
 */

export type MonumentPlacement = {
  id: string;
  at: LonLat;
  bearing?: number;
  replaces: { radiusM: number; minFrom?: number; around?: LonLat };
};

export const spbMonuments = {
  /** The spire of the bell tower; the nave runs east-north-east (axis bearing ≈ 65°). */
  "pierre-et-paul": { id: "pierre-et-paul", at: [30.316035, 59.950104], bearing: -24.7, replaces: { radiusM: 36, around: [30.316473, 59.950206] } },
  /** The spire, centre of the tower; the tower is square, turned 38° from the meridian. */
  amiraute: { id: "amiraute", at: [30.308585, 59.937489], bearing: -38, replaces: { radiusM: 13 } },
  /** Centre of the dome. OSM keeps the body (50 m) and the belfries; the drum, dome and lantern are replaced. */
  isaac: { id: "isaac", at: [30.306146, 59.934089], replaces: { radiusM: 22, minFrom: 49 } },
  "colonne-alexandre": { id: "colonne-alexandre", at: [30.315815, 59.939043], replaces: { radiusM: 9 } },
  /**
   * Centre of the footprint; the church runs east-south-east, bell tower on the canal (axis bearing ≈ 109°).
   * Its single OSM block may be cut by tile edges: the radius covers every piece (nearest other building: 35 m).
   */
  sauveur: { id: "sauveur", at: [30.328814, 59.940063], bearing: 19.1, replaces: { radiusM: 30, around: [30.328889, 59.940056] } },
} satisfies Record<string, MonumentPlacement>;

/** The four belfries of Saint Isaac (OSM parts, 60 m), in metres from the centre of the dome: east, south. */
export const isaacBelfries: readonly (readonly [number, number])[] = [
  [4.3, -33.5],
  [-36.8, -3.2],
  [35.4, 6.4],
  [-5.8, 36.9],
];
