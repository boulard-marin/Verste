import type { Highlight, Outline, Scene } from "@/lib/voyage/types";

import { kremlinNijniFigures } from "./kremlin-nijni";
import { kremlinNijni } from "./outlines";

/**
 * NIJNI NOVGOROD — the opening journey of the destination page: from above
 * the Volga down to the kremlin, the Strelka, the embankments, the forest.
 * Morning light throughout (the dawn of « De la nuit à l'aube »).
 */

export const nijniHighlights: Highlight[] = [
  { id: "kremlin-nijni", center: [44.0025, 56.32833], radiusM: 500, within: kremlinNijni, color: "#c98a6e" },
  { id: "nevski", center: [43.97118, 56.3336], radiusM: 40, color: "#e3b35c" },
  { id: "stade", center: [43.96111, 56.33639], radiusM: 170, minHeight: 10, color: "#d6e4f5" },
  { id: "volga-arena", center: [43.96694, 56.33472], radiusM: 90, minHeight: 8, color: "#d6e4f5" },
  { id: "stele", center: [44.035, 56.3275], radiusM: 60, minHeight: 12, color: "#c98a6e" },
  { id: "petchersky", center: [44.04972, 56.32278], radiusM: 110, color: "#e9d7b4" },
  { id: "sirotkine", center: [44.0128, 56.3293], radiusM: 30, color: "#e9d7b4" },
];

export const nijniOutlines: Outline[] = [{ id: "kremlin-nijni", ring: kremlinNijni }];

export const nijniScenes: Scene[] = [
  {
    id: "nijni-arrivee",
    environment: "monde",
    kicker: "Nijni Novgorod · 401 km à l'est de Moscou, à vol d'oiseau",
    title: "Deux fleuves sous un kremlin rouge",
    ru: "Нижний Новгород",
    text: "L'Oka descend du sud et rejoint la Volga au pied d'une colline. Sur la colline, un kremlin de brique ; sur la pointe de terre en face, une cathédrale ocre et deux stades.",
    camera: [
      { center: [43.99, 56.33], zoom: 9.6, pitch: 0, bearing: 0 },
      { center: [43.99, 56.33], zoom: 12.4, pitch: 35, bearing: 20 },
      { center: [43.992, 56.3302], zoom: 13.4, pitch: 52, bearing: 60 },
    ],
    night: [-1, -1],
    terrain: 1.5,
    media: ["nijni-kremlin-volga"],
    portals: [{ verb: "S'approcher", label: "Monter au kremlin", to: { scene: "nijni-kremlin" } }],
    length: 1.8,
  },
  {
    id: "nijni-kremlin",
    environment: "monde",
    kicker: "Le kremlin",
    title: "La forteresse sur la colline",
    ru: "Кремль",
    text: "Une muraille de brique sous un toit de bois dévale la colline vers la Volga. Une visite guidée suit son chemin de ronde sur 900 m environ, de la tour Dmitrievskaïa à la tour de l'Horloge.",
    camera: [
      { center: [43.992, 56.3302], zoom: 13.4, pitch: 52, bearing: 60 },
      { center: [44.003, 56.3296], zoom: 15.7, pitch: 72, bearing: 178 },
      { center: [44.0068, 56.3297], zoom: 16.5, pitch: 74, bearing: 222 },
      { center: [44.0039, 56.3287], zoom: 16.2, pitch: 75, bearing: 318 },
      { center: [43.9995, 56.3292], zoom: 15.6, pitch: 73, bearing: 292 },
    ],
    highlights: ["kremlin-nijni", "sirotkine"],
    labels: ["kremlin-nijni"],
    figures: kremlinNijniFigures,
    night: [-1, -1],
    terrain: 1.5,
    placeId: "kremlin-nijni",
    media: ["nijni-kremlin-tours"],
    portals: [
      { verb: "Suivre le fleuve", label: "Marcher La Grande Verste", to: { href: "/destinations/nijni-novgorod/la-grande-verste" } },
      { verb: "Voir", label: "La fiche du kremlin", to: { href: "/lieux/kremlin-nijni" } },
    ],
    length: 3.4,
  },
  {
    id: "nijni-strelka",
    environment: "monde",
    kicker: "La Strelka",
    title: "Là où l'Oka rejoint la Volga",
    ru: "Стрелка",
    text: "Sur la pointe, la cathédrale Alexandre-Nevski, le stade de la Coupe du monde 2018 et, depuis septembre 2026, la VOLGA Arena, patinoire du Torpedo.",
    camera: [
      { center: [43.9995, 56.3292], zoom: 15.6, pitch: 73, bearing: 292 },
      { center: [43.985, 56.331], zoom: 14.6, pitch: 62, bearing: 320 },
      { center: [43.9672, 56.3352], zoom: 15.6, pitch: 66, bearing: -40 },
    ],
    highlights: ["nevski", "stade", "volga-arena"],
    night: [-1, -1],
    terrain: 1.5,
    placeId: "cathedrale-nevski",
    media: ["nijni-cathedrale-nevski", "nijni-hockey-mise-en-jeu"],
    portals: [
      { verb: "Voir", label: "La cathédrale Alexandre-Nevski", to: { href: "/lieux/cathedrale-nevski" } },
      { verb: "Voir", label: "La VOLGA Arena", to: { href: "/lieux/volga-arena" } },
    ],
    length: 1.8,
  },
  {
    id: "nijni-quais",
    environment: "monde",
    kicker: "Le long de la Volga",
    title: "Des quais au monastère",
    text: "À l'est du kremlin, les quais mènent au parc de la Victoire, où se dresse depuis 2024 la stèle « Ville de la vaillance ouvrière », puis au monastère de l'Ascension-Petchersky.",
    camera: [
      { center: [44.012, 56.331], zoom: 14.6, pitch: 55, bearing: 70 },
      { center: [44.04, 56.3255], zoom: 15, pitch: 60, bearing: 100 },
    ],
    highlights: ["stele", "petchersky"],
    night: [-1, -1],
    terrain: 1.5,
    placeId: "parc-victoire-nijni",
    media: ["nijni-parc-victoire-stele", "nijni-monastere-petchersky"],
    portals: [
      { verb: "Voir", label: "Le parc de la Victoire", to: { href: "/lieux/parc-victoire-nijni" } },
      { verb: "Voir", label: "Le monastère Petchersky", to: { href: "/lieux/monastere-petchersky" } },
    ],
    length: 1.6,
  },
  {
    id: "nijni-foret",
    environment: "monde",
    kicker: "Au sud de la ville",
    title: "Trois lacs dans la forêt",
    ru: "Щёлоковский хутор",
    text: "Six kilomètres au sud du kremlin, la forêt de Chtcholokovski Khoutor : 333 hectares, trois lacs, de petites plages, et un musée d'architecture en bois.",
    camera: [
      { center: [44.03, 56.31], zoom: 13, pitch: 45, bearing: 150 },
      { center: [44.0106, 56.2742], zoom: 14.4, pitch: 55, bearing: 180 },
    ],
    night: [-1, -1],
    terrain: 1.5,
    placeId: "chtcholokovski",
    media: ["nijni-lacs-ponton", "nijni-lacs-roseaux"],
    portals: [{ verb: "Voir", label: "Chtcholokovski Khoutor", to: { href: "/lieux/chtcholokovski" } }],
    length: 1.6,
  },
];
