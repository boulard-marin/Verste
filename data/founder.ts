/**
 * The founder, in his own words (provided on 30/09/2026). Credibility comes
 * from real field experience plus meticulous preparation, never from more:
 * no invented trips, no fluent Russian, no sambo expertise. Name and portrait
 * are not published.
 *
 * Trust rule: the cities lived on the ground and the cities VERSTE prepares
 * from sources are always shown apart.
 */
export const founder = {
  kicker: "Le fondateur",
  title: "Le terrain, puis la préparation.",
  field: {
    label: "Expérience terrain",
    year: "2026",
    cities: ["Moscou", "Nijni Novgorod"],
    detail: "Un séjour récent, vécu au quotidien : transports, musées, quartiers, tables, salles de sport.",
  },
  destinations: {
    label: "Destinations VERSTE",
    cities: ["Saint-Pétersbourg", "Kazan"],
    detail: "Préparées sur sources officielles et vérifiées, pas encore vécues sur le terrain.",
  },
  russian: {
    label: "Russe",
    level: "A2",
    name: "Débutant avancé",
    detail: "Environ un an d'apprentissage régulier, une pratique quotidienne, en route vers la conversation.",
  },
  sport: {
    label: "Sports de combat",
    disciplines: ["Lutte", "Grappling", "JJB"],
    focus: "Un intérêt particulier pour la lutte russe et le sambo.",
    detail: "Une partie de VERSTE est née de là : découvrir la Russie aussi par ses salles, ses clubs et sa culture sportive.",
  },
  why: {
    label: "Pourquoi VERSTE",
    lead: "Rendre la Russie compréhensible à ceux qui veulent la découvrir par eux-mêmes.",
    not: ["Pas un voyage standardisé.", "Pas une succession de lieux touristiques."],
    body: "Une vraie immersion : savoir se déplacer, où dormir, comment payer, quelles applications installer, comment se faire comprendre, où manger, quoi voir, et comment construire ses journées.",
    signature: "Nous préparons le terrain. Vous vivez le voyage.",
  },
  /** Field photos (Photographie VERSTE), shown as a strip: Moscow, the métro, Nizhny, a match. */
  photos: ["moscou-tour-spasskaia", "moscou-escalator-park-pobedy", "nijni-kremlin-volga", "nijni-hockey-mise-en-jeu"],
} as const;
