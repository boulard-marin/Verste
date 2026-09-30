import type { InterestId } from "@/lib/configurator/engine";
import type { ItineraryDay } from "@/lib/travel/types";

import { nijniDays } from "../travel/products-nijni.ts";

/**
 * Day templates used by the itinerary engine. Each one is a real, walkable
 * day built on the founder's week and on verified places; `tags` say which
 * interests it serves, `priority` breaks ties. Places carry their own hours
 * and closures (data/travel), which the engine checks against the dates.
 */
export type DayKind = "arrivee" | "standard" | "transfert" | "retour";

export type DayTemplate = {
  day: ItineraryDay;
  kind: DayKind;
  tags: InterestId[];
  priority: number;
  /** For transfers: from → to. */
  from?: string;
  to?: string;
};

const moscouArrivee: ItineraryDay = {
  id: "moscou-arrivee",
  cityId: "moscou",
  title: "Arriver à Moscou",
  theme: "Poser les bagages, puis la première verste à pied",
  intro: "On ne prévoit rien avant la fin d'après-midi. Puis, à l'heure dorée, une première marche du Bolchoï à la Moskova, par la place Rouge et Saint-Basile.",
  morning: [{ title: "Arrivée", text: "Vol avec escale : aucun vol direct depuis l'Union européenne. Taxi par application jusqu'à l'hôtel.", effort: 1, durationMin: 240 }],
  afternoon: [{ title: "Installation et repos", text: "Dormir une heure, changer de rythme.", effort: 1, durationMin: 150 }],
  evening: [
    { title: "Le Bolchoï, la place Rouge, Saint-Basile", placeId: "saint-basile", text: "Environ deux kilomètres à pied du Bolchoï à la Moskova ; Saint-Basile vingt minutes avant le coucher du soleil.", effort: 1, durationMin: 120 },
  ],
  transport: ["Vol avec escale (Istanbul, Belgrade, Erevan, Dubaï…)", "Taxi par application jusqu'à l'hôtel", "À pied dans le centre"],
  meals: ["Dîner simple : stolovaïa ou supermarché"],
  optionalExperiences: [],
  media: ["moscou-arrivee-moscow-city", "moscou-saint-basile-minine"],
};

const moscouHistorique: ItineraryDay = {
  id: "moscou-historique",
  cityId: "moscou",
  title: "Moscou historique",
  theme: "Le Kremlin, Saint-Basile, et les stations-palais du métro",
  intro: "La journée du centre : l'enceinte du Kremlin le matin, Saint-Basile de l'intérieur l'après-midi, puis quatre stations du métro qui ressemblent à des palais.",
  morning: [{ title: "Le Kremlin", placeId: "kremlin-moscou", text: "Horaires et billets du Kremlin à vérifier sur son site officiel : non vérifiés par VERSTE à ce jour.", effort: 2, durationMin: 150 }],
  afternoon: [
    { title: "Saint-Basile, de l'intérieur", placeId: "saint-basile", text: "Billets en ligne sur le site du Musée historique d'État.", effort: 1, durationMin: 60 },
    { title: "Le jardin d'Alexandre", placeId: "jardin-alexandre", text: "Le long du mur ouest, jusqu'à la tombe du Soldat inconnu.", effort: 1, durationMin: 40 },
  ],
  evening: [
    { title: "Le métro-palais", placeId: "metro-maiakovskaia", text: "Maïakovskaïa, Biélorousskaïa, Novoslobodskaïa, Komsomolskaïa : une heure sous terre, hors des heures de pointe.", effort: 1, durationMin: 60 },
    { title: "Un soir au Bolchoï", placeId: "bolchoi", text: "Billets à réserver longtemps à l'avance, vous-même : VERSTE vous indique les dates et la marche à suivre.", effort: 1, durationMin: 180, optional: true },
  ],
  transport: ["À pied dans le centre", "Métro : lignes 2 puis 5 pour les stations-palais"],
  meals: ["Déjeuner près de la place Rouge", "Dîner dans le centre"],
  optionalExperiences: ["Un spectacle au Bolchoï"],
  media: ["moscou-kremlin-jardin-alexandre", "metro-komsomolskaia"],
};

const moscouColline: ItineraryDay = {
  id: "moscou-colline",
  cityId: "moscou",
  title: "De la colline aux vainqueurs",
  theme: "Vorobiovy Gory, le Muzeon, la Nouvelle Tretiakov, Poklonnaïa au coucher du soleil",
  intro: "La journée la plus longue : le belvédère au-dessus de la Moskova, les statues déposées du Muzeon, l'art du XXᵉ siècle, puis Poklonnaïa du soleil jusqu'à la nuit.",
  morning: [
    { title: "Vorobiovy Gory", placeId: "belvedere-vorobiovy", text: "Ligne 1 jusqu'à la station bâtie sur le pont, puis le belvédère et le gratte-ciel de l'université.", effort: 2, durationMin: 90 },
    { title: "Le Muzeon", placeId: "muzeon", text: "Les monuments soviétiques déposés après 1991, au bord de l'eau.", effort: 1, durationMin: 45 },
  ],
  afternoon: [
    { title: "La Nouvelle Tretiakov", placeId: "nouvelle-tretiakov", text: "Malevitch, Kandinsky, Chagall, le réalisme socialiste.", effort: 2, durationMin: 150 },
    { title: "Le musée de la Victoire", placeId: "musee-victoire", text: "Horaires divergents selon les sources : à reconfirmer avant la visite.", effort: 2, durationMin: 120, optional: true },
  ],
  evening: [{ title: "Poklonnaïa, du soleil à la nuit", placeId: "poklonnaia", text: "Arriver quarante minutes avant le coucher du soleil, rester jusqu'à la nuit.", effort: 1, durationMin: 90 }],
  transport: ["Métro ligne 1 (Vorobiovy Gory, Park Kultury)", "Ligne circulaire puis ligne 3 jusqu'à Park Pobedy"],
  meals: ["Déjeuner simple près de Park Kultury", "Dîner après Poklonnaïa"],
  optionalExperiences: ["Moscow City la nuit, à une station de Park Pobedy"],
  avoid: { weekdays: ["lun"], reason: "La Nouvelle Tretiakov est fermée le lundi, et le musée de la Victoire probablement aussi." },
  media: ["moscou-muzeon-armoiries", "moscou-poklonnaia-1836"],
};

const moscouEspace: ItineraryDay = {
  id: "moscou-espace",
  cityId: "moscou",
  title: "L'espace et Boulgakov",
  theme: "VDNKh, la Cosmonautique, puis les étangs du Patriarche",
  intro: "Le matin au pied du monument aux Conquérants de l'espace, l'après-midi dans l'immense parc de VDNKh, le soir au bord de l'étang où commence Le Maître et Marguerite.",
  morning: [{ title: "Le musée de la Cosmonautique", placeId: "musee-cosmonautique", text: "Spoutnik, Gagarine, Korolev, Belka et Strelka.", effort: 2, durationMin: 120 }],
  afternoon: [
    { title: "VDNKh", placeId: "vdnkh", text: "L'arche, le pavillon central, la fontaine de l'Amitié des peuples, la fusée Vostok.", effort: 2, durationMin: 180 },
    { title: "Le musée d'histoire contemporaine", placeId: "musee-histoire-contemporaine", text: "Rue Tverskaïa, si l'énergie est là.", effort: 1, durationMin: 90, optional: true },
  ],
  evening: [{ title: "Les étangs du Patriarche", placeId: "etangs-patriarche", text: "Au coucher du soleil ; relire le premier chapitre du Maître et Marguerite avant d'y aller.", effort: 1, durationMin: 60 }],
  transport: ["Métro ligne 6 (orange) jusqu'à VDNKh", "Lignes 6 puis 7 jusqu'à Pouchkinskaïa"],
  meals: ["Déjeuner à VDNKh", "Dîner autour des étangs du Patriarche"],
  optionalExperiences: ["Le Moskvarium, à VDNKh"],
  avoid: { weekdays: ["lun"], reason: "Le musée de la Cosmonautique et celui d'histoire contemporaine sont fermés le lundi." },
  media: ["moscou-vdnkh-vostok-fontaines", "moscou-etangs-patriarche"],
};

const moscouSport: ItineraryDay = {
  id: "moscou-sport",
  cityId: "moscou",
  title: "Garder son rythme",
  theme: "Une séance le matin, le couvent Novodievitchi, Moscow City la nuit",
  intro: "Pour ceux qui s'entraînent : une vraie séance le matin, une journée plus calme ensuite, et les tours de verre allumées le soir.",
  morning: [
    { title: "Séance d'entraînement", text: "Salle proche de l'hôtel. Lutte ou sambo à Moscou : club à identifier et à confirmer sur demande (non vérifié à ce jour).", effort: 3, durationMin: 120 },
  ],
  afternoon: [{ title: "Le couvent Novodievitchi", placeId: "novodievitchi", text: "Le couvent, son cimetière, l'étang face à Moscow City.", effort: 1, durationMin: 90 }],
  evening: [{ title: "Moscow City la nuit", placeId: "moscow-city", text: "Les tours, la Moskova, les reflets.", effort: 1, durationMin: 90 }],
  transport: ["Métro ligne 1 jusqu'à Sportivnaïa", "Métro jusqu'à Delovoï Tsentr le soir"],
  meals: ["Petit-déjeuner protéiné : tvorog, kéfir, pain de seigle (observé sur le terrain)", "Dîner près de Moscow City"],
  optionalExperiences: ["Une deuxième séance en fin d'après-midi"],
  media: ["sport-salle", "moscou-moscow-city-nuit"],
};

const moscouFleuve: ItineraryDay = {
  id: "moscou-fleuve",
  cityId: "moscou",
  title: "Moscou au fil de la Moskova",
  theme: "Novodievitchi, un déjeuner géorgien, le Christ-Sauveur et le pont du Patriarche",
  intro: "Une journée plus lente, au bord de l'eau : un couvent, une table géorgienne, une cathédrale et le pont d'où l'on voit le Kremlin.",
  morning: [{ title: "Le couvent Novodievitchi", placeId: "novodievitchi", text: "Le couvent et l'étang face à Moscow City.", effort: 1, durationMin: 90 }],
  afternoon: [
    { title: "Un déjeuner géorgien", text: "Khinkali et plats en sauce : une adresse choisie selon votre quartier (observé sur le terrain le 21/09).", effort: 1, durationMin: 90 },
    { title: "Le Christ-Sauveur et le pont du Patriarche", placeId: "christ-sauveur", text: "La cathédrale, puis le pont piéton et la vue sur le Kremlin.", effort: 1, durationMin: 60 },
  ],
  evening: [{ title: "Soirée libre dans le centre", text: "Ou Moscow City la nuit, si elle n'est pas déjà au programme.", effort: 1, durationMin: 90 }],
  transport: ["Métro ligne 1", "À pied au bord de la Moskova"],
  meals: ["Déjeuner géorgien", "Dîner libre"],
  optionalExperiences: [],
  media: ["moscou-novodievitchi-etang-moscow-city", "moscou-christ-sauveur"],
};

const moscouNijni: ItineraryDay = {
  ...nijniDays.arrivee,
  id: "transfert-moscou-nijni",
  title: "La Lastochka, puis Nijni",
  theme: "Quatre heures de train, puis la Volga",
};

const nijniMoscou: ItineraryDay = {
  id: "transfert-nijni-moscou",
  cityId: "moscou",
  title: "Retour à Moscou",
  theme: "La Lastochka, puis le kremlin d'Izmaïlovo",
  intro: "Le train arrive à la gare Vostotchny, à l'est de Moscou, tout près du kremlin d'Izmaïlovo : le dernier soir tombe là par pure logique de trajet.",
  morning: [{ title: "Lastochka Nijni → Moscou", text: "Arrivée à la gare Vostotchny pour les trains les plus rapides ; certains arrivent à la gare Koursky : à lire sur le billet.", effort: 1, durationMin: 230 }],
  afternoon: [{ title: "Installation", text: "Hôtel choisi en fonction de l'aéroport du lendemain.", effort: 1, durationMin: 120 }],
  evening: [
    { title: "Le kremlin d'Izmaïlovo", placeId: "kremlin-izmailovo", text: "Entrée libre ; le marché aux souvenirs voisin, selon ses jours d'ouverture.", effort: 1, durationMin: 90 },
    { title: "Dernier dîner", text: "Une grande table géorgienne, pour finir comme on a commencé.", effort: 1, durationMin: 90 },
  ],
  transport: ["Lastochka jusqu'à Vostotchny", "Métro Partizanskaïa pour Izmaïlovo"],
  meals: ["Déjeuner dans le train ou à l'arrivée", "Dîner géorgien"],
  optionalExperiences: [],
  media: ["train-lastochka", "moscou-kremlin-izmailovo"],
};

export const dayTemplates: DayTemplate[] = [
  { day: moscouArrivee, kind: "arrivee", tags: [], priority: 10 },
  { day: moscouHistorique, kind: "standard", tags: ["histoire", "architecture", "culture"], priority: 9 },
  { day: moscouColline, kind: "standard", tags: ["histoire", "culture", "architecture"], priority: 8 },
  { day: moscouEspace, kind: "standard", tags: ["histoire", "culture", "architecture", "nature"], priority: 7 },
  { day: moscouSport, kind: "standard", tags: ["sport", "sambo", "nuit"], priority: 3 },
  { day: moscouFleuve, kind: "standard", tags: ["gastronomie", "immersion", "architecture"], priority: 4 },
  { day: moscouNijni, kind: "transfert", tags: [], priority: 10, from: "moscou", to: "nijni-novgorod" },
  { day: nijniMoscou, kind: "retour", tags: [], priority: 10, from: "nijni-novgorod", to: "moscou" },
  { day: nijniDays.grandeVerste, kind: "standard", tags: ["histoire", "culture", "architecture", "gastronomie"], priority: 9 },
  { day: nijniDays.strelka, kind: "standard", tags: ["sport", "architecture", "gastronomie"], priority: 6 },
  { day: nijniDays.nature, kind: "standard", tags: ["nature", "immersion"], priority: 5 },
];
