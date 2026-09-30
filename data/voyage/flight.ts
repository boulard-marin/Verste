import { greatCircle, haversineKm, smoothPath } from "../../lib/travel/geo.ts";
import type { LonLat } from "../../lib/travel/types.ts";
import type { Mark } from "../../lib/voyage/types.ts";
import { route } from "../route.ts";

/**
 * The flight that opens the journey: Paris → Istanbul → Moscow, flown by a
 * small plane over the globe as the visitor scrolls.
 *
 * - Paris → Istanbul follows the great circle between the airports.
 * - Istanbul → Moscow is STYLISED: the great circle crosses Ukraine, whose
 *   airspace has been closed to civil flights since February 2022, so the
 *   drawn curve goes over the Black Sea instead. It is not the real airway
 *   and the screen says « tracé stylisé ».
 * - Distances shown are always great-circle distances between airports
 *   (« à vol d'oiseau »), computed here, never measured on the drawing.
 */

const paris = route[0]!;
const istanbul = route[1]!;
const moscou = route[2]!;

export type FlightLegId = "cdg-ist" | "ist-svo";

export type FlightLeg = { path: LonLat[]; km: number; startKm: number; basis: string };

const legCdgIst = greatCircle(paris.coords, istanbul.coords, 96);
const legIstSvo = smoothPath(
  [istanbul.coords, [32.6, 42.4], [37.2, 43.6], [39.6, 46.8], [39.3, 51.2], [38.2, 54.2], moscou.coords],
  20,
);

const km1 = haversineKm(paris.coords, istanbul.coords);
const km2 = haversineKm(istanbul.coords, moscou.coords);

export const flightLegs: Record<FlightLegId, FlightLeg> = {
  "cdg-ist": { path: legCdgIst, km: km1, startKm: 0, basis: "Grand cercle entre aéroports" },
  "ist-svo": { path: legIstSvo, km: km2, startKm: km1, basis: "Tracé stylisé par la mer Noire" },
};

export const flightTotalKm = km1 + km2;

/** The three airports, as marks on the world. */
export const flightMarks: Mark[] = [paris, istanbul, moscou].map((w) => ({
  id: w.id,
  at: w.coords,
  name: w.name,
  ru: w.id === "moscou" ? w.nameRu : undefined,
  sub: `${w.iata} · ${w.airport}`,
  kind: "airport" as const,
}));
