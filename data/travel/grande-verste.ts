import type { Walk } from "@/lib/travel/types";

import { grandeVersteGeometry, grandeVersteWalkMin, grandeVersteWaypointIndex, grandeVersteWaypoints } from "./grande-verste-geometry.ts";
import { CHECKED } from "./proof.ts";

/**
 * LA GRANDE VERSTE — a great crossing of a city on foot. Nizhny Novgorod is
 * the first: from the kremlin on the hill down to the Volga. Distances and
 * times are never typed here: they are computed from the real footpath
 * geometry (lib/travel/walk.ts).
 */
export const grandeVersteNijni: Walk = {
  id: "grande-verste-nijni",
  name: "La Grande Verste",
  cityId: "nijni-novgorod",
  subtitle: "Du kremlin à la Volga",
  stops: [
    {
      label: "START",
      placeId: "place-minine",
      waypoint: 0,
      title: "Le kremlin",
      story: "On entre par la tour Dmitrievskaïa, depuis la place Minine. L'enceinte de brique suit la colline : en haut la ville, en bas les deux fleuves.",
      tip: "Réserver l'excursion guidée sur la muraille (12 h 30 ou 15 h 30, 45 min) : c'est le meilleur point de vue de la ville.",
      stayMin: 45,
      media: ["nijni-kremlin-tours", "nijni-kremlin-mur-volga"],
    },
    {
      label: "02",
      placeId: "cathedrale-archange",
      waypoint: 1,
      title: "La cathédrale",
      story: "Au cœur de l'enceinte, la cathédrale de l'Archange-Michel, entourée des pelouses et des bâtiments du kremlin.",
      tip: "Prendre le temps de faire le tour de l'enceinte intérieure avant de rejoindre la muraille est.",
      stayMin: 15,
    },
    {
      label: "03",
      placeId: "escalier-tchkalov",
      waypoint: 2,
      title: "Le panorama",
      story: "Au pied de la tour Saint-Georges, la terrasse du monument à Tchkalov : la Volga s'ouvre d'un coup, immense, et l'escalier en huit descend jusqu'au quai.",
      tip: "Rester dix minutes. Par temps clair, on voit loin sur l'autre rive.",
      stayMin: 20,
      media: ["nijni-kremlin-volga", "nijni-escalier-tchkalov"],
    },
    {
      label: "04",
      placeId: "maison-sirotkine",
      waypoint: 3,
      title: "Le musée",
      story: "Cent mètres plus loin, sur le quai Haut-Volga : la maison Sirotkine et, dans la salle attenante, L'Appel de Minine de Makovski, 698 × 594 cm.",
      tip: "Fermé le lundi. Commencer par la grande toile, avant les salles d'art européen.",
      stayMin: 60,
      media: ["nijni-tableau-makovski", "nijni-musee-salle"],
    },
    {
      label: "05",
      placeId: "rue-rojdestvenskaia",
      waypoint: 5,
      title: "Le centre",
      story: "On revient à la terrasse, on descend l'escalier Tchkalov, et l'on entre dans la ville basse : la rue Rojdestvenskaïa, ses façades de marchands, ses cafés.",
      tip: "Descendre l'escalier plutôt que le monter : la Volga reste en face pendant toute la descente.",
      stayMin: 40,
      media: ["nijni-escalier-tchkalov-volga"],
    },
    {
      label: "06",
      placeId: "restaurant-piatkine",
      waypoint: 6,
      title: "Le restaurant",
      story: "Piatkine, rue Rojdestvenskaïa : une cuisine russe classique, avec les poissons de la Volga, dans une maison de marchands.",
      tip: "Réserver pour le soir ; horaires et réservation à confirmer auprès du restaurant.",
      stayMin: 75,
    },
    {
      label: "07",
      placeId: "quai-bas-volga",
      waypoint: 7,
      title: "Le quai",
      story: "Parallèle à la rue, le quai Bas-Volga : on marche au ras de l'eau, le kremlin au-dessus de soi.",
      tip: "La fin d'après-midi est le bon moment : la lumière vient de l'ouest, sur la façade de la ville.",
      stayMin: 20,
      media: ["nijni-berges-terrasses"],
    },
    {
      label: "FINAL",
      placeId: "embarcadere-volga",
      waypoint: 8,
      title: "La Volga",
      story: "La gare fluviale, place Markine : d'ici partent les bateaux de promenade sur la Volga et l'Oka. Un peu plus loin, les deux fleuves se rejoignent.",
      tip: "Si la saison est ouverte, une heure de bateau au coucher du soleil ; sinon, le téléphérique jusqu'à Bor.",
      stayMin: 30,
      media: ["nijni-bateau-volga"],
    },
  ],
  geometry: grandeVersteGeometry,
  waypointIndex: grandeVersteWaypointIndex,
  waypoints: grandeVersteWaypoints,
  geometrySource: "Itinéraire piéton OSRM sur données OpenStreetMap, calculé le 30/09/2026",
  walkMin: grandeVersteWalkMin,
  totalDuration: "Calculée selon le rythme choisi",
  rhythm: "Une pause toutes les 60 à 90 minutes ; rien ne presse avant le coucher du soleil.",
  difficulty: "Facile à modérée : pentes du kremlin, l'escalier Tchkalov pris en descente.",
  bestStart: "Départ vers 11 h, pour l'excursion de 12 h 30 sur la muraille et la Volga en fin de journée.",
  transport: "Aller : métro jusqu'à Gorkovskaïa, puis la rue Bolchaïa Pokrovskaïa jusqu'à la place Minine. Retour : taxi ou métro depuis la place Markine.",
  pauses: ["La terrasse du monument à Tchkalov", "Un café de la rue Rojdestvenskaïa", "Les bancs du quai Bas-Volga"],
  restaurantId: "restaurant-piatkine",
  sportOption: "Tôt le matin, une séance de sambo au PENTKA GYM (du lundi au samedi dès 7 h, séance d'essai à 500 ₽).",
  cultureOption: "L'excursion guidée sur la muraille du kremlin (45 min, 800 ₽) et le manoir Roukavichnikov, sur le même quai que le musée.",
  checkedAt: CHECKED,
};
