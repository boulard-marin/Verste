import type { Place } from "@/lib/travel/types";

import { COORDS_WIKI, toConfirm, wiki } from "./proof.ts";

const COORDS_EN = "Wikipédia (en), coordonnées de l'article";
const COORDS_OSM = "OpenStreetMap (OpenFreeMap), point d'intérêt";

/**
 * Kazan: a VERSTE destination prepared from sources, not yet lived on the
 * ground. No field notes, no hours or prices until checked on official sites.
 */
export const kazanPlaces: Place[] = [
  {
    id: "kremlin-kazan",
    cityId: "kazan",
    ru: "Казанский кремль",
    fr: "Kremlin de Kazan",
    category: "monument",
    themes: ["histoire", "architecture", "spiritualite"],
    coords: [49.10639, 55.79861],
    coordsSource: COORDS_WIKI,
    summary: "La citadelle historique de Kazan, où une mosquée et une cathédrale se font face dans la même enceinte.",
    facts: [toConfirm("La plus ancienne partie de la ville et sa citadelle.", [wiki("Казанский кремль")])],
    media: ["kazan-kremlin-koul-charif"],
  },
  {
    id: "koul-charif",
    cityId: "kazan",
    ru: "Мечеть Кул-Шариф",
    fr: "Mosquée Koul-Charif",
    category: "eglise",
    themes: ["architecture", "spiritualite"],
    coords: [49.10481, 55.79847],
    coordsSource: COORDS_EN,
    summary: "La mosquée principale de Kazan et du Tatarstan depuis 2005, dans l'enceinte du kremlin.",
    facts: [toConfirm("Grande mosquée du vendredi de la république du Tatarstan et de Kazan depuis 2005.", [wiki("Кул-Шариф")])],
    media: ["kazan-kremlin-koul-charif"],
  },
  {
    id: "annonciation-kazan",
    cityId: "kazan",
    ru: "Благовещенский собор",
    fr: "Cathédrale de l'Annonciation",
    category: "eglise",
    themes: ["architecture", "spiritualite", "histoire"],
    coords: [49.10602, 55.79985],
    coordsSource: COORDS_OSM,
    summary: "Cathédrale orthodoxe du XVIᵉ siècle, dans le même kremlin que la mosquée.",
    facts: [toConfirm("Monument de l'architecture russe du XVIᵉ siècle.", [wiki("Благовещенский собор Казанского кремля")])],
    media: [],
  },
  {
    id: "rue-bauman",
    cityId: "kazan",
    ru: "Улица Баумана",
    fr: "Rue Bauman",
    category: "rue",
    themes: ["architecture", "gastronomie", "shopping"],
    coords: [49.11041, 55.79282],
    coordsSource: COORDS_OSM,
    summary: "La grande rue en partie piétonne du centre historique, du kremlin vers la place Tukaï.",
    media: ["kazan-rue-bauman"],
  },
  {
    id: "slobode-tatare",
    cityId: "kazan",
    ru: "Старо-Татарская слобода",
    fr: "Vieux quartier tatar",
    category: "rue",
    themes: ["histoire", "architecture", "gastronomie"],
    coords: [49.115, 55.77806],
    coordsSource: COORDS_EN,
    summary: "Le quartier historique tatar, au sud du centre : maisons de bois, mosquées, tables.",
    facts: [toConfirm("L'un des quartiers historiques du centre de Kazan.", [wiki("Старо-Татарская слобода")])],
    media: [],
  },
  {
    id: "gare-kazan",
    cityId: "kazan",
    ru: "Казань-Пассажирская",
    fr: "Gare de Kazan",
    category: "gare",
    themes: ["transport"],
    coords: [49.10083, 55.78806],
    coordsSource: COORDS_EN,
    summary: "La gare principale de Kazan, où arrivent les trains de Moscou.",
    media: [],
  },
];
