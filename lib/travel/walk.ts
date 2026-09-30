import { lineKm } from "./geo.ts";
import type { Walk } from "./types.ts";

/** Walking paces the visitor can choose on La Grande Verste. */
export const paces = {
  tranquille: { label: "Tranquille", kmh: 4, stay: 1.3 },
  normal: { label: "Normal", kmh: 4.8, stay: 1 },
  soutenu: { label: "Soutenu", kmh: 5.6, stay: 0.7 },
} as const;
export type Pace = keyof typeof paces;

export type WalkLeg = { fromKm: number; km: number; walkMin: number; stayMin: number; arrive: number; leave: number };

/**
 * Distances along the real geometry between consecutive stops, and a
 * schedule from a start time (minutes after midnight) at a given pace.
 */
export function walkSchedule(walk: Walk, pace: Pace = "normal", start = 11 * 60): { legs: WalkLeg[]; totalKm: number; walkMin: number; totalMin: number } {
  const p = paces[pace];
  const legs: WalkLeg[] = [];
  let clock = start;
  let fromKm = 0;
  let walked = 0;
  walk.stops.forEach((stop, i) => {
    const prevWp = i === 0 ? 0 : walk.waypointIndex[walk.stops[i - 1]!.waypoint]!;
    const wp = walk.waypointIndex[stop.waypoint]!;
    const km = i === 0 ? 0 : lineKm(walk.geometry.slice(prevWp, wp + 1));
    const walkMin = Math.round((km / p.kmh) * 60);
    clock += walkMin;
    walked += walkMin;
    const stayMin = Math.round((stop.stayMin * p.stay) / 5) * 5;
    legs.push({ fromKm, km, walkMin, stayMin, arrive: clock, leave: clock + stayMin });
    clock += stayMin;
    fromKm += km;
  });
  return { legs, totalKm: lineKm(walk.geometry), walkMin: walked, totalMin: clock - start };
}

export function formatClock(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}
