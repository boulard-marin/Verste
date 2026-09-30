import { greatCircle, smoothPath } from "../../lib/travel/geo.ts";
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
const yandexSpb = secondary("Yandex Raspisaniya (horaires), relevé du 30/09/2026", "https://rasp.yandex.ru/train/moscow--saint-petersburg");
const yandexKazan = secondary("Yandex Raspisaniya (horaires), relevé du 30/09/2026", "https://rasp.yandex.ru/train/moscow--kazan");

/**
 * Moscow – Saint Petersburg: SCHEMATIC line through towns the railway serves
 * (Tver, Bologoye, Chudovo; coordinates from Russian Wikipedia). Not the track.
 */
const MOSCOW_SPB_SCHEMA: LonLat[] = smoothPath(
  [
    [37.65531, 55.77625], // Moscou, gare Leningradski
    [35.9219, 56.8578], // Tver
    [34.0736, 57.8708], // Bologoïe
    [31.6592, 59.1281], // Tchoudovo
    [30.36243, 59.92872], // Saint-Pétersbourg, gare de Moscou
  ],
  12,
);

/**
 * Moscow – Kazan: SCHEMATIC arc between the two stations only. The route of
 * the trains is not drawn: it is not verified here.
 */
const MOSCOW_KAZAN_SCHEMA: LonLat[] = smoothPath(
  [
    [37.65556, 55.77361], // Moscou, gare de Kazan
    [43.4, 56.05],
    [49.10083, 55.78806], // Kazan, gare principale
  ],
  30,
);

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
  {
    id: "train-moscou-spb",
    from: "Moscou",
    to: "Saint-Pétersbourg",
    mode: "train",
    service: "Sapsan",
    path: MOSCOW_SPB_SCHEMA,
    pathBasis: "Tracé schématique par Tver, Bologoïe et Tchoudovo",
    duration: toConfirm("3 h 47 pour le Sapsan 754А, un peu plus de 4 h pour les trains qui s'arrêtent davantage", [yandexSpb], "À recouper sur rzd.ru avant de réserver."),
    notes: ["Départ : gare Leningradski (Ленинградский вокзал). Arrivée : gare de Moscou (Московский вокзал), sur la perspective Nevski."],
  },
  {
    id: "train-moscou-kazan",
    from: "Moscou",
    to: "Kazan",
    mode: "train",
    service: "Train de nuit",
    path: MOSCOW_KAZAN_SCHEMA,
    pathBasis: "Arc schématique : le parcours ferroviaire n'est pas dessiné",
    duration: toConfirm("11 h 20 pour le 002Й « Premium », de nuit (20 h 40 → 8 h 00)", [yandexKazan], "À recouper sur rzd.ru avant de réserver."),
    notes: ["Départ : gare de Kazan à Moscou (Казанский вокзал), sur la place des Trois-Gares."],
  },
];

export function getJourney(id: string): Journey {
  const j = journeys.find((x) => x.id === id);
  if (!j) throw new Error(`Unknown journey ${id}`);
  return j;
}
