/**
 * S07 · Russie aujourd'hui. Every statement says what kind of information it
 * is and where it comes from. "terrain" items currently rely on public
 * reporting; the founder should confirm or replace them with first-hand
 * experience.
 */
export type SourceKind = "officiel" | "terrain" | "conseil";

export type TodayItem = {
  kind: SourceKind;
  text: string;
  source?: { label: string; url: string };
};

export type TodayTopic = { id: string; topic: string; items: TodayItem[] };

export const russiaToday: { checkedAt: string; topics: TodayTopic[] } = {
  checkedAt: "2026-09-29",
  topics: [
    {
      id: "avis",
      topic: "Recommandation officielle",
      items: [
        {
          kind: "officiel",
          text: "Le ministère de l'Europe et des Affaires étrangères déconseille formellement tout voyage en Russie. Il signale un risque de détention arbitraire pour les ressortissants de pays jugés « inamicaux » par les autorités russes, et des frappes de drones, y compris sur la région de Moscou.",
          source: {
            label: "France Diplomatie, fiche du 10/09/2026",
            url: "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/russie/",
          },
        },
        {
          kind: "conseil",
          text: "Lisez la fiche complète avant de décider, inscrivez-vous sur Ariane et faites confirmer par écrit que votre assurance couvre la Russie.",
        },
      ],
    },
    {
      id: "visa",
      topic: "Visa",
      items: [
        {
          kind: "officiel",
          text: "eVisa unifié : séjour jusqu'à 30 jours, validité de 120 jours, traitement en 4 jours environ. Entrée et sortie uniquement par les points de passage autorisés.",
          source: { label: "Ministère russe des Affaires étrangères", url: "https://evisa.kdmid.ru/" },
        },
        { kind: "conseil", text: "Nos quatre formats, de 7 à 28 jours, tiennent tous dans un eVisa." },
      ],
    },
    {
      id: "paiement",
      topic: "Paiement",
      items: [
        {
          kind: "terrain",
          text: "Visa, Mastercard, Apple Pay et Google Pay ne fonctionnent pas. On paie en espèces, avec des euros ou des dollars changés sur place, ou avec une carte Mir ouverte en Russie.",
          source: { label: "Guides pratiques 2026", url: "https://www.gw2ru.com/plan-your-trip/245835-payments-in-russia-2026" },
        },
        { kind: "conseil", text: "Partez avec un budget espèces complet, calculé jour par jour." },
      ],
    },
    {
      id: "connexion",
      topic: "Connexion",
      items: [
        {
          kind: "terrain",
          text: "WhatsApp est bloqué depuis février 2026 et Telegram est restreint. Les données et SMS des cartes SIM étrangères sont coupés pendant 24 h à l'arrivée, et l'Internet mobile peut être interrompu localement.",
          source: {
            label: "Mediazona, avril 2026",
            url: "https://en.zona.media/article/2026/04/07/russian_internet_censorship_2026",
          },
        },
        {
          kind: "conseil",
          text: "Tout ce qui est vital (adresses, réservations, plans, contacts) doit être disponible hors ligne.",
        },
      ],
    },
    {
      id: "transport",
      topic: "Transport",
      items: [
        {
          kind: "terrain",
          text: "Aucun vol direct depuis l'Union européenne. On passe par Istanbul, Belgrade, Erevan ou Dubaï, pour 7 à 12 h de trajet.",
        },
        { kind: "conseil", text: "Le choix de l'escale dépend aussi des points d'entrée autorisés par l'eVisa." },
      ],
    },
    {
      id: "changements",
      topic: "Ce qui change",
      items: [
        {
          kind: "conseil",
          text: "Les règles évoluent vite. Chaque information est datée ici et revérifiée avant chaque voyage que nous préparons.",
        },
      ],
    },
  ],
};
