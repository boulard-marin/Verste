import type { CityId, LonLat, Place } from "@/lib/travel/types";

import { moscowPlaces } from "./places-moscou.ts";
import { allNijniPlaces } from "./places-nijni.ts";

export const allPlaces: Place[] = [...moscowPlaces, ...allNijniPlaces];

const byId = new Map(allPlaces.map((p) => [p.id, p]));

export function getPlace(id: string): Place {
  const p = byId.get(id);
  if (!p) throw new Error(`Unknown place ${id}`);
  return p;
}

export function findPlace(id: string): Place | undefined {
  return byId.get(id);
}

export function placesOf(cityId: CityId): Place[] {
  return allPlaces.filter((p) => p.cityId === cityId);
}

/** Cities shown on the Russia Travel Map. `ready` = a complete VERSTE destination. */
export type MapCity = {
  id: CityId;
  ru: string;
  fr: string;
  coords: LonLat;
  ready: boolean;
  line: string;
  href?: string;
};

export const mapCities: MapCity[] = [
  { id: "moscou", ru: "Москва", fr: "Moscou", coords: [37.6175, 55.75056], ready: true, line: "La ville où le voyage commence.", href: "/carte?ville=moscou" },
  { id: "nijni-novgorod", ru: "Нижний Новгород", fr: "Nijni Novgorod", coords: [44.0075, 56.32694], ready: true, line: "Là où l'Oka rejoint la Volga.", href: "/destinations/nijni-novgorod" },
  { id: "saint-petersbourg", ru: "Санкт-Петербург", fr: "Saint-Pétersbourg", coords: [30.31667, 59.95], ready: false, line: "Bientôt dans la carte." },
  { id: "kazan", ru: "Казань", fr: "Kazan", coords: [49.11444, 55.79083], ready: false, line: "Bientôt dans la carte." },
];
