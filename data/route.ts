/**
 * The route drawn on the homepage. Coordinates are the real airports, so the
 * distances computed from them (lib/geo.ts) are the ones we display.
 */
export type LonLat = readonly [lon: number, lat: number];

export type Waypoint = {
  id: "paris" | "istanbul" | "moscou";
  name: string;
  nameRu?: string;
  iata: string;
  airport: string;
  role: "depart" | "escale" | "arrivee";
  coords: LonLat;
};

export const route: readonly Waypoint[] = [
  {
    id: "paris",
    name: "Paris",
    iata: "CDG",
    airport: "Paris-Charles-de-Gaulle",
    role: "depart",
    coords: [2.5479, 49.0097],
  },
  {
    id: "istanbul",
    name: "Istanbul",
    nameRu: "Стамбул",
    iata: "IST",
    airport: "Istanbul",
    role: "escale",
    coords: [28.7519, 41.2753],
  },
  {
    id: "moscou",
    name: "Moscou",
    nameRu: "Москва",
    iata: "SVO",
    airport: "Moscou-Cheremetievo",
    role: "arrivee",
    coords: [37.4146, 55.9726],
  },
];

/** Cities hinted at the end of the scene: the journey continues from Moscow. */
export const nextStops = [
  { id: "spb", name: "Saint-Pétersbourg", nameRu: "Санкт-Петербург", coords: [30.3159, 59.9391] as LonLat },
  { id: "nn", name: "Nijni Novgorod", nameRu: "Нижний Новгород", coords: [44.002, 56.3269] as LonLat },
] as const;

export const routeNote =
  "Distances à vol d'oiseau entre aéroports. Istanbul est une escale possible parmi d'autres : Belgrade, Erevan et Dubaï sont aussi courantes.";
