/**
 * Configurator engine: four answers in, a travel profile out.
 * Pure and dependency-free (runs under `node --test` as-is). No AI and no
 * hidden scoring: every rule is written below and covered by tests.
 * City ids match data/cities.ts; the UI maps them to names and coordinates.
 */

export const DURATIONS = [7, 14, 21, 28] as const;
export type Duration = (typeof DURATIONS)[number];

export const INTERESTS = [
  { id: "culture", label: "Culture", ru: "Культура" },
  { id: "histoire", label: "Histoire", ru: "История" },
  { id: "sport", label: "Sport / lutte", ru: "Борьба" },
  { id: "sambo", label: "Sambo", ru: "Самбо" },
  { id: "gastronomie", label: "Gastronomie", ru: "Кухня" },
  { id: "architecture", label: "Architecture", ru: "Архитектура" },
  { id: "nature", label: "Nature", ru: "Природа" },
  { id: "nuit", label: "Vie nocturne", ru: "Ночная жизнь" },
  { id: "immersion", label: "Immersion locale", ru: "Погружение" },
] as const;
export type InterestId = (typeof INTERESTS)[number]["id"];

export const RUSSIAN_LEVELS = [
  { id: "aucun", label: "Débutant total", help: "Je ne lis pas encore le cyrillique." },
  { id: "quelques-mots", label: "Quelques mots", help: "Bonjour, merci, l'addition." },
  { id: "debutant", label: "Débutant", help: "Je déchiffre l'alphabet." },
  { id: "conversation", label: "Conversation simple", help: "Je me débrouille pour l'essentiel." },
  { id: "intermediaire", label: "Intermédiaire", help: "Je tiens une vraie conversation." },
] as const;
export type RussianLevel = (typeof RUSSIAN_LEVELS)[number]["id"];

export const COMFORTS = [
  { id: "essentiel", label: "Essentiel", help: "Hôtels simples et bien placés, trains en 2e classe." },
  { id: "confort", label: "Confort", help: "Bons hôtels centraux, trains rapides." },
  { id: "premium", label: "Premium", help: "Adresses de caractère, 1re classe, tables choisies." },
] as const;
export type Comfort = (typeof COMFORTS)[number]["id"];

export type CityId = "moscou" | "anneau-d-or" | "nijni-novgorod" | "kazan" | "saint-petersbourg" | "baikal";

export type Answers = {
  days: Duration;
  interests: InterestId[];
  russian: RussianLevel;
  comfort: Comfort;
};

export type Profile = {
  title: string;
  days: Duration;
  stops: { city: CityId; days: number }[];
  rhythm: { id: "pose" | "equilibre" | "soutenu"; label: string; detail: string };
  logistics: { id: "autonomie" | "renforce" | "complet"; label: string; reasons: string[] };
  experiences: { city: CityId; text: string }[];
  offer: "decouverte" | "immersion" | "grand-format";
  concierge: boolean;
  visaNote: string;
};

/** Base allocation of days per city, in travel order, for each duration. */
const PLANS: Record<Duration, [CityId, number][]> = {
  // The first VERSTE product, tested on the ground (September 2026).
  7: [
    ["moscou", 4],
    ["nijni-novgorod", 3],
  ],
  14: [
    ["moscou", 4],
    ["anneau-d-or", 2],
    ["nijni-novgorod", 3],
    ["saint-petersbourg", 5],
  ],
  21: [
    ["moscou", 5],
    ["anneau-d-or", 3],
    ["nijni-novgorod", 3],
    ["kazan", 4],
    ["saint-petersbourg", 6],
  ],
  28: [
    ["moscou", 7],
    ["anneau-d-or", 4],
    ["nijni-novgorod", 4],
    ["kazan", 5],
    ["saint-petersbourg", 8],
  ],
};

/** Variants replacing the base plan when an interest calls for it. */
const SPORT_14: [CityId, number][] = [
  ["moscou", 6],
  ["nijni-novgorod", 3],
  ["saint-petersbourg", 5],
];
const NATURE_28: [CityId, number][] = [
  ["moscou", 6],
  ["saint-petersbourg", 7],
  ["anneau-d-or", 4],
  ["nijni-novgorod", 4],
  ["baikal", 7],
];

const EXPERIENCES: Record<InterestId, { city: CityId; text: string }[]> = {
  culture: [
    { city: "moscou", text: "La galerie Tretiakov et un soir au théâtre" },
    { city: "saint-petersbourg", text: "L'Ermitage, à un rythme qui laisse le temps de regarder" },
  ],
  histoire: [
    { city: "anneau-d-or", text: "Souzdal et ses monastères" },
    { city: "nijni-novgorod", text: "Le kremlin de brique au-dessus de la Volga" },
    { city: "moscou", text: "Le Kremlin et la place Rouge, tôt le matin" },
  ],
  sport: [
    { city: "moscou", text: "Un entraînement dans un club de lutte, sur mise en relation" },
    { city: "kazan", text: "Kazan, ville d'équipements sportifs et de compétitions" },
  ],
  sambo: [{ city: "moscou", text: "Une initiation au sambo, sport de combat né en URSS dans les années 1930" }],
  gastronomie: [
    { city: "moscou", text: "Le marché Danilovski et ses comptoirs" },
    { city: "kazan", text: "La cuisine tatare, entre échpotchmak et thé au lait" },
  ],
  architecture: [
    { city: "moscou", text: "Les grandes stations du métro" },
    { city: "saint-petersbourg", text: "Les façades de la perspective Nevski et les cours intérieures" },
  ],
  nature: [
    { city: "baikal", text: "Le lac Baïkal, gelé et transparent en hiver" },
    { city: "nijni-novgorod", text: "Les rives de la Volga et le téléphérique au-dessus du fleuve" },
    { city: "anneau-d-or", text: "La campagne autour de Souzdal" },
  ],
  nuit: [
    { city: "saint-petersbourg", text: "Les nuits blanches de juin et les ponts qui se lèvent" },
    { city: "moscou", text: "Les bars et les clubs des anciens sites industriels" },
  ],
  immersion: [
    { city: "moscou", text: "Une vraie bania, les bains russes" },
    { city: "nijni-novgorod", text: "Une ville où l'on croise peu de voyageurs étrangers" },
  ],
};

const RUSSIAN_EFFORT: Record<RussianLevel, number> = {
  aucun: 3,
  "quelques-mots": 2,
  debutant: 2,
  conversation: 1,
  intermediaire: 0,
};

const label = (id: InterestId) => INTERESTS.find((i) => i.id === id)?.label ?? id;

function planFor({ days, interests }: Answers): [CityId, number][] {
  const has = (id: InterestId) => interests.includes(id);
  if (days === 14 && (has("sport") || has("sambo"))) return SPORT_14;
  if (days === 28 && has("nature")) return NATURE_28;
  return PLANS[days];
}

export function buildProfile(answers: Answers): Profile {
  const plan = planFor(answers);
  const cities = plan.map(([city]) => city);

  // Rhythm: city changes per day on the ground
  const changes = (cities.length - 1) / answers.days;
  const rhythm: Profile["rhythm"] =
    changes < 0.16
      ? { id: "pose", label: "Posé", detail: "Peu de déplacements, du temps dans chaque ville." }
      : changes < 0.25
        ? { id: "equilibre", label: "Équilibré", detail: "Une nouvelle étape tous les trois ou quatre jours." }
        : { id: "soutenu", label: "Soutenu", detail: "Beaucoup de trajets : c'est dense, mais faisable." };

  // Logistics: how much preparation the trip needs
  const reasons: string[] = [];
  let score = RUSSIAN_EFFORT[answers.russian];
  if (score >= 2) reasons.push("Peu ou pas de russe : adresses en cyrillique et phrases par situation dans le carnet.");
  if (cities.length >= 5) {
    score += 2;
    reasons.push(`${cities.length} étapes : ${cities.length - 1} trajets à réserver et à enchaîner.`);
  } else if (cities.length >= 4) {
    score += 1;
    reasons.push(`${cities.length} étapes : des trains à réserver entre chaque ville.`);
  }
  if (cities.includes("baikal")) {
    score += 1;
    reasons.push("Un vol intérieur vers la Sibérie, avec ses horaires et ses bagages.");
  }
  if (reasons.length === 0) reasons.push("Un itinéraire simple et un bon niveau de russe : vous serez vite autonome.");
  const logistics: Profile["logistics"] =
    score <= 1
      ? { id: "autonomie", label: "Autonomie guidée", reasons }
      : score <= 3
        ? { id: "renforce", label: "Accompagnement renforcé", reasons }
        : { id: "complet", label: "Accompagnement complet", reasons };

  // Experiences: the selected interests, limited to the cities on the route
  const seen = new Set<string>();
  const experiences = answers.interests
    .flatMap((interest) => EXPERIENCES[interest])
    .filter((e) => cities.includes(e.city) && !seen.has(e.text) && seen.add(e.text))
    .slice(0, 6);

  const offer: Profile["offer"] = answers.days === 7 ? "decouverte" : answers.days === 14 ? "immersion" : "grand-format";

  const names = answers.interests.map(label);
  const title =
    names.length === 0
      ? "Découverte"
      : names.length <= 2
        ? names.join(" + ")
        : `${names.slice(0, 2).join(" + ")} + ${names.length - 2}`;

  return {
    title,
    days: answers.days,
    stops: plan.map(([city, days]) => ({ city, days })),
    rhythm,
    logistics,
    experiences,
    offer,
    concierge: logistics.id === "complet" || answers.comfort === "premium",
    visaNote:
      answers.days === 28
        ? "28 jours sur place, c'est le maximum raisonnable avec un eVisa de 30 jours : les jours d'arrivée et de départ comptent."
        : "Votre séjour tient dans un eVisa, valable 30 jours sur place.",
  };
}
