import { dayTemplates, type DayTemplate } from "../../data/itinerary/days.ts";
import { findPlace } from "../../data/travel/index.ts";
import { torpedoAnnounced } from "../../data/travel/products-nijni.ts";
import type { Answers, CityId as PlanCity, Profile } from "../configurator/engine.ts";
import { formatMinutes, sunTime } from "../sun.ts";
import type { ItineraryDay, Weekday } from "../travel/types.ts";

/**
 * Itinerary engine: the configurator profile in, a coherent day-by-day trip
 * out. Not "you chose culture → five activities": days are real, walkable
 * days (data/itinerary/days.ts), chosen by interest, ordered so that heavy
 * days never follow each other, checked against closures when dates are
 * known, and annotated with the computed sunset. Pure and tested.
 */

export type PlannedDay = {
  index: number;
  city: PlanCity;
  /** ISO date and weekday, when a departure date is given. */
  date?: string;
  weekday?: Weekday;
  /** A detailed VERSTE day, or null for cities not yet built day by day. */
  day: ItineraryDay | null;
  kind: DayTemplate["kind"] | "a-construire";
  effort: 1 | 2 | 3;
  notes: string[];
};

export type Itinerary = { days: PlannedDay[]; warnings: string[] };

const WEEKDAYS: Weekday[] = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const CITY_COORDS: Partial<Record<PlanCity, [number, number]>> = {
  moscou: [37.6175, 55.7506],
  "nijni-novgorod": [44.0075, 56.3269],
};
const CITY_NAMES: Record<PlanCity, string> = {
  moscou: "Moscou",
  "nijni-novgorod": "Nijni Novgorod",
  "anneau-d-or": "l'Anneau d'or",
  kazan: "Kazan",
  "saint-petersbourg": "Saint-Pétersbourg",
  baikal: "le Baïkal",
};

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()]!;
}

/** Effort of a day: duration-weighted effort of its required activities, heavier when long. */
export function dayEffort(day: ItineraryDay): 1 | 2 | 3 {
  const acts = [...day.morning, ...day.afternoon, ...day.evening].filter((a) => !a.optional);
  const minutes = acts.reduce((s, a) => s + a.durationMin, 0);
  const weighted = acts.reduce((s, a) => s + a.effort * a.durationMin, 0) / Math.max(1, minutes);
  const score = weighted + (minutes > 480 ? 0.5 : 0);
  return score >= 2 ? 3 : score >= 1.4 ? 2 : 1;
}

/** Places of a day closed on a given weekday (required activities only). */
export function closedOn(day: ItineraryDay, weekday: Weekday): string[] {
  const names: string[] = [];
  for (const a of [...day.morning, ...day.afternoon, ...day.evening]) {
    if (a.optional || !a.placeId) continue;
    const place = findPlace(a.placeId);
    if (place?.closedDays?.value.includes(weekday)) names.push(place.fr);
  }
  if (day.avoid?.weekdays.includes(weekday) && names.length === 0) names.push(day.title);
  return names;
}

const score = (t: DayTemplate, answers: Answers) => t.priority + 6 * t.tags.filter((tag) => answers.interests.includes(tag)).length;

/** Orders days so that two effort-3 days never follow each other (greedy, stable). */
function spread<T extends { effort: 1 | 2 | 3 }>(items: T[], previous: 1 | 2 | 3): T[] {
  const pool = [...items];
  const out: T[] = [];
  let last = previous;
  while (pool.length) {
    let i = pool.findIndex((x) => !(x.effort === 3 && last === 3));
    if (i < 0) i = 0;
    const [x] = pool.splice(i, 1);
    out.push(x!);
    last = x!.effort;
  }
  return out;
}

export function buildItinerary(answers: Answers, profile: Profile, opts: { start?: string } = {}): Itinerary {
  const warnings: string[] = [];
  const days: PlannedDay[] = [];
  const used = new Set<string>();
  let index = 1;

  profile.stops.forEach((stop, s) => {
    const prev = profile.stops[s - 1]?.city;
    const isLastStop = s === profile.stops.length - 1;
    const block: PlannedDay[] = [];
    for (let k = 0; k < stop.days; k++) {
      const isFirst = k === 0;
      const isTripLast = isLastStop && k === stop.days - 1;
      let template: DayTemplate | undefined;
      let kind: PlannedDay["kind"] = "standard";
      if (s === 0 && isFirst) {
        template = dayTemplates.find((t) => t.kind === "arrivee" && t.day.cityId === stop.city);
        kind = "arrivee";
      } else if (isFirst) {
        template = dayTemplates.find((t) => t.kind === "transfert" && t.from === prev && t.to === stop.city);
        kind = "transfert";
      } else if (isTripLast && stop.city === "nijni-novgorod") {
        // The trip ends where the flights leave from: back to Moscow.
        template = dayTemplates.find((t) => t.kind === "retour" && t.from === stop.city);
        kind = "retour";
      }
      block.push({ index: 0, city: stop.city, day: template?.day ?? null, kind: template ? kind : kind === "standard" ? "standard" : "a-construire", effort: template ? dayEffort(template.day) : 1, notes: [] });
    }

    // Fill the standard days of the city with its best templates.
    const slots = block.filter((d) => d.kind === "standard" && d.day === null);
    // Every chosen interest first gets its best day (culture + sport → one of
    // each), then the remaining slots go to the best-scored days.
    const pool = dayTemplates
      .filter((t) => t.kind === "standard" && t.day.cityId === stop.city && !used.has(t.day.id))
      .sort((a, b) => score(b, answers) - score(a, answers));
    const candidates: DayTemplate[] = [];
    for (const interest of answers.interests) {
      if (candidates.length >= slots.length) break;
      const best = pool.find((t) => t.tags.includes(interest) && !candidates.includes(t));
      if (best) candidates.push(best);
    }
    for (const t of pool) {
      if (candidates.length >= slots.length) break;
      if (!candidates.includes(t)) candidates.push(t);
    }
    for (const t of candidates) used.add(t.day.id);
    const filled = spread(
      candidates.map((t) => ({ template: t, effort: dayEffort(t.day) })),
      block[0]?.effort ?? 1,
    );
    slots.forEach((slot, i) => {
      const f = filled[i];
      if (f) {
        slot.day = f.template.day;
        slot.effort = f.effort;
      } else {
        slot.kind = "a-construire";
      }
    });
    days.push(...block);
  });

  for (const d of days) d.index = index++;

  // Dates: weekdays, closures (swap within the city when possible), sunset.
  if (opts.start) {
    for (const d of days) {
      d.date = addDays(opts.start, d.index - 1);
      d.weekday = weekdayOf(d.date);
    }
    for (const d of days) {
      if (!d.day || d.kind !== "standard" || !d.weekday) continue;
      const closed = closedOn(d.day, d.weekday);
      if (closed.length === 0) continue;
      const swap = days.find(
        (o) => o !== d && o.city === d.city && o.kind === "standard" && o.day && o.weekday && closedOn(o.day, d.weekday!).length === 0 && closedOn(d.day!, o.weekday).length === 0,
      );
      if (swap) {
        [d.day, swap.day] = [swap.day, d.day];
        [d.effort, swap.effort] = [swap.effort, d.effort];
      } else {
        d.notes.push(`Attention : ce jour tombe un ${weekdayName(d.weekday)}, ${closed.join(", ")} ${closed.length > 1 ? "sont fermés" : "est fermé"}. À déplacer.`);
        warnings.push(`Jour ${d.index} : ${closed.join(", ")} fermé le ${weekdayName(d.weekday)}.`);
      }
    }
    for (const d of days) {
      // The city where the day ends (a return day ends in Moscow).
      const city = (d.day?.cityId ?? d.city) as PlanCity;
      const c = CITY_COORDS[city];
      if (!c || !d.date) continue;
      const set = sunTime(d.date, c[0], c[1], "set");
      if (set !== null) d.notes.push(`Coucher du soleil à ${CITY_NAMES[city]} : ${formatMinutes(set)} (calculé).`);
    }
    // Hockey: only as a note while the club has not confirmed the calendar.
    if (answers.interests.includes("sport")) {
      for (const d of days) {
        if (d.city !== "nijni-novgorod" || !d.date) continue;
        const match = torpedoAnnounced.find((e) => e.date === d.date);
        if (match) d.notes.push(`${match.title} est annoncé ce soir-là par la presse locale, non confirmé sur le site du club : VERSTE vérifiera avant de le proposer.`);
      }
    }
  }

  // The last day: departure.
  const last = days[days.length - 1];
  if (last) last.notes.push(last.city === "moscou" || last.kind === "retour" ? "Vol retour le lendemain matin, ou le soir même selon vos billets." : `Vol retour depuis ${CITY_NAMES[last.city]} ou via Moscou, selon les billets.`);

  // Russian level and comfort shape the preparation, not the places.
  if (answers.russian === "aucun" || answers.russian === "quelques-mots") {
    const firstMetro = days.find((d) => d.day?.transport.some((t) => /Métro|métro/.test(t)));
    firstMetro?.notes.push("Carnet : les noms des stations en cyrillique, dans l'ordre de la ligne, pour tout le séjour.");
  }
  if (days.some((d) => d.kind === "a-construire")) {
    warnings.push("Certaines villes n'ont pas encore de journées vérifiées VERSTE : nous les construisons avec vous, à la demande.");
  }
  return { days, warnings };
}

export function weekdayName(w: Weekday): string {
  return { lun: "lundi", mar: "mardi", mer: "mercredi", jeu: "jeudi", ven: "vendredi", sam: "samedi", dim: "dimanche" }[w];
}

export function cityName(c: PlanCity): string {
  return CITY_NAMES[c];
}
