import type { Place } from "@/lib/travel/types";

import { COORDS_WIKI, toConfirm, wiki } from "./proof.ts";

/**
 * Saint Petersburg: a VERSTE destination prepared from sources, not yet
 * lived on the ground (the founder's 2026 stay covered Moscow and Nizhny).
 * No field notes, no hours or prices until checked on official sites.
 */
export const spbPlaces: Place[] = [
  {
    id: "ermitage",
    cityId: "saint-petersbourg",
    ru: "Зимний дворец",
    fr: "Palais d'Hiver · Ermitage",
    category: "musee",
    themes: ["art", "architecture", "histoire"],
    coords: [30.31389, 59.94028],
    coordsSource: COORDS_WIKI,
    summary: "L'ancien palais impérial, au bord de la Neva, qui abrite le musée de l'Ermitage.",
    facts: [toConfirm("Principal palais impérial de Russie, sur la place du Palais.", [wiki("Зимний дворец")])],
    media: ["spb-palais-hiver-neva"],
  },
  {
    id: "place-du-palais",
    cityId: "saint-petersbourg",
    ru: "Дворцовая площадь",
    fr: "Place du Palais",
    category: "monument",
    themes: ["histoire", "architecture"],
    coords: [30.31578, 59.93903],
    coordsSource: COORDS_WIKI,
    summary: "La place principale de Saint-Pétersbourg, devant le palais d'Hiver.",
    media: ["spb-palais-hiver-neva"],
  },
  {
    id: "sauveur-sur-le-sang-verse",
    cityId: "saint-petersbourg",
    ru: "Храм Спаса на Крови",
    fr: "Église du Sauveur-sur-le-Sang-Versé",
    category: "eglise",
    themes: ["architecture", "histoire", "spiritualite"],
    coords: [30.32861, 59.94],
    coordsSource: "Wikipédia (en), coordonnées de l'article",
    summary: "Église-mémorial bâtie au bord du canal Griboïedov, là où l'empereur Alexandre II fut mortellement blessé en 1881.",
    facts: [toConfirm("Construite sur le lieu de l'attentat du 1er mars 1881 (calendrier julien) contre Alexandre II.", [wiki("Храм Спаса на Крови")])],
    media: ["spb-canal-griboiedov"],
  },
  {
    id: "forteresse-pierre-et-paul",
    cityId: "saint-petersbourg",
    ru: "Петропавловская крепость",
    fr: "Forteresse Pierre-et-Paul",
    category: "monument",
    themes: ["histoire", "architecture"],
    coords: [30.317, 59.95],
    coordsSource: COORDS_WIKI,
    summary: "La forteresse sur l'île aux Lièvres, fondée en 1703 : le premier chantier de la ville.",
    facts: [toConfirm("Fondée en 1703, elle est la plus ancienne construction de la ville.", [wiki("Петропавловская крепость")])],
    media: [],
  },
  {
    id: "isaac",
    cityId: "saint-petersbourg",
    ru: "Исаакиевский собор",
    fr: "Cathédrale Saint-Isaac",
    category: "eglise",
    themes: ["architecture", "spiritualite", "panorama"],
    coords: [30.30595, 59.93405],
    coordsSource: COORDS_WIKI,
    summary: "La plus grande église orthodoxe de Saint-Pétersbourg, sur la place Saint-Isaac.",
    media: [],
  },
  {
    id: "perspective-nevski",
    cityId: "saint-petersbourg",
    ru: "Невский проспект",
    fr: "Perspective Nevski",
    category: "rue",
    themes: ["architecture", "shopping"],
    coords: [30.315, 59.93667],
    coordsSource: COORDS_WIKI,
    summary: "L'avenue principale de la ville, de l'Amirauté à la laure Alexandre-Nevski.",
    media: [],
  },
  {
    id: "gare-moskovski-spb",
    cityId: "saint-petersbourg",
    ru: "Московский вокзал",
    fr: "Gare de Moscou",
    category: "gare",
    themes: ["transport"],
    coords: [30.36243, 59.92872],
    coordsSource: COORDS_WIKI,
    summary: "La gare d'arrivée des trains de Moscou, sur la perspective Nevski.",
    media: [],
  },
];

