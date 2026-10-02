import type { Highlight, Mark, MetroLine, Outline, Scene } from "@/lib/voyage/types";

import { formatKm } from "../../lib/format.ts";
import { formatMinutes, sunTime } from "../../lib/sun.ts";
import { formatDistance, haversineKm, lineKm } from "../../lib/travel/geo.ts";
import { grandeVersteGeometry } from "../travel/grande-verste-geometry.ts";
import { getJourney } from "../travel/journeys.ts";

import { flightLegs, flightTotalKm } from "./flight.ts";
import { kremlinNijniFigures } from "./kremlin-nijni.ts";
import { kremlinMoscou, kremlinNijni } from "./outlines.ts";

/**
 * LE VOYAGE — Paris → Moscou → Nijni Novgorod, as the visitor lives it:
 * the flight over the globe, then the city.
 * Day to night in Moscow, the train at dawn, the Volga in the morning light:
 * « De la nuit à l'aube ». Then the Sapsan to Saint Petersburg, a VERSTE
 * destination prepared from sources (never presented as lived), under the
 * white nights. Texts state facts only; figures come from data/travel
 * (sourced, dated) or are computed on screen.
 */

const WARM = "#e9d7b4";
const TITANIUM = "#d7dde6";
const OCHRE = "#e3b35c";

export const highlights: Highlight[] = [
  { id: "kremlin", center: [37.6175, 55.7517], radiusM: 700, within: kremlinMoscou, minHeight: 8, color: "#c98a6e" },
  { id: "bolchoi", center: [37.6186, 55.76025], radiusM: 45, color: WARM },
  { id: "mgu", center: [37.53076, 55.70293], radiusM: 190, minHeight: 20, color: WARM },
  // The stylobate and the museum under the monument (the monument itself is a 3D object).
  { id: "cosmos", center: [37.639729, 55.822725], radiusM: 75, color: "#b7b1a6" },
  { id: "musee-victoire", center: [37.505, 55.7308], radiusM: 90, color: WARM },
  { id: "moscow-city", center: [37.5385, 55.7486], radiusM: 650, minHeight: 90, color: "#f2c983" },
  { id: "nevski", center: [43.97118, 56.3336], radiusM: 40, color: OCHRE },
  { id: "kremlin-nijni", center: [44.0025, 56.32833], radiusM: 500, within: kremlinNijni, color: "#c98a6e" },
  { id: "volga-arena", center: [43.96694, 56.33472], radiusM: 90, minHeight: 8, color: TITANIUM },
  // Saint Petersburg: the OSM `aquamarine` of the Winter Palace is toned down to its real green.
  { id: "palais-hiver", center: [30.314022, 59.940357], radiusM: 120, color: "#9cc7b2", osm: 0.25 },
  { id: "isaac", center: [30.306146, 59.934089], radiusM: 60, color: "#c2bcb0" },
];

export const outlines: Outline[] = [
  { id: "kremlin", ring: kremlinMoscou },
  { id: "kremlin-nijni", ring: kremlinNijni },
];

/** Metro stations drawn on the world (positions: OpenStreetMap, via OpenFreeMap tiles, 30/09/2026). */
export const metroMarks: Mark[] = [
  { id: "metro-okhotny", at: [37.61651, 55.75777], name: "Okhotny Riad", ru: "Охотный Ряд", sub: "Métro · ligne 1", kind: "metro", badge: { text: "1", color: "#e42313" } },
  { id: "metro-vorobiovy", at: [37.55929, 55.71033], name: "Vorobiovy Gory", ru: "Воробьёвы горы", sub: "Métro · ligne 1", kind: "metro", badge: { text: "1", color: "#e42313" } },
];

/** The four cities of the product, lived (terrain) or prepared from sources (destination). */
export const cityMarks: Mark[] = [
  { id: "city-moscou", at: [37.6175, 55.75056], name: "Moscou", ru: "Москва", sub: "Expérience terrain", kind: "city" },
  { id: "city-nijni", at: [44.0075, 56.32694], name: "Nijni Novgorod", ru: "Нижний Новгород", sub: "Expérience terrain", kind: "city" },
  { id: "city-spb", at: [30.31667, 59.95], name: "Saint-Pétersbourg", ru: "Санкт-Петербург", sub: "Destination VERSTE · Sapsan", kind: "city" },
  { id: "city-kazan", at: [49.11444, 55.79083], name: "Kazan", ru: "Казань", sub: "Destination VERSTE · train de nuit", kind: "city" },
];

/** Line 1 (Sokolnitcheskaïa), from Okhotny Riad to Vorobiovy Gory, southbound. */
export const metroLine1: MetroLine = {
  id: "ligne-1",
  number: "1",
  ru: "Сокольническая",
  fr: "Sokolnitcheskaïa",
  color: "#e42313",
  stations: [
    { ru: "Охотный Ряд", fr: "Okhotny Riad" },
    { ru: "Библиотека имени Ленина", fr: "Bibliothèque Lénine" },
    { ru: "Кропоткинская", fr: "Kropotkinskaïa" },
    { ru: "Парк культуры", fr: "Park Kultury" },
    { ru: "Фрунзенская", fr: "Frounzenskaïa" },
    { ru: "Спортивная", fr: "Sportivnaïa" },
    { ru: "Воробьёвы горы", fr: "Vorobiovy Gory" },
  ],
};

const legKm = (id: keyof typeof flightLegs) => formatKm(flightLegs[id].km);

// Saint Petersburg: the Sapsan's timetable (sourced, to confirm) and the white nights (computed).
const sapsan = getJourney("train-moscou-spb").duration!;
const sapsanTime = sapsan.value.match(/\d+ h \d+/)![0];
const frDate = (iso: string) => iso.split("-").reverse().join("/");
const SPB_SUN = { lon: 30.3141, lat: 59.9386 };
const sunset = sunTime("2026-06-21", SPB_SUN.lon, SPB_SUN.lat, "set")!;
const sunrise = sunTime("2026-06-22", SPB_SUN.lon, SPB_SUN.lat, "rise")!;
const SPB_MODELS = "Maquettes 3D stylisées · hauteurs : Wikipédia";

export const scenes: Scene[] = [
  // ── The flight: the plane flies as the visitor scrolls ──────────────────
  {
    id: "paris",
    environment: "monde",
    kicker: "Départ · Paris-Charles-de-Gaulle",
    title: "Paris",
    text: "Il n'y a plus de vol direct vers la Russie. Il y a toujours un chemin.",
    camera: [
      { center: [2.5479, 49.0097], zoom: 5.2, pitch: 30, bearing: 20 },
      { center: [15, 46], zoom: 3.5, pitch: 44, bearing: 55 },
      { center: [28.75, 41.28], zoom: 5.4, pitch: 42, bearing: 70 },
    ],
    vehicle: { kind: "avion", leg: "cdg-ist", fly: [0.16, 0.96], follow: true },
    marks: ["paris", "istanbul", "moscou"],
    figures: [{ value: legKm("cdg-ist"), label: "Paris → Istanbul", note: "à vol d'oiseau, calculé" }],
    media: ["trajet-hublot"],
    portals: [],
    length: 1.9,
  },
  {
    id: "istanbul",
    environment: "monde",
    kicker: "Escale",
    title: "Istanbul",
    text: "Une escale parmi d'autres : Belgrade, Erevan, Dubaï.",
    camera: [
      { center: [28.75, 41.28], zoom: 5.4, pitch: 42, bearing: 70 },
      { center: [28.75, 41.28], zoom: 6.6, pitch: 50, bearing: 24 },
    ],
    vehicle: { kind: "avion", leg: "ist-svo", park: 0, turnFrom: "cdg-ist", follow: true },
    marks: ["paris", "istanbul", "moscou"],
    media: ["trajet-hublot"],
    portals: [],
    length: 0.9,
  },
  {
    id: "cap-au-nord",
    environment: "monde",
    kicker: "Cap au nord",
    title: "Vers Moscou",
    text: "La mer Noire, puis les plaines. Le paysage change d'échelle.",
    camera: [
      { center: [28.75, 41.28], zoom: 6.6, pitch: 50, bearing: 24 },
      { center: [37, 48], zoom: 3.9, pitch: 46, bearing: 12 },
      { center: [37.41, 55.97], zoom: 7.4, pitch: 44, bearing: 0 },
    ],
    vehicle: { kind: "avion", leg: "ist-svo", fly: [0.04, 0.95], follow: true },
    marks: ["istanbul", "moscou"],
    figures: [
      { value: legKm("ist-svo"), label: "Istanbul → Moscou", note: "à vol d'oiseau, calculé" },
      { value: formatKm(flightTotalKm), label: "Depuis Paris", note: "tracé du vol stylisé" },
    ],
    media: ["trajet-hublot"],
    portals: [],
    length: 1.9,
  },
  {
    id: "moscou",
    environment: "monde",
    kicker: "Jour 1 · l'arrivée",
    title: "Moscou",
    ru: "Москва",
    text: "La ligne rouge se pose à Cheremetievo. En bas, la Moskova dessine ses boucles et la ville s'organise en anneaux autour d'un seul point.",
    camera: [
      { center: [37.41, 55.97], zoom: 7.4, pitch: 44, bearing: 0 },
      { center: [37.5, 55.86], zoom: 9.6, pitch: 30, bearing: -6 },
      { center: [37.6175, 55.7525], zoom: 11.6, pitch: 32, bearing: -10 },
    ],
    vehicle: { kind: "avion", leg: "ist-svo", park: 1 },
    marks: ["moscou"],
    media: ["moscou-arrivee-moscow-city"],
    portals: [{ verb: "S'approcher", label: "S'approcher du Kremlin", to: { scene: "kremlin" } }],
    length: 2,
  },
  {
    id: "kremlin",
    environment: "monde",
    kicker: "Jour 1 · le centre",
    title: "Le Kremlin",
    ru: "Кремль",
    text: "Une enceinte de brique sur la colline qui domine la Moskova. À l'intérieur, des cathédrales, des palais, et la résidence officielle de la présidence russe.",
    camera: [
      { center: [37.6175, 55.7525], zoom: 11.6, pitch: 32, bearing: -10 },
      { center: [37.6178, 55.7518], zoom: 14.6, pitch: 48, bearing: -20 },
      { center: [37.6185, 55.7515], zoom: 15.4, pitch: 56, bearing: -48 },
    ],
    highlights: ["kremlin"],
    labels: ["kremlin-moscou"],
    // The Kremlin as a hub: explore around it, or move on.
    hotspots: [
      { id: "place-rouge", placeId: "place-rouge", at: [37.6205, 55.7541], view: { center: [37.6203, 55.7537], zoom: 16.7, pitch: 64, bearing: -24 } },
      {
        id: "cathedrales",
        placeId: "kremlin-moscou",
        label: "Les cathédrales",
        text: "La place des Cathédrales, au cœur de l'enceinte.",
        at: [37.6172, 55.7507],
        view: { center: [37.6174, 55.7506], zoom: 17.1, pitch: 66, bearing: 30 },
      },
      { id: "jardin-alexandre", placeId: "jardin-alexandre", at: [37.6137, 55.7523], view: { center: [37.614, 55.7524], zoom: 16.9, pitch: 64, bearing: 60 } },
      {
        id: "saint-basile",
        placeId: "saint-basile",
        at: [37.6232, 55.7527],
        view: { center: [37.6228, 55.7528], zoom: 17.2, pitch: 62, bearing: -30 },
        portal: { verb: "Continuer", label: "Approcher Saint-Basile", to: { scene: "saint-basile" } },
      },
    ],
    placeId: "kremlin-moscou",
    media: ["moscou-kremlin-jardin-alexandre"],
    portals: [
      { verb: "Entrer", label: "Entrer dans Saint-Basile", to: { scene: "saint-basile" } },
      { verb: "Voir", label: "La fiche du Kremlin", to: { href: "/lieux/kremlin-moscou" } },
    ],
    length: 2.4,
  },
  {
    id: "saint-basile",
    environment: "monde",
    kicker: "Jour 1 · 18 h 20",
    title: "Saint-Basile",
    ru: "Храм Василия Блаженного",
    text: "Au bout de la place Rouge, neuf églises sur un même soubassement. L'heure dorée tombe vingt minutes avant le coucher du soleil.",
    // Far, near, around, close: the cathedral appears, turns, then shows its details.
    camera: [
      { center: [37.6185, 55.7515], zoom: 15.4, pitch: 56, bearing: -48 },
      { center: [37.6212, 55.7527], zoom: 16.5, pitch: 58, bearing: -40 },
      { center: [37.62306, 55.75249], zoom: 17.6, pitch: 63, bearing: -26 },
      { center: [37.62306, 55.75249], zoom: 17.9, pitch: 65, bearing: 24 },
      { center: [37.62306, 55.75249], zoom: 18.3, pitch: 68, bearing: 52 },
    ],
    objects: [{ id: "saint-basile", rise: [0.06, 0.34] }],
    hotspots: [
      {
        id: "eglise-centrale",
        placeId: "saint-basile",
        label: "L'église centrale",
        text: "Sous le toit en tente, l'église centrale ; huit églises à bulbes l'entourent, quatre sur les axes, quatre en diagonale.",
        at: [37.62322, 55.75267],
        view: { center: [37.62316, 55.75262], zoom: 18.8, pitch: 72, bearing: 14 },
      },
      {
        id: "plan",
        label: "Le plan vu du ciel",
        at: [37.6236, 55.7524],
        view: { center: [37.62306, 55.75249], zoom: 18.4, pitch: 20, bearing: 0 },
        portal: { verb: "Découvrir", label: "Huit autour d'un", to: { scene: "saint-basile-plan" } },
      },
    ],
    placeId: "saint-basile",
    media: ["moscou-saint-basile-minine"],
    portals: [
      { verb: "Découvrir", label: "Découvrir le plan", to: { scene: "saint-basile-plan" } },
      { verb: "Voir", label: "La fiche de Saint-Basile", to: { href: "/lieux/saint-basile" } },
    ],
    length: 3.6,
  },
  {
    id: "saint-basile-plan",
    environment: "monde",
    kicker: "Vu d'en haut",
    title: "Huit autour d'un",
    text: "D'en haut, le plan se lit enfin : une église centrale sous un toit en tente, quatre grandes églises sur les axes, quatre petites en diagonale. La photo ne le montre pas ; le ciel, si.",
    camera: [
      { center: [37.62306, 55.75249], zoom: 17.9, pitch: 66, bearing: 38 },
      { center: [37.62306, 55.75249], zoom: 18.4, pitch: 0, bearing: 0 },
    ],
    placeId: "saint-basile",
    media: ["moscou-saint-basile-heure-doree"],
    portals: [{ verb: "Ressortir", label: "Ressortir vers le Bolchoï", to: { scene: "bolchoi" } }],
    length: 1.6,
  },
  {
    id: "bolchoi",
    environment: "monde",
    kicker: "Jour 1 · 17 h",
    title: "Le Bolchoï",
    ru: "Большой театр",
    text: "On remonte la place Rouge, on longe le Manège, et la place des Théâtres s'ouvre : le portique du Bolchoï et son quadrige.",
    camera: [
      { center: [37.62306, 55.75249], zoom: 18.4, pitch: 0, bearing: 0 },
      { center: [37.6202, 55.7555], zoom: 15.4, pitch: 50, bearing: -20 },
      { center: [37.6186, 55.7596], zoom: 17, pitch: 62, bearing: -8 },
    ],
    highlights: ["bolchoi"],
    placeId: "bolchoi",
    media: ["moscou-bolchoi"],
    portals: [
      { verb: "Descendre", label: "Descendre dans le métro", to: { scene: "entree-metro" } },
      { verb: "Voir", label: "La fiche du Bolchoï", to: { href: "/lieux/bolchoi" } },
    ],
    length: 2,
  },
  {
    id: "entree-metro",
    environment: "monde",
    kicker: "Jour 1 · la surface",
    title: "Descendre",
    ru: "Охотный Ряд",
    text: "Okhotny Riad, ligne 1 : la station est juste sous nos pieds.",
    camera: [
      { center: [37.6186, 55.7596], zoom: 17, pitch: 62, bearing: -8 },
      { center: [37.6172, 55.7584], zoom: 18, pitch: 68, bearing: 150 },
      { center: [37.61651, 55.75777], zoom: 19.4, pitch: 74, bearing: 170 },
    ],
    marks: ["metro-okhotny"],
    transition: { out: "dark" },
    portals: [{ verb: "Descendre", label: "Prendre l'escalator", to: { scene: "metro" } }],
    length: 1.3,
  },
  {
    id: "metro",
    environment: "metro",
    kicker: "Sous Moscou",
    title: "Le métro",
    ru: "Метро",
    text: "La surface disparaît. On descend, longtemps. En bas, la station s'ouvre comme un palais.",
    media: ["moscou-escalator-park-pobedy", "metro-maiakovskaia", "metro-komsomolskaia", "metro-novoslobodskaia"],
    transition: { in: "dark" },
    portals: [{ verb: "Partir", label: "Prendre la ligne 1", to: { scene: "metro", at: 0.56 } }],
    length: 6.6,
  },
  {
    id: "vorobiovy-gory",
    environment: "monde",
    kicker: "Jour 2 · la colline",
    title: "Vorobiovy Gory",
    ru: "Воробьёвы горы",
    text: "La station est bâtie sur le pont qui franchit la Moskova. On ressort dans la lumière, on monte au belvédère : la ville en face, et derrière soi le gratte-ciel de l'université.",
    camera: [
      { center: [37.5592, 55.7103], zoom: 17.2, pitch: 72, bearing: 200 },
      { center: [37.548, 55.709], zoom: 15, pitch: 64, bearing: 225 },
      { center: [37.5335, 55.7043], zoom: 16, pitch: 66, bearing: 240 },
    ],
    highlights: ["mgu"],
    marks: ["metro-vorobiovy"],
    transition: { in: "light" },
    placeId: "belvedere-vorobiovy",
    portals: [{ verb: "Partir", label: "Ligne 1 jusqu'à Park Kultury", to: { scene: "muzeon" } }],
    length: 2,
  },
  {
    id: "muzeon",
    environment: "monde",
    kicker: "Jour 2 · les statues",
    title: "Muzeon",
    ru: "Музеон",
    text: "Au bord de la Moskova, un parc où ont été rassemblés des monuments soviétiques déposés après 1991. À côté, la Nouvelle Tretiakov et l'art russe du XXᵉ siècle.",
    camera: [
      { center: [37.5935, 55.7355], zoom: 15, pitch: 40, bearing: 30 },
      { center: [37.6072, 55.7352], zoom: 16.4, pitch: 58, bearing: 60 },
    ],
    placeId: "muzeon",
    media: ["moscou-muzeon-armoiries", "moscou-muzeon-alignement", "moscou-pont-patriarche"],
    portals: [
      { verb: "Voir", label: "La fiche du Muzeon", to: { href: "/lieux/muzeon" } },
      { verb: "Partir", label: "Vers VDNKh et l'espace", to: { scene: "vdnkh" } },
    ],
    length: 1.8,
  },
  {
    id: "vdnkh",
    environment: "monde",
    kicker: "Jour 3 · l'espace",
    title: "VDNKh",
    ru: "ВДНХ",
    text: "Un sillage de titane poli, haut de 107 m, une fusée à son sommet : le monument aux Conquérants de l'espace, et à son pied le musée de la Cosmonautique. Plus loin, les pavillons, les fontaines, la fusée Vostok.",
    camera: [
      { center: [37.6405, 55.8205], zoom: 15.4, pitch: 45, bearing: -20 },
      { center: [37.6396, 55.8226], zoom: 16.8, pitch: 62, bearing: 60 },
      { center: [37.63968, 55.82262], zoom: 17.05, pitch: 66, bearing: 95 },
      { center: [37.6285, 55.8305], zoom: 15.6, pitch: 55, bearing: -60 },
    ],
    highlights: ["cosmos"],
    // The launch, replayed: the trail is drawn upwards, the rocket rides its tip.
    objects: [{ id: "cosmos", rise: [0.08, 0.62] }],
    figures: [
      { value: "107 m", label: "Le monument", note: "Wikipédia (ru), lu le 02/10/2026" },
      { value: "11 m", label: "La fusée", note: "au sommet du sillage, même source" },
    ],
    modelNote: "Maquette 3D d'après OpenStreetMap",
    placeId: "vdnkh",
    media: ["moscou-vdnkh-vostok-fontaines", "moscou-vdnkh-arche-coucher", "moscou-vdnkh-pavillon-central"],
    portals: [
      { verb: "Voir", label: "Le musée de la Cosmonautique", to: { href: "/lieux/musee-cosmonautique" } },
      { verb: "Partir", label: "Jusqu'à Poklonnaïa, au coucher du soleil", to: { scene: "poklonnaia" } },
    ],
    length: 2.2,
  },
  {
    id: "poklonnaia",
    environment: "monde",
    kicker: "Jour 3 · 18 h 36 → 19 h 40",
    title: "Du soleil à la nuit",
    ru: "Поклонная гора",
    text: "Poklonnaïa, le soleil vient de se coucher. Le bleu fonce, saint Georges s'éclaire, Moscow City s'allume à l'horizon. Chaque image porte son heure réelle.",
    camera: [
      { center: [37.5075, 55.7322], zoom: 15.6, pitch: 55, bearing: 70 },
      { center: [37.5062, 55.7315], zoom: 16.6, pitch: 68, bearing: 95 },
    ],
    highlights: ["musee-victoire"],
    night: [0.1, 1],
    placeId: "poklonnaia",
    media: ["moscou-poklonnaia-1836", "moscou-saint-georges-heure-bleue", "moscou-skyline-poklonnaia-1923", "moscou-fontaines-rouges-1938"],
    mediaTimes: ["18 h 36", "19 h 09", "19 h 23", "19 h 38"],
    portals: [
      { verb: "Voir", label: "La fiche de Poklonnaïa", to: { href: "/lieux/poklonnaia" } },
      { verb: "Partir", label: "Vers les tours de Moscow City", to: { scene: "moscow-city" } },
    ],
    length: 3.2,
  },
  {
    id: "moscow-city",
    environment: "monde",
    kicker: "Jour 3 · la nuit",
    title: "Moscow City",
    ru: "Москва-Сити",
    text: "Une seule ville, plusieurs Russie : après les murs du Kremlin et les statues du Muzeon, les tours de verre allumées au bord de la Moskova.",
    camera: [
      { center: [37.53, 55.745], zoom: 14.6, pitch: 60, bearing: 20 },
      { center: [37.5385, 55.7484], zoom: 15.8, pitch: 68, bearing: -30 },
    ],
    highlights: ["moscow-city"],
    night: [1, 1],
    placeId: "moscow-city",
    media: ["moscou-moscow-city-nuit"],
    portals: [{ verb: "Partir", label: "Le lendemain, partir pour Nijni Novgorod", to: { scene: "train" } }],
    length: 2,
  },
  {
    id: "train",
    environment: "train",
    kicker: "Jour 4 · la Lastochka",
    title: "Moscou → Nijni Novgorod",
    ru: "Ласточка",
    text: "La gare, le quai, les portes. Puis la fenêtre : les bouleaux, les villages, les rivières. Sur la carte, la ligne rouge avance.",
    media: ["train-lastochka"],
    portals: [],
    length: 4,
  },
  {
    id: "nijni",
    environment: "monde",
    transition: { in: "light" },
    kicker: "Jour 4 · le matin",
    title: "Nijni Novgorod",
    ru: "Нижний Новгород",
    text: "Le train s'arrête sur la rive gauche de l'Oka. En face, sur la colline, le kremlin rouge ; en contrebas, l'Oka rejoint la Volga.",
    camera: [
      { center: [43.9461, 56.3219], zoom: 14.2, pitch: 50, bearing: 60 },
      { center: [43.972, 56.33], zoom: 13.6, pitch: 55, bearing: 80 },
      { center: [43.995, 56.3295], zoom: 14.6, pitch: 62, bearing: 120 },
    ],
    highlights: ["nevski", "kremlin-nijni"],
    outlines: ["kremlin-nijni"],
    night: [-0.5, -1],
    terrain: 1.5,
    media: ["nijni-kremlin-volga", "nijni-cathedrale-nevski"],
    portals: [{ verb: "S'approcher", label: "Monter au kremlin", to: { scene: "nijni-kremlin" } }],
    length: 2.4,
  },
  {
    id: "nijni-kremlin",
    environment: "monde",
    kicker: "Jour 4 · le kremlin",
    title: "La muraille descend vers la Volga",
    ru: "Нижегородский кремль",
    text: "Une muraille de brique sous un toit de bois. De la tour Dmitrievskaïa, sur la place Minine, elle dévale la colline vers la Volga, puis remonte.",
    camera: [
      { center: [43.995, 56.3295], zoom: 14.6, pitch: 62, bearing: 120 },
      { center: [44.003, 56.3296], zoom: 15.7, pitch: 72, bearing: 178 },
      { center: [44.0068, 56.3297], zoom: 16.5, pitch: 74, bearing: 222 },
      { center: [44.0039, 56.3287], zoom: 16.2, pitch: 75, bearing: 318 },
      { center: [43.9995, 56.3292], zoom: 15.6, pitch: 73, bearing: 292 },
    ],
    highlights: ["kremlin-nijni"],
    night: [-1, -1],
    terrain: 1.5,
    labels: ["kremlin-nijni"],
    figures: kremlinNijniFigures,
    placeId: "kremlin-nijni",
    media: ["nijni-kremlin-tours"],
    portals: [
      { verb: "Découvrir", label: "Découvrir Nijni Novgorod", to: { href: "/destinations/nijni-novgorod" } },
      { verb: "Suivre le fleuve", label: "Marcher La Grande Verste", to: { href: "/destinations/nijni-novgorod/la-grande-verste" } },
    ],
    length: 3.6,
  },
  {
    id: "grande-verste",
    environment: "monde",
    kicker: "Jour 5 · à pied",
    title: "La Grande Verste",
    text: "Du kremlin à la Volga, puis la ville basse : une journée à pied, en huit étapes.",
    camera: [
      { center: [43.9995, 56.3292], zoom: 15.6, pitch: 73, bearing: 292 },
      { center: [44.0045, 56.3292], zoom: 14.9, pitch: 60, bearing: 250 },
      { center: [43.998, 56.3288], zoom: 14.7, pitch: 58, bearing: 285 },
    ],
    lines: ["grande-verste"],
    night: [-1, -1],
    terrain: 1.5,
    figures: [
      { value: formatDistance(lineKm(grandeVersteGeometry)), label: "À pied", note: "itinéraire piéton calculé (OSRM)" },
      { value: "8", label: "Étapes", note: "de START à FINAL" },
    ],
    media: ["nijni-kremlin-mur-volga"],
    portals: [{ verb: "Suivre le fleuve", label: "Marcher La Grande Verste", to: { href: "/destinations/nijni-novgorod/la-grande-verste" } }],
    length: 2,
  },
  {
    id: "nijni-hockey",
    environment: "monde",
    kicker: "Jour 5 · le sport",
    title: "Le hockey",
    ru: "Хоккей",
    text: "Sur la Strelka, la VOLGA Arena, nouvelle patinoire du Torpedo. En tribune un soir de match, le 24/09.",
    camera: [
      { center: [43.998, 56.3288], zoom: 14.7, pitch: 58, bearing: 285 },
      { center: [43.972, 56.3345], zoom: 15.6, pitch: 64, bearing: 300 },
      { center: [43.9669, 56.3347], zoom: 16.4, pitch: 68, bearing: 320 },
    ],
    highlights: ["nevski", "volga-arena"],
    night: [-1, -1],
    terrain: 1.5,
    placeId: "volga-arena",
    media: ["nijni-hockey-mise-en-jeu"],
    portals: [{ verb: "Voir", label: "La VOLGA Arena", to: { href: "/lieux/volga-arena" } }],
    length: 1.6,
  },
  {
    id: "nijni-nature",
    environment: "monde",
    kicker: "Jour 6 · la forêt",
    title: "Trois lacs",
    ru: "Щёлоковский хутор",
    text: "Au sud de la ville, une forêt de 333 hectares, trois lacs et un musée d'architecture en bois.",
    camera: [
      { center: [43.9669, 56.3347], zoom: 16.4, pitch: 68, bearing: 320 },
      { center: [44.0, 56.3], zoom: 13.2, pitch: 50, bearing: 200 },
      { center: [44.0106, 56.2742], zoom: 14.4, pitch: 56, bearing: 180 },
    ],
    night: [-1, -1],
    terrain: 1.5,
    placeId: "chtcholokovski",
    media: ["nijni-lacs-ponton"],
    portals: [{ verb: "Voir", label: "Chtcholokovski Khoutor", to: { href: "/lieux/chtcholokovski" } }],
    length: 1.6,
  },
  {
    id: "et-ensuite",
    environment: "monde",
    kicker: "Et ensuite ?",
    title: "D'autres Russie",
    text: "Moscou et Nijni, vécues sur le terrain. Saint-Pétersbourg et Kazan, préparées sur sources : deux autres façons de voyager.",
    camera: [
      { center: [44.0106, 56.2742], zoom: 14.4, pitch: 56, bearing: 180 },
      { center: [41, 57], zoom: 6.2, pitch: 30, bearing: 20 },
      { center: [40, 57.6], zoom: 4.2, pitch: 20, bearing: 0 },
    ],
    lines: ["train-nijni", "train-spb", "train-kazan"],
    marks: ["city-moscou", "city-nijni", "city-spb", "city-kazan"],
    night: [-1, 0],
    portals: [
      { verb: "Continuer", label: "Vers Saint-Pétersbourg", to: { scene: "vers-saint-petersbourg" } },
      { verb: "Découvrir", label: "La Russia Travel Map", to: { href: "/carte" } },
      { verb: "Voir", label: "Kazan", to: { href: "/carte?ville=kazan" } },
    ],
    length: 2,
  },
  // ── Saint Petersburg: a VERSTE destination, prepared from sources ───────
  {
    id: "vers-saint-petersbourg",
    environment: "monde",
    kicker: "Destination VERSTE · le Sapsan",
    title: "Vers Saint-Pétersbourg",
    ru: "Сапсан",
    text: "De la gare Leningradski, à Moscou, jusqu'à la gare de Moscou, sur la perspective Nevski : un peu moins de quatre heures de train vers le nord-ouest. Le soir tombe, et ne tombera pas tout à fait.",
    camera: [
      { center: [40, 57.6], zoom: 4.2, pitch: 20, bearing: 0 },
      { center: [36.6, 56.5], zoom: 6, pitch: 42, bearing: -30 },
      { center: [33.4, 58.2], zoom: 6.4, pitch: 48, bearing: -42 },
      { center: [30.36243, 59.92872], zoom: 10.2, pitch: 44, bearing: -40 },
    ],
    vehicle: { kind: "train", leg: "msk-spb", fly: [0.1, 0.9], follow: true },
    marks: ["city-moscou", "city-spb"],
    tone: [0, 1],
    figures: [
      { value: sapsanTime, label: "Sapsan 754А", note: `relevé le ${frDate(sapsan.verification.checkedAt)}, à confirmer` },
      { value: formatKm(haversineKm(cityMarks[0]!.at, cityMarks[2]!.at)), label: "Moscou → Saint-Pétersbourg", note: "à vol d'oiseau, calculé" },
    ],
    portals: [{ verb: "Voir", label: "Le trajet sur la carte", to: { href: "/carte?ville=saint-petersbourg" } }],
    length: 2.4,
  },
  {
    id: "saint-petersbourg",
    environment: "monde",
    kicker: "Destination VERSTE · préparée sur sources",
    title: "Saint-Pétersbourg",
    ru: "Санкт-Петербург",
    text: "Fondée en 1703 dans le delta de la Neva. De la gare, la perspective Nevski file vers l'ouest jusqu'à la flèche dorée de l'Amirauté.",
    camera: [
      { center: [30.36243, 59.92872], zoom: 10.2, pitch: 44, bearing: -40 },
      { center: [30.3565, 59.9302], zoom: 14.4, pitch: 60, bearing: -74 },
      { center: [30.3385, 59.9334], zoom: 15.3, pitch: 66, bearing: -77 },
      // At the Griboyedov canal, the avenue runs on to the Admiralty spire.
      { center: [30.3215, 59.9358], zoom: 15.8, pitch: 72, bearing: -77 },
    ],
    tone: [1, 1],
    modelNote: SPB_MODELS,
    placeId: "perspective-nevski",
    media: ["spb-pierre-et-paul-aerien"],
    gallery: true,
    portals: [{ verb: "Découvrir", label: "Saint-Pétersbourg sur la carte", to: { href: "/carte?ville=saint-petersbourg" } }],
    length: 2,
  },
  {
    id: "sauveur",
    environment: "monde",
    kicker: "Destination VERSTE · le canal Griboïedov",
    title: "Le Sauveur-sur-le-Sang-Versé",
    ru: "Спас на Крови",
    text: "Au bout du canal, l'église bâtie là où Alexandre II fut mortellement blessé, en 1881. Neuf bulbes : le toit en tente central culmine à 81 m, quatre bulbes émaillés l'entourent, le clocher porte un bulbe doré.",
    camera: [
      { center: [30.3215, 59.9358], zoom: 15.8, pitch: 72, bearing: -77 },
      { center: [30.3255, 59.9368], zoom: 16.2, pitch: 62, bearing: 15 },
      { center: [30.32896, 59.94027], zoom: 17, pitch: 64, bearing: 20 },
      { center: [30.32926, 59.94004], zoom: 17.2, pitch: 66, bearing: 95 },
    ],
    tone: [1, 1],
    modelNote: SPB_MODELS,
    placeId: "sauveur-sur-le-sang-verse",
    media: ["spb-canal-griboiedov", "spb-sauveur-coupoles"],
    gallery: true,
    portals: [{ verb: "Voir", label: "La fiche du Sauveur", to: { href: "/lieux/sauveur-sur-le-sang-verse" } }],
    length: 2.6,
  },
  {
    id: "palais-d-hiver",
    environment: "monde",
    kicker: "Destination VERSTE · la place du Palais",
    title: "La place du Palais",
    ru: "Дворцовая площадь",
    text: "Au centre, la colonne Alexandre : 47,5 m avec son ange, et un fût d'un seul bloc de granit rose de 25,6 m. Au nord, le palais d'Hiver, qui abrite l'Ermitage ; au sud, l'arc de l'état-major.",
    camera: [
      { center: [30.32926, 59.94004], zoom: 17.2, pitch: 66, bearing: 95 },
      { center: [30.3215, 59.9403], zoom: 15.6, pitch: 58, bearing: -70 },
      { center: [30.3163, 59.9386], zoom: 16.7, pitch: 64, bearing: -20 },
      { center: [30.31557, 59.93917], zoom: 17.5, pitch: 68, bearing: -45 },
      { center: [30.31547, 59.93909], zoom: 17.8, pitch: 70, bearing: -75 },
    ],
    highlights: ["palais-hiver"],
    tone: [1, 1],
    hotspots: [
      { id: "ermitage", placeId: "ermitage", at: [30.3139, 59.9403], view: { center: [30.3144, 59.9396], zoom: 16.8, pitch: 62, bearing: -15 } },
      { id: "colonne", placeId: "colonne-alexandre", at: [30.31582, 59.93904], view: { center: [30.31582, 59.93896], zoom: 18.6, pitch: 72, bearing: 30 } },
    ],
    modelNote: SPB_MODELS,
    placeId: "place-du-palais",
    media: ["spb-arc-etat-major", "spb-palais-hiver-neva"],
    gallery: true,
    portals: [{ verb: "Voir", label: "Le palais d'Hiver et l'Ermitage", to: { href: "/lieux/ermitage" } }],
    length: 3,
  },
  {
    id: "la-neva",
    environment: "monde",
    kicker: "Destination VERSTE · les nuits blanches",
    title: "Deux flèches d'or",
    ru: "Белые ночи",
    text: "Sur l'autre rive, la flèche de la cathédrale Pierre-et-Paul porte un ange à 122,5 m. En face, celle de l'Amirauté, à 72 m, porte un petit navire. Fin juin, le soleil ne quitte le ciel que quelques heures.",
    camera: [
      { center: [30.31547, 59.93909], zoom: 17.8, pitch: 70, bearing: -75 },
      { center: [30.3146, 59.9433], zoom: 15.4, pitch: 62, bearing: 0 },
      { center: [30.31631, 59.95044], zoom: 16.3, pitch: 64, bearing: 22 },
      { center: [30.3125, 59.9455], zoom: 15.6, pitch: 64, bearing: 200 },
    ],
    tone: [1, 1],
    hotspots: [
      { id: "pierre-et-paul", placeId: "forteresse-pierre-et-paul", at: [30.31604, 59.9501], view: { center: [30.3163, 59.9495], zoom: 17.3, pitch: 70, bearing: 30 } },
      { id: "amiraute", placeId: "amiraute", at: [30.30859, 59.93749], view: { center: [30.3086, 59.9384], zoom: 17.2, pitch: 70, bearing: 200 } },
    ],
    figures: [
      { value: formatMinutes(sunset), label: "Coucher, 21 juin", note: "calculé, heure de Moscou" },
      { value: formatMinutes(sunrise), label: "Lever, 22 juin", note: "calculé" },
      { value: formatMinutes(sunrise + 1440 - sunset), label: "Sans soleil", note: "calculé" },
    ],
    modelNote: SPB_MODELS,
    placeId: "forteresse-pierre-et-paul",
    media: ["spb-nuit-blanche-neva", "spb-ponts-leves"],
    gallery: true,
    portals: [{ verb: "Voir", label: "La forteresse Pierre-et-Paul", to: { href: "/lieux/forteresse-pierre-et-paul" } }],
    length: 3,
  },
  {
    id: "saint-isaac",
    environment: "monde",
    kicker: "Destination VERSTE · la coupole",
    title: "Saint-Isaac",
    ru: "Исаакиевский собор",
    text: "La coupole dorée culmine à 101,5 m. À 43 m, une colonnade de 24 colonnes fait le tour du tambour : elle se visite, et toute la ville s'étend au-dessous.",
    camera: [
      { center: [30.3125, 59.9455], zoom: 15.6, pitch: 64, bearing: 200 },
      { center: [30.30845, 59.93715], zoom: 16.4, pitch: 64, bearing: 200 },
      { center: [30.3061, 59.9338], zoom: 16.8, pitch: 64, bearing: 180 },
      { center: [30.30665, 59.934], zoom: 17, pitch: 66, bearing: 110 },
    ],
    highlights: ["isaac"],
    tone: [1, 1],
    modelNote: SPB_MODELS,
    placeId: "isaac",
    media: ["spb-isaac-coupole"],
    gallery: true,
    portals: [
      { verb: "Voir", label: "La fiche de Saint-Isaac", to: { href: "/lieux/isaac" } },
      { verb: "Découvrir", label: "Saint-Pétersbourg sur la carte", to: { href: "/carte?ville=saint-petersbourg" } },
    ],
    length: 2.4,
  },

  {
    id: "votre-voyage",
    environment: "fin",
    kicker: "Et vous ?",
    title: "Et si c'était votre voyage ?",
    text: "Tout ce que vous venez de traverser, nous le préparons pour vous : l'ordre des journées, les horaires vérifiés, les trajets, les réservations que vous ferez vous-même, en connaissance de cause.",
    portals: [
      { verb: "Construire", label: "Construire mon voyage", to: { href: "/configurateur" } },
      { verb: "Voir", label: "Explorer la Russia Travel Map", to: { href: "/carte" } },
    ],
    length: 1.2,
  },
];
