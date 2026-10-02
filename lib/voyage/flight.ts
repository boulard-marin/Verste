import { bearingDeg, pointAlong } from "../travel/geo.ts";
import type { LonLat } from "../travel/types.ts";

import type { Scene, SceneVehicle } from "./types.ts";

/**
 * The plane of the opening flight (and the Sapsan to Saint Petersburg), as a
 * pure function of scroll: where it is, where it points, how high it flies.
 * Scroll moves the vehicle itself, not a line that grows. Tested in
 * flight.test.ts.
 */

/** A leg of the journey. Legs of the same `group` (default: the flight) are planned together. */
export type Leg = { path: LonLat[]; km: number; startKm: number; basis: string; group?: string };
export type Legs = Record<string, Leg>;

export type FlightState = { at: LonLat; heading: number; altitude: number; t: number; km: number };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);
const phase = (p: number, a: number, b: number) => (b <= a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)));
/** Ease-in-out: the plane accelerates after takeoff and slows down before landing. */
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t));
const turn = (from: number, to: number, u: number) => {
  let d = to - from;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (from + d * u + 360) % 360;
};

/** Share of a leg spent climbing (and descending): the rest is cruise. */
export const CLIMB = 0.16;

export function flightState(v: SceneVehicle, local: number, legs: Legs): FlightState | null {
  const leg = legs[v.leg];
  if (!leg || leg.path.length < 2) return null;
  const parked = v.park !== undefined;
  const t = parked ? v.park! : ease(phase(local, ...(v.fly ?? [0, 1])));
  const at = pointAlong(leg.path, t);
  const altitude = parked || v.kind === "train" ? 0 : smooth(clamp01(t / CLIMB)) * smooth(clamp01((1 - t) / CLIMB));
  // Heading: along the path; at the very end, the direction of arrival.
  const e = 0.012;
  let heading = t > 1 - e ? bearingDeg(pointAlong(leg.path, t - e), at) : bearingDeg(at, pointAlong(leg.path, t + e));
  // Stopover: the plane turns on the ground, from its arrival heading to its next departure.
  const prev = v.turnFrom ? legs[v.turnFrom] : undefined;
  if (prev && prev.path.length > 1) {
    const n = prev.path.length;
    const arrival = bearingDeg(prev.path[n - 2]!, prev.path[n - 1]!);
    const departure = bearingDeg(leg.path[0]!, leg.path[1]!);
    heading = turn(arrival, departure, smooth(phase(local, 0.25, 0.8)));
  }
  return { at, heading, altitude, t, km: leg.startKm + t * leg.km };
}

/**
 * Progress of every leg for the scene being played: legs travelled by earlier
 * scenes are complete, legs of later scenes not started. The planned route of
 * the vehicle on screen (its group of legs) is dotted while it travels.
 */
export function routeProgress(scenes: Scene[], current: number, state: FlightState | null, legs: Legs) {
  const flyingScene = new Map<string, number>();
  scenes.forEach((s, i) => {
    if (s.vehicle && s.vehicle.park === undefined && !flyingScene.has(s.vehicle.leg)) flyingScene.set(s.vehicle.leg, i);
  });
  const vehicle = scenes[current]?.vehicle;
  const moving = Boolean(vehicle && (vehicle.park === undefined || vehicle.turnFrom !== undefined));
  const group = (id: string) => legs[id]?.group ?? "vol";
  return Object.entries(legs).map(([id, leg]) => {
    const at = flyingScene.get(id);
    const t = at === undefined ? 0 : current > at ? 1 : current < at ? 0 : (state?.t ?? 0);
    return { path: leg.path, t, showPlanned: moving && group(id) === group(vehicle!.leg) };
  });
}
