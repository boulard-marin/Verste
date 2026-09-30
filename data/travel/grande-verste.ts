import type { Walk } from "@/lib/travel/types";

import { grandeVersteGeometry, grandeVersteWalkMin } from "./grande-verste-geometry.ts";
import { CHECKED } from "./proof.ts";

/**
 * LA GRANDE VERSTE — a great crossing of a city on foot. Nizhny Novgorod is
 * the first one: from the top of the city to the Volga.
 * Distances are never typed here: they are computed from the geometry.
 */
export const grandeVersteNijni: Walk = {
  id: "grande-verste-nijni",
  name: "La Grande Verste",
  cityId: "nijni-novgorod",
  subtitle: "Du haut de la ville à la Volga",
  stops: [
    {
      letter: "A",
      placeId: "place-gorki",
      title: "Place Gorki et rue Bolchaïa Pokrovskaïa",
      text: "On part de la place ronde et on remonte la grande rue piétonne : façades de marchands, la Banque d'État et son décor néo-russe, les boutiques d'artisanat pour les souvenirs.",
      stayMin: 60,
    },
    {
      letter: "B",
      placeId: "place-minine",
      title: "Place Minine et kremlin",
      text: "On entre par la tour Dmitrievskaïa et on traverse le kremlin jusqu'à la tour Saint-Georges : c'est là que la Volga apparaît. Excursion guidée sur la muraille à 12 h 30 ou 15 h 30.",
      stayMin: 75,
    },
    {
      letter: "C",
      placeId: "maison-sirotkine",
      title: "Le tableau de Minine",
      text: "Sur le quai Haut-Volga, la maison Sirotkine et, dans la salle attenante, la toile de Makovski : Minine appelle les habitants à lever une milice, en 1612.",
      stayMin: 60,
      optional: { placeId: "manoir-roukavichnikov", text: "Le manoir Roukavichnikov, quelques maisons plus loin sur le même quai.", extraKm: 0.4 },
    },
    {
      letter: "D",
      placeId: "escalier-tchkalov",
      title: "L'escalier Tchkalov",
      text: "On descend l'escalier en huit, la Volga en face pendant toute la descente, jusqu'au quai Bas-Volga.",
      stayMin: 20,
    },
    {
      letter: "E",
      placeId: "eglise-stroganov",
      title: "Église Stroganov et rue Rojdestvenskaïa",
      text: "Le long du fleuve jusqu'à l'église baroque rouge et blanc, puis retour par la rue des marchands jusqu'au dîner.",
      stayMin: 30,
    },
  ],
  geometry: grandeVersteGeometry,
  geometrySource: "Itinéraire piéton OSRM sur données OpenStreetMap, calculé le 30/09/2026",
  walkMin: grandeVersteWalkMin,
  totalDuration: "Environ 5 h 30 avec les visites",
  rhythm: "Une pause toutes les 60 à 90 minutes ; rien ne presse avant le coucher du soleil.",
  difficulty: "Modérée : pentes du centre haut, l'escalier Tchkalov pris en descente.",
  bestStart: "Départ vers 11 h : kremlin à temps pour l'excursion de 12 h 30 ou de 15 h 30, Volga au coucher du soleil.",
  transport: "Aller : métro jusqu'à Gorkovskaïa. Retour : à pied ou en taxi depuis la rue Rojdestvenskaïa.",
  pauses: ["Un café de la rue Bolchaïa Pokrovskaïa, au choix sur place", "Les bancs du kremlin face à la Volga", "Le quai Haut-Volga, entre la maison Sirotkine et l'escalier"],
  restaurantId: "restaurant-piatkine",
  sportOption: "Tôt le matin, une séance de sambo au PENTKA GYM (du lundi au samedi dès 7 h, séance d'essai à 500 ₽).",
  cultureOption: "L'excursion guidée sur la muraille du kremlin (45 min) et le manoir Roukavichnikov.",
  checkedAt: CHECKED,
};
