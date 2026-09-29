/** S09 · Le Carnet Verste and the support model (no WhatsApp promise). */
export const carnetContents = [
  "Itinéraire jour par jour",
  "Villes et quartiers",
  "Hébergements",
  "Trains et transferts",
  "Checklist de départ",
  "Phrases russes, avec audio",
  "Applications à installer",
  "Adresses et recommandations",
  "Paiements et budget espèces",
  "Contacts et urgences",
  "Cartes hors ligne",
  "Procédures : eVisa, arrivée, enregistrement",
];

export const supportModel = [
  {
    id: "avant",
    title: "Avant le départ",
    text: "E-mail et appels en visio, selon votre offre. C'est là que tout se prépare.",
  },
  {
    id: "pendant",
    title: "Pendant le voyage",
    text: "Un canal choisi avant le départ selon la connectivité du moment : e-mail, appel, ou messagerie encore accessible. Jamais WhatsApp, bloqué en Russie.",
  },
  {
    id: "secours",
    title: "En cas de coupure",
    text: "Numéros d'urgence, contacts consulaires et marche à suivre, déjà dans votre carnet.",
  },
  {
    id: "hors-ligne",
    title: "Sans réseau",
    text: "Votre carnet reste lisible hors ligne : en PDF dès maintenant, puis en application installable.",
  },
];

/** La Première Verste: the 25 points, grouped (docs/01, phase 8). */
export const guideGroups = [
  { title: "Les erreurs critiques", count: 5 },
  { title: "Argent et paiements", count: 4 },
  { title: "Connexion", count: 4 },
  { title: "Transports", count: 3 },
  { title: "Langue", count: 2 },
  { title: "Sécurité pratique", count: 4 },
  { title: "Arrivée et premières 24 heures", count: 3 },
];
