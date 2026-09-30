import type { CityId, LonLat, Place } from "@/lib/travel/types";

import { kazanPlaces } from "./places-kazan.ts";
import { moscowPlaces } from "./places-moscou.ts";
import { allNijniPlaces } from "./places-nijni.ts";
import { spbPlaces } from "./places-spb.ts";

export const allPlaces: Place[] = [...moscowPlaces, ...allNijniPlaces, ...spbPlaces, ...kazanPlaces];

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

/**
 * Cities of the Russia Travel Map. Trust first: what was lived on the ground
 * (terrain), what VERSTE prepares from sources (destination), what comes next.
 */
export type CityStatus = "terrain" | "destination" | "a-venir";

/** The secondary palette of a city on the map (lib/map/palettes.ts). */
export type CityPalette = "moscou" | "nijni" | "spb" | "kazan" | "neutre";

export type MapCity = {
  id: CityId;
  ru: string;
  fr: string;
  coords: LonLat;
  status: CityStatus;
  line: string;
  href?: string;
  /** The train from Moscow (data/travel/journeys.ts). */
  journey?: string;
  /** Camera over the city. */
  view: { zoom: number; pitch: number; bearing: number };
  palette: CityPalette;
  /** Photo of the city panel. */
  media?: string;
};

export const mapCities: MapCity[] = [
  { id: "moscou", ru: "Москва", fr: "Moscou", coords: [37.6175, 55.75056], status: "terrain", line: "La ville où le voyage commence.", href: "/#moscou", view: { zoom: 11.8, pitch: 45, bearing: -12 }, palette: "moscou", media: "moscou-tour-spasskaia" },
  { id: "nijni-novgorod", ru: "Нижний Новгород", fr: "Nijni Novgorod", coords: [44.0075, 56.32694], status: "terrain", line: "Là où l'Oka rejoint la Volga.", href: "/destinations/nijni-novgorod", journey: "train-moscou-nijni", view: { zoom: 12.4, pitch: 52, bearing: -24 }, palette: "nijni", media: "nijni-kremlin-mur-volga" },
  { id: "saint-petersbourg", ru: "Санкт-Петербург", fr: "Saint-Pétersbourg", coords: [30.31667, 59.95], status: "destination", line: "Une ville bâtie sur l'eau, pensée pour être regardée.", journey: "train-moscou-spb", view: { zoom: 12.2, pitch: 48, bearing: 12 }, palette: "spb", media: "spb-palais-hiver-neva" },
  { id: "kazan", ru: "Казань", fr: "Kazan", coords: [49.11444, 55.79083], status: "destination", line: "Une mosquée et une cathédrale dans la même enceinte.", journey: "train-moscou-kazan", view: { zoom: 12.6, pitch: 50, bearing: -16 }, palette: "kazan", media: "kazan-kremlin-koul-charif" },
  { id: "vladimir", ru: "Владимир", fr: "Vladimir", coords: [40.4167, 56.1333], status: "a-venir", line: "Sur la ligne de Nijni Novgorod.", view: { zoom: 12, pitch: 40, bearing: 0 }, palette: "neutre" },
  { id: "serguiev-possad", ru: "Сергиев Посад", fr: "Serguiev Possad", coords: [38.1333, 56.3], status: "a-venir", line: "Au nord-est de Moscou.", view: { zoom: 12, pitch: 40, bearing: 0 }, palette: "neutre" },
  { id: "iaroslavl", ru: "Ярославль", fr: "Iaroslavl", coords: [39.85, 57.6167], status: "a-venir", line: "Sur la Volga, au nord de Moscou.", view: { zoom: 12, pitch: 40, bearing: 0 }, palette: "neutre" },
];
