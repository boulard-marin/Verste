import {
  COMFORTS,
  DURATIONS,
  INTERESTS,
  RUSSIAN_LEVELS,
  type Answers,
  type Comfort,
  type Duration,
  type InterestId,
  type RussianLevel,
} from "./engine.ts";

/**
 * Reads configurator answers from URL search params (?duree=14&profils=culture
 * &profils=sport&russe=aucun&confort=confort). Unknown values are dropped,
 * never trusted.
 */
export type SearchParams = Record<string, string | string[] | undefined>;
export type Partial4 = { days?: Duration; interests: InterestId[]; russian?: RussianLevel; comfort?: Comfort };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) =>
  (v === undefined ? [] : Array.isArray(v) ? v : [v]).flatMap((item) => item.split(","));

export function parseAnswers(params: SearchParams): Partial4 {
  const days = Number(first(params.duree));
  const interestIds = INTERESTS.map((i) => i.id) as readonly string[];
  const interests = [...new Set(all(params.profils))].filter((v): v is InterestId => interestIds.includes(v));
  const russian = RUSSIAN_LEVELS.find((l) => l.id === first(params.russe))?.id;
  const comfort = COMFORTS.find((c) => c.id === first(params.confort))?.id;
  return {
    days: (DURATIONS as readonly number[]).includes(days) ? (days as Duration) : undefined,
    interests,
    russian,
    comfort,
  };
}

export function isComplete(a: Partial4): a is Answers {
  return a.days !== undefined && a.interests.length > 0 && a.russian !== undefined && a.comfort !== undefined;
}

/** First step still missing an answer (1–4), or 5 when everything is answered. */
export function firstMissingStep(a: Partial4): number {
  if (a.days === undefined) return 1;
  if (a.interests.length === 0) return 2;
  if (a.russian === undefined) return 3;
  if (a.comfort === undefined) return 4;
  return 5;
}

/** Serialises answers back to a query string, optionally with a step. */
export function toQuery(a: Partial4, step?: number): string {
  const q = new URLSearchParams();
  if (a.days) q.set("duree", String(a.days));
  for (const interest of a.interests) q.append("profils", interest);
  if (a.russian) q.set("russe", a.russian);
  if (a.comfort) q.set("confort", a.comfort);
  if (step) q.set("etape", String(step));
  return q.toString();
}
