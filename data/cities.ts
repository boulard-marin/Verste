import type { LonLat } from "./route";

/** Bronze plaque of the "Kilometre Zero", near Red Square: origin of Russian road distances. */
export const KM_ZERO: LonLat = [37.6177, 55.7557];

export type Fact = { label: string; value: string };

export const moscow = {
  id: "moscou",
  ru: "Москва",
  fr: "Moscou",
  coords: KM_ZERO,
  tagline: "La ville où le voyage commence.",
  intro:
    "C'est ici qu'on atterrit, qu'on s'équipe et qu'on prend le rythme du pays. Des tours de verre face aux murs de brique du Kremlin, un métro dont certaines stations ressemblent à des palais, et une ville qui ne s'arrête presque jamais.",
  facts: [
    { label: "Durée recommandée", value: "3 à 5 jours" },
    { label: "Rythme", value: "Soutenu. La ville est immense, les distances aussi." },
    { label: "Expériences", value: "Le métro, le parc Zariadié, les marchés couverts, la bania, un soir au théâtre." },
    {
      label: "Transport",
      value: "Métro et taxis par application. Trains rapides vers Saint-Pétersbourg et Nijni Novgorod.",
    },
  ] satisfies Fact[],
} as const;

export type Destination = {
  id: string;
  ru: string;
  fr: string;
  coords: LonLat;
  line: string;
  stay: string;
  access: string;
  idealFor: string[];
  from: string;
};

/** Travel times are indicative and must be confirmed when booking. */
export const destinations: Destination[] = [
  {
    id: "saint-petersbourg",
    ru: "Санкт-Петербург",
    fr: "Saint-Pétersbourg",
    coords: [30.3159, 59.9391],
    line: "Une ville construite sur l'eau et pensée pour être regardée. En juin, le soleil se couche à peine ; la nuit, les ponts se lèvent sur la Neva.",
    stay: "3 à 5 jours",
    access: "Train rapide depuis Moscou, environ 4 h",
    idealFor: ["Architecture", "Culture", "Nuits blanches"],
    from: "Dès 7 jours",
  },
  {
    id: "nijni-novgorod",
    ru: "Нижний Новгород",
    fr: "Nijni Novgorod",
    coords: [44.002, 56.3269],
    line: "Là où l'Oka se jette dans la Volga. Un kremlin de brique sur la colline, un téléphérique au-dessus du fleuve, et peu de voyageurs étrangers.",
    stay: "2 à 3 jours",
    access: "Train depuis Moscou, environ 4 h",
    idealFor: ["Immersion locale", "Fleuves", "Histoire"],
    from: "Dès 14 jours",
  },
  {
    id: "anneau-d-or",
    ru: "Золотое кольцо",
    fr: "L'Anneau d'or",
    coords: [40.4492, 56.4199],
    line: "Souzdal, Vladimir, Iaroslavl : des églises blanches, des maisons de bois, des champs sous la neige.",
    stay: "2 à 3 jours",
    access: "Vladimir à environ 2 h de train, Souzdal à 40 min de route",
    idealFor: ["Histoire", "Architecture", "Hiver"],
    from: "Dès 14 jours",
  },
  {
    id: "kazan",
    ru: "Казань",
    fr: "Kazan",
    coords: [49.1221, 55.7887],
    line: "La capitale du Tatarstan, où une mosquée et une cathédrale se font face dans l'enceinte du même kremlin.",
    stay: "2 à 3 jours",
    access: "Train de nuit depuis Moscou, ou environ 1 h 30 de vol",
    idealFor: ["Culture", "Gastronomie", "Sport"],
    from: "Dès 21 jours",
  },
  {
    id: "baikal",
    ru: "Байкал",
    fr: "Le Baïkal",
    coords: [104.2964, 52.287],
    line: "Le lac le plus profond du monde. En hiver, sa glace est si claire qu'on voit l'eau dessous.",
    stay: "4 à 7 jours",
    access: "Environ 6 h de vol depuis Moscou, ou plusieurs jours de Transsibérien",
    idealFor: ["Nature", "Grands espaces"],
    from: "28 jours",
  },
];

export const destinationsNote =
  "Distances à vol d'oiseau depuis le kilomètre zéro de Moscou. Temps de trajet indicatifs, à confirmer au moment de réserver.";
