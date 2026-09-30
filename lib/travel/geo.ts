import type { LonLat } from "./types";

/**
 * Pure geographic helpers, safe on the server and in the browser.
 * Every distance shown on the site comes from here or from lib/geo.ts.
 */

const EARTH_RADIUS_KM = 6371.0088;
const rad = Math.PI / 180;

export function haversineKm(a: LonLat, b: LonLat): number {
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function lineKm(path: readonly LonLat[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += haversineKm(path[i - 1]!, path[i]!);
  return total;
}

/** Point at fraction `t` (0–1) of a polyline, by distance. */
export function pointAlong(path: readonly LonLat[], t: number): LonLat {
  if (path.length === 0) throw new Error("empty path");
  if (t <= 0 || path.length === 1) return path[0]!;
  const total = lineKm(path);
  let target = Math.min(1, t) * total;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!, b = path[i]!;
    const seg = haversineKm(a, b);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= seg;
  }
  return path[path.length - 1]!;
}

/** The part of a polyline up to fraction `t`, for progressive drawing. */
export function sliceAlong(path: readonly LonLat[], t: number): LonLat[] {
  if (t >= 1) return [...path];
  const total = lineKm(path);
  let target = Math.max(0, t) * total;
  const out: LonLat[] = [path[0]!];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!, b = path[i]!;
    const seg = haversineKm(a, b);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      return out;
    }
    out.push(b);
    target -= seg;
  }
  return out;
}

/** Great-circle arc between two points, for flights. */
export function greatCircle(a: LonLat, b: LonLat, steps = 64): LonLat[] {
  const [l1, p1] = [a[0] * rad, a[1] * rad];
  const [l2, p2] = [b[0] * rad, b[1] * rad];
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  if (d === 0) return [a, b];
  const out: LonLat[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    out.push([Math.atan2(y, x) / rad, Math.atan2(z, Math.sqrt(x * x + y * y)) / rad]);
  }
  return out;
}

/** Initial great-circle bearing from a to b, in degrees clockwise from north. */
export function bearingDeg(a: LonLat, b: LonLat): number {
  const [l1, p1, l2, p2] = [a[0] * rad, a[1] * rad, b[0] * rad, b[1] * rad];
  const y = Math.sin(l2 - l1) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(l2 - l1);
  return ((Math.atan2(y, x) / rad) + 360) % 360;
}

/**
 * A smooth curve through control points (uniform Catmull-Rom, in
 * lon/lat). For stylised routes only: never presented as a real track.
 */
export function smoothPath(points: readonly LonLat[], stepsPerSegment = 24): LonLat[] {
  if (points.length < 3) return [...points];
  const out: LonLat[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!, p1 = points[i]!, p2 = points[i + 1]!, p3 = points[Math.min(points.length - 1, i + 2)]!;
    for (let k = 0; k < stepsPerSegment; k++) {
      const t = k / stepsPerSegment, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]!);
  return out;
}

export function bbox(points: readonly LonLat[]): [LonLat, LonLat] {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

/** "55.7527° N, 37.6232° E" */
export function formatLonLat([lon, lat]: LonLat): string {
  return `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  return `${km.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}
