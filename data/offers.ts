/**
 * Offers. Prices are the dossier's suggestion and still await the founder's
 * validation (`validated: false`); quantities too.
 */
export type Offer = {
  id: "decouverte" | "immersion" | "grand-format" | "conciergerie";
  name: string;
  duration: string;
  price: number;
  option?: boolean;
  summary: string;
  includes: string[];
  cta: { label: string; href: string };
};

export const offersMeta = {
  validated: false,
  note: "Prix de la préparation uniquement. Vols, hébergements, trains et activités sont réservés et payés par vous, directement auprès des prestataires.",
};

export const offers: Offer[] = [
  {
    id: "decouverte",
    name: "Découverte",
    duration: "7 jours",
    price: 240,
    summary: "L'essentiel : Moscou et Saint-Pétersbourg.",
    includes: [
      "Itinéraire jour par jour, 2 villes",
      "2 hébergements conseillés par ville",
      "Trains et transferts expliqués",
      "Méthode argent et budget espèces",
      "Guide eVisa pas à pas",
      "Carnet Verste et un appel de préparation",
    ],
    cta: { label: "Partir 7 jours", href: "/configurateur?duree=7" },
  },
  {
    id: "immersion",
    name: "Immersion",
    duration: "14 jours",
    price: 420,
    summary: "Le temps de sortir des capitales.",
    includes: [
      "Itinéraire jour par jour, 3 à 4 villes",
      "3 hébergements conseillés par ville, selon votre budget",
      "Réservation des trains expliquée pas à pas",
      "Plan de paiement jour par jour",
      "Relecture de votre formulaire eVisa",
      "Deux appels, suivi par e-mail pendant le voyage",
    ],
    cta: { label: "Partir 14 jours", href: "/configurateur?duree=14" },
  },
  {
    id: "grand-format",
    name: "Grand format",
    duration: "21 à 28 jours",
    price: 690,
    summary: "Le pays commence à se révéler.",
    includes: [
      "Itinéraire jour par jour, 4 à 6 villes, avec variantes",
      "Trains de nuit et vols intérieurs",
      "Quartiers commentés et adresses choisies",
      "Programme d'activités complet, sport compris",
      "Trois appels, suivi renforcé pendant le voyage",
    ],
    cta: { label: "Partir 3 à 4 semaines", href: "/configurateur?duree=21" },
  },
  {
    id: "conciergerie",
    name: "Conciergerie",
    duration: "En complément",
    price: 190,
    option: true,
    summary: "Réserver ensemble, sans rien confier.",
    includes: [
      "Réservations accompagnées en visio : vous payez, nous guidons",
      "Mise en relation avec des clubs, des guides et des partenaires",
      "Canal direct pendant le voyage, fixé avant le départ",
      "Priorité sur vos questions",
    ],
    cta: { label: "Ajouter à mon voyage", href: "/configurateur" },
  },
];
