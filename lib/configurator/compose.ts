import { destinations, KM_ZERO, moscow } from "../../data/cities.ts";
import { buildItinerary } from "../itinerary/engine.ts";
import type { LonLat } from "../travel/types.ts";

import { buildProfile, type Answers, type CityId, type Duration, type InterestId, type Profile, type RussianLevel, type Comfort } from "./engine.ts";

/**
 * The configurator's visual intelligence: from a few choices, the trip as
 * something that can be drawn. Cities in order with their days, the branch
 * the engine could take instead, and the chain of days with a few words
 * each (MOSCOU → Kremlin → Métro → …). No text is generated: every word
 * comes from the plan and the day templates. Pure and tested.
 */

export type ComposedStop = { city: CityId; fr: string; ru: string; coords: LonLat; days: number; lived: boolean; built: boolean };
export type ComposedBranch = { city: CityId; fr: string; ru: string; coords: LonLat; from: CityId; via: string };
export type ComposedDay = { index: number; city: CityId; kind: "arrivee" | "standard" | "transfert" | "retour" | "a-construire"; title: string; keys: string[]; effort: 1 | 2 | 3 };

export type Composition = {
  key: string;
  days: Duration;
  stops: ComposedStop[];
  branch: ComposedBranch | null;
  chain: ComposedDay[];
  rhythm: Profile["rhythm"];
  logistics: Profile["logistics"];
};

const CITY: Record<CityId, { fr: string; ru: string; coords: LonLat }> = {
  moscou: { fr: moscow.fr, ru: moscow.ru, coords: KM_ZERO },
  ...(Object.fromEntries(destinations.map((d) => [d.id, { fr: d.fr, ru: d.ru, coords: d.coords }])) as Record<Exclude<CityId, "moscou">, { fr: string; ru: string; coords: LonLat }>),
};

/** Cities lived on the ground in 2026 (the others are prepared from sources). */
const LIVED: CityId[] = ["moscou", "nijni-novgorod"];

const bare = (fragment: string) => {
  const b = fragment.trim().replace(/\s*\(.*?\)\s*/g, "").replace(/^(le|la|les|un|une|des)\s+/i, "").replace(/^l['’]/i, "");
  return b.charAt(0).toUpperCase() + b.slice(1);
};

/**
 * The words of an activity title worth showing: « Le Kremlin » → Kremlin ;
 * « START · Le kremlin » → Kremlin ; « Le Bolchoï, la place Rouge,
 * Saint-Basile » → Bolchoï, Place Rouge, Saint-Basile ; « Saint-Basile, de
 * l'intérieur » → Saint-Basile.
 */
export function keywords(title: string): string[] {
  const parts = title.split(/\s+·\s+/).filter((p) => !/^(START|FINAL|\d{1,2})$/i.test(p.trim()));
  return parts
    .flatMap((p) => p.split(","))
    .filter((f) => f.trim() && !/^(de|du|des|d['’]|en|au|aux|puis|et|si|selon|jusqu)\b/i.test(f.trim()))
    .map(bare);
}

export const keyword = (title: string) => keywords(title)[0] ?? bare(title);

export function compose(input: { days: Duration; interests: InterestId[]; russian?: RussianLevel; comfort?: Comfort }): Composition {
  const answers: Answers = { days: input.days, interests: input.interests, russian: input.russian ?? "quelques-mots", comfort: input.comfort ?? "confort" };
  const profile = buildProfile(answers);
  const itinerary = buildItinerary(answers, profile);
  const built = new Set(itinerary.days.filter((d) => d.day).map((d) => d.city));
  const stops = profile.stops.map((s) => ({ city: s.city, ...CITY[s.city], days: s.days, lived: LIVED.includes(s.city), built: built.has(s.city) }));
  const cities = stops.map((s) => s.city);

  // The other branch the engine could take: Kazan down the Volga, or Saint Petersburg for a short trip.
  let branch: ComposedBranch | null = null;
  if (input.days >= 14 && !cities.includes("kazan")) branch = { city: "kazan", ...CITY.kazan, from: cities.includes("nijni-novgorod") ? "nijni-novgorod" : "moscou", via: "Train de nuit depuis Moscou" };
  else if (!cities.includes("saint-petersbourg")) branch = { city: "saint-petersbourg", ...CITY["saint-petersbourg"], from: "moscou", via: "Sapsan depuis Moscou" };

  const chain = itinerary.days.map((d) => {
    const acts = d.day ? [...d.day.morning, ...d.day.afternoon, ...d.day.evening].filter((a) => !a.optional) : [];
    const keys = [...new Set(acts.flatMap((a) => keywords(a.title)))].filter((k) => !/^(Arrivée|Installation|Dernier dîner|Dîner simple|Soirée libre)/i.test(k)).slice(0, 3);
    return { index: d.index, city: d.city, kind: d.kind, title: d.day?.title ?? "À construire avec vous", keys, effort: d.effort };
  });

  return {
    key: `${input.days}:${[...input.interests].sort().join("+")}`,
    days: input.days,
    stops,
    branch,
    chain,
    rhythm: profile.rhythm,
    logistics: profile.logistics,
  };
}
