/**
 * Brand constants. The hero line, signature and positioning live here so a
 * copy decision is a one-line change (see docs/02-fondations-v1.md §3).
 */
const heroLines = ["Un pays immense.", "Un chemin clair."] as const;

export const site = {
  name: "Verste",
  nameRu: "Верста",
  descriptor: "Voyages en Russie, préparés sur mesure",
  heroLines,
  heroLine: heroLines.join(" "),
  manifestoTitle: "Le pays que vous croyez connaître.",
  signature: "Chaque voyage commence par une première verste.",
  positioning: "Nous préparons. Vous voyagez.",
  legalPromise: "Nous préparons. Vous réservez.",
  legalStatus:
    "Préparation de voyage et conseil. Vous réservez et payez vos prestations directement auprès des prestataires. Verste n'est pas une agence de voyages.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === "true",
  /** Date at which the practical facts shown on the site were last checked. */
  verifiedAt: "2026-09-29",
} as const;

export type NavItem = { label: string; href: string; ready: boolean };

/** Final navigation. Items appear as soon as their scene or page exists. */
export const nav: NavItem[] = [
  { label: "Le voyage", href: "/#voyage", ready: true },
  { label: "Russia Travel Map", href: "/carte", ready: true },
  { label: "Nijni Novgorod", href: "/destinations/nijni-novgorod", ready: true },
  { label: "Russie aujourd'hui", href: "/#russie-aujourdhui", ready: true },
  { label: "Offres", href: "/#offres", ready: true },
];

export const ctas = {
  build: { label: "Construire mon voyage", href: "/configurateur" },
  explore: { label: "Entrer dans le voyage", href: "/#voyage" },
} as const;

export const officialAdvice = {
  label: "Conseils aux voyageurs · Russie",
  source: "France Diplomatie",
  url: "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/russie/",
  summary:
    "Le ministère de l'Europe et des Affaires étrangères déconseille formellement tout voyage en Russie.",
  checkedAt: "2026-09-29",
} as const;
