import type { LonLat } from "../travel/types.ts";

/**
 * A fortress (kremlin) as fill-extrusions on the real relief: pure geometry,
 * no three.js. MapLibre lifts each extruded polygon by the terrain elevation
 * at its own centroid, so a long wall drawn as one polygon floats above the
 * slope. The wall is therefore cut into short bays: each bay steps down the
 * hill on its own, and the parts of a bay (brick, merlon, roof) share its
 * centroid so they stay stacked. Tower roofs are stacked tiers scaled around
 * the tower's centroid (a pyramid or a cone, depending on the footprint).
 *
 * Two tower styles:
 * - "roof" (Nizhny): the OSM body under a wooden hip roof, on the relief;
 * - "tent" (Moscow): the OSM tiers themselves (base and height of each part,
 *   flat ground), the highest one turned into a green tent roof, crowned by a
 *   ruby star on the five towers that carry one, or a gilded spire.
 */

export type FortressTower = {
  id: string;
  fr: string;
  ru: string;
  /** Roof height in metres when OSM tags it (roof:height). */
  roofM?: number;
  /** Total height (OSM height tag), star included. */
  heightM?: number;
  /** Crowned by a ruby star (Spasskaïa, Nikolskaïa, Troïtskaïa, Borovitskaïa, Vodovzvodnaïa). */
  star?: boolean;
  /** A secondary tower: modelled, but its name is not shown on the map. */
  minor?: boolean;
  /** OSM building parts: footprint, base (tiers) and top height. */
  parts: { min?: number; h: number; ring: LonLat[] }[];
};

export type Fortress = {
  id: string;
  /** Wall centre line (closed or not). */
  ring: LonLat[];
  /** A generated wall (Nizhny); absent when the OSM wall is kept (Moscow). */
  wall?: { thickness: number; height: number; merlon: number; bay: number; covered: boolean };
  style: "roof" | "tent";
  /** What the model replaces in OSM: the wall and its towers, or the towers only. */
  replaces: "wall" | "towers";
  colors: { brick: string; roof: string; ridge: string; wood: string; gold: string; star?: string };
  dropM?: number;
  towers: FortressTower[];
};

export type FortressFeature = {
  type: "Feature";
  properties: { base: number; height: number; color: string; part: "wall" | "merlon" | "roof" | "tower" | "spire" | "finial" | "star" };
  geometry: { type: "Polygon"; coordinates: [number, number][][] };
};

type XY = [number, number];

const R = 6371008.8;
const rad = Math.PI / 180;
const ROOF_TIERS = 7;
/** Eaves: the lowest roof tier overhangs the tower body. */
const EAVES = 1.14;

export function frame(origin: LonLat) {
  const kx = Math.cos(origin[1] * rad) * R * rad;
  const ky = R * rad;
  return {
    toXY: (p: LonLat): XY => [(p[0] - origin[0]) * kx, (p[1] - origin[1]) * ky],
    toLonLat: (p: XY): [number, number] => [+(origin[0] + p[0] / kx).toFixed(7), +(origin[1] + p[1] / ky).toFixed(7)],
  };
}

export function area(ring: XY[]): number {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!, b = ring[(i + 1) % ring.length]!;
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s / 2);
}

/** Centroid as MapLibre computes it for terrain: the mean of the closed ring's points (first point counted twice). */
export function closedMean(ring: XY[]): XY {
  const pts = [...ring, ring[0]!];
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

export function buildFortress(f: Fortress): { type: "FeatureCollection"; features: FortressFeature[] } {
  const origin = f.ring[0]!;
  const { toXY, toLonLat } = frame(origin);
  const features: FortressFeature[] = [];
  const push = (ring: XY[], base: number, height: number, color: string, part: FortressFeature["properties"]["part"]) => {
    const coords = ring.map(toLonLat);
    features.push({ type: "Feature", properties: { base: +base.toFixed(2), height: +height.toFixed(2), color, part }, geometry: { type: "Polygon", coordinates: [[...coords, coords[0]!]] } });
  };

  // ── Towers ────────────────────────────────────────────────────────────
  const discs: { c: XY; r: number }[] = [];
  const square = (c: XY, e: number): XY[] => [[c[0] - e, c[1] - e], [c[0] + e, c[1] - e], [c[0] + e, c[1] + e], [c[0] - e, c[1] + e]];
  const scaled = (ring: XY[], c: XY, k: number) => ring.map((q): XY => [c[0] + (q[0] - c[0]) * k, c[1] + (q[1] - c[1]) * k]);
  if (f.style === "tent") {
    for (const t of f.towers) {
      const all = t.parts.map((p) => ({ min: p.min ?? 0, h: p.h, ring: p.ring.map(toXY) })).map((p) => ({ ...p, a: area(p.ring) }));
      const H = t.heightM ?? Math.max(...all.map((p) => p.h));
      // The full-height outline of a tower mapped in parts would box the tiers in.
      const tiers = all.length > 1 ? all.filter((p) => !(p.min === 0 && p.h >= H - 1)) : all;
      for (const p of all) discs.push({ c: closedMean(p.ring), r: Math.sqrt(p.a / Math.PI) });
      const tent = [...tiers].filter((p) => p.a >= 4 && p.min > 0).sort((a, b) => b.h - a.h)[0];
      for (const p of tiers) if (p !== tent) push(p.ring, p.min, p.h, f.colors.brick, "tower");
      if (!tent) continue;
      const c = closedMean(tent.ring);
      const crown = t.star ? 3.4 : 2.2;
      const top = Math.min(tent.h, H - (t.star ? crown : 0));
      const n = 8;
      for (let k = 0; k < n; k++) {
        push(scaled(tent.ring, c, 1.04 * (1 - k / n) + 0.04), tent.min + ((top - tent.min) * k) / n, tent.min + ((top - tent.min) * (k + 1)) / n, k === n - 1 ? f.colors.ridge : f.colors.roof, "roof");
      }
      if (t.star) {
        // The ruby star, seen from the city: a small bright diamond on the spire.
        const s0 = top + 0.3;
        push(square(c, 0.45), top, s0, f.colors.gold, "finial");
        push(square(c, 0.55), s0, s0 + 0.9, f.colors.star ?? "#ff3048", "star");
        push(square(c, 1.25), s0 + 0.9, s0 + 2.1, f.colors.star ?? "#ff3048", "star");
        push(square(c, 0.55), s0 + 2.1, s0 + 3.0, f.colors.star ?? "#ff3048", "star");
      } else {
        push(square(c, 0.35), top, top + crown, f.colors.gold, "finial");
      }
    }
  }
  for (const t of f.style === "roof" ? f.towers : []) {
    const parts = t.parts.map((p) => ({ h: p.h, ring: p.ring.map(toXY) })).map((p) => ({ ...p, a: area(p.ring) }));
    const main = [...parts].filter((p) => p.a >= 60).sort((a, b) => b.h - a.h)[0] ?? [...parts].sort((a, b) => b.a - a.a)[0];
    if (!main) continue;
    const H = main.h;
    const roofH = t.roofM ?? Math.round(0.35 * H);
    const eave = H - roofH;
    for (const p of parts) {
      discs.push({ c: closedMean(p.ring), r: Math.sqrt(p.a / Math.PI) });
      if (p === main) push(p.ring, 0, eave, f.colors.brick, "tower");
      else if (Math.abs(p.a - main.a) < main.a * 0.05) continue; // same footprint, another OSM layer
      else if (p.h > H) push(p.ring, eave, p.h, f.colors.wood, "spire"); // lantern or wooden top above the roof
      else push(p.ring, 0, Math.min(p.h, eave), f.colors.brick, "tower");
    }
    // Roof: tiers scaled around the MapLibre centroid, so every tier sits at the same elevation.
    const c = closedMean(main.ring);
    for (let k = 0; k < ROOF_TIERS; k++) {
      const s = EAVES * (1 - k / ROOF_TIERS);
      const ring = main.ring.map((q): XY => [c[0] + (q[0] - c[0]) * s, c[1] + (q[1] - c[1]) * s]);
      push(ring, eave + (k * roofH) / ROOF_TIERS, eave + ((k + 1) * roofH) / ROOF_TIERS, k === ROOF_TIERS - 1 ? f.colors.ridge : f.colors.roof, "roof");
    }
    const e = 0.4;
    push([[c[0] - e, c[1] - e], [c[0] + e, c[1] - e], [c[0] + e, c[1] + e], [c[0] - e, c[1] + e]], H, H + 2.4, f.colors.gold, "finial");
  }

  // ── Wall, bay by bay ──────────────────────────────────────────────────
  if (!f.wall) return { type: "FeatureCollection", features };
  const line = f.ring.map(toXY);
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1]! + Math.hypot(line[i]![0] - line[i - 1]![0], line[i]![1] - line[i - 1]![1]));
  const total = cum[cum.length - 1]!;
  const at = (d: number): XY => {
    const x = Math.min(total, Math.max(0, d));
    let i = cum.findIndex((s) => s >= x);
    if (i <= 0) i = 1;
    const u = (x - cum[i - 1]!) / Math.max(1e-9, cum[i]! - cum[i - 1]!);
    const a = line[i - 1]!, b = line[i]!;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  };
  const rect = (c: XY, u: XY, halfL: number, halfT: number): XY[] => {
    const v: XY = [-u[1], u[0]];
    return [
      [c[0] - u[0] * halfL - v[0] * halfT, c[1] - u[1] * halfL - v[1] * halfT],
      [c[0] + u[0] * halfL - v[0] * halfT, c[1] + u[1] * halfL - v[1] * halfT],
      [c[0] + u[0] * halfL + v[0] * halfT, c[1] + u[1] * halfL + v[1] * halfT],
      [c[0] - u[0] * halfL + v[0] * halfT, c[1] - u[1] * halfL + v[1] * halfT],
    ];
  };
  const { thickness: T, height: H, merlon, bay, covered } = f.wall;
  const top = H + merlon;
  for (let d = bay / 2; d < total; d += bay) {
    const c = at(d);
    if (discs.some((t) => Math.hypot(c[0] - t.c[0], c[1] - t.c[1]) < t.r + 1)) continue;
    const a = at(d - bay / 2), b = at(d + bay / 2);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1e-6) continue;
    const u: XY = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    push(rect(c, u, bay / 2 + 0.3, T / 2), 0, H, f.colors.brick, "wall");
    push(rect(c, u, bay * 0.28, T / 2), H, top, f.colors.brick, "merlon");
    if (covered) {
      push(rect(c, u, bay / 2 + 0.05, T / 2 + 0.9), top, top + 0.8, f.colors.roof, "roof");
      push(rect(c, u, bay / 2 + 0.05, T / 2 - 1.2), top + 0.8, top + 1.6, f.colors.ridge, "roof");
    }
  }
  return { type: "FeatureCollection", features };
}

/** Distance in metres from a point to the wall centre line (used to hide the OSM parts the model replaces). */
export function distanceToWall(f: Pick<Fortress, "ring">, p: LonLat): number {
  const { toXY } = frame(f.ring[0]!);
  const q = toXY(p);
  const line = f.ring.map(toXY);
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!, b = line[i]!;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy));
  }
  return best;
}

/** Label anchor of a tower: the centre of its main part. */
export function towerAnchor(t: FortressTower): LonLat {
  const ring = t.parts[0]!.ring;
  return [ring.reduce((s, p) => s + p[0], 0) / ring.length, ring.reduce((s, p) => s + p[1], 0) / ring.length];
}

/** Where the towers stand (centre, radius in metres): the OSM parts there are replaced by the model. */
export function towerDiscs(f: Fortress): { at: LonLat; r: number }[] {
  return f.towers.map((t) => {
    const pts = t.parts.flatMap((q) => q.ring);
    const at: LonLat = [pts.reduce((s, q) => s + q[0], 0) / pts.length, pts.reduce((s, q) => s + q[1], 0) / pts.length];
    const { toXY } = frame(at);
    return { at, r: Math.max(...pts.map((q) => Math.hypot(...toXY(q)))) + 2 };
  });
}
