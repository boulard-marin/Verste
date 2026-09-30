import { greatCircle } from "../../lib/travel/geo.ts";
import type { Journey, LonLat } from "@/lib/travel/types";

import { observed, secondary, toConfirm } from "./proof.ts";

const CDG: LonLat = [2.5479, 49.0097];
const IST: LonLat = [28.7519, 41.2753];
const SVO: LonLat = [37.4146, 55.9726];

/**
 * Main stations of the Moscow – Nizhny Novgorod line (coordinates from
 * Russian Wikipedia). Joining them gives an indicative route, labelled as such.
 */
const MOSCOW_NIZHNY_RAIL: LonLat[] = [
  [37.66056, 55.7575], // Moscou, gare Koursky
  [37.85583, 55.75139], // Reoutovo
  [38.00889, 55.7525], // Jeleznodorojnaïa
  [38.67472, 55.77583], // Pavlovski Possad
  [38.97639, 55.79556], // Orekhovo-Zouïevo
  [39.46306, 55.925], // Petouchki
  [40.42167, 56.12944], // Vladimir
  [41.3046, 56.3688], // Kovrov I
  [42.1686, 56.2021], // Viazniki
  [42.6925, 56.20278], // Gorokhovets
  [43.45, 56.23333], // Dzerjinsk
  [43.94607, 56.32189], // Nijni Novgorod, gare Moskovski
];

const yandex = secondary("Yandex Raspisaniya (horaires)", "https://rasp.yandex.ru/lastochka/nizhniy-novgorod--vostochny-vokzal");

export const journeys: Journey[] = [
  {
    id: "vol-paris-moscou",
    from: "Paris",
    to: "Moscou",
    mode: "avion",
    path: [...greatCircle(CDG, IST, 48), ...greatCircle(IST, SVO, 48).slice(1)],
    pathBasis: "Arcs de grand cercle entre aéroports (CDG, IST, SVO)",
    duration: observed("Aucun vol direct depuis l'Union européenne : escale obligatoire (Istanbul, Belgrade, Erevan, Dubaï…), 7 à 12 h de trajet"),
    notes: ["Istanbul est une escale possible parmi d'autres."],
  },
  {
    id: "train-moscou-nijni",
    from: "Moscou",
    to: "Nijni Novgorod",
    mode: "train",
    service: "Lastochka",
    path: MOSCOW_NIZHNY_RAIL,
    pathBasis: "Tracé indicatif par les gares principales de la ligne",
    duration: toConfirm("De 3 h 41 à 4 h 24 selon le train", [yandex], "À recouper sur rzd.ru avant de réserver."),
    notes: ["Gare de départ à Moscou : Koursky ou Vostotchny selon le train, à lire sur le billet.", "Billet nominatif : le passeport est demandé (à confirmer sur rzd.ru)."],
  },
  {
    id: "train-nijni-moscou",
    from: "Nijni Novgorod",
    to: "Moscou",
    mode: "train",
    service: "Lastochka",
    path: [...MOSCOW_NIZHNY_RAIL].reverse(),
    pathBasis: "Tracé indicatif par les gares principales de la ligne",
    duration: toConfirm("3 h 48 pour le plus rapide, jusqu'à la gare Vostotchny", [yandex], "Certains trains arrivent à la gare Koursky : à lire sur le billet."),
    notes: ["Arrivée à Vostotchny (Восточный вокзал), à l'est de Moscou, tout près du kremlin d'Izmaïlovo."],
  },
];

export function getJourney(id: string): Journey {
  const j = journeys.find((x) => x.id === id);
  if (!j) throw new Error(`Unknown journey ${id}`);
  return j;
}
