import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildProfile, type Answers } from "../configurator/engine.ts";
import { formatMinutes, sunTime } from "../sun.ts";
import { buildItinerary, closedOn } from "./engine.ts";

const base: Answers = { days: 7, interests: ["culture"], russian: "quelques-mots", comfort: "confort" };
const plan = (a: Answers, start?: string) => buildItinerary(a, buildProfile(a), start ? { start } : {});

describe("buildItinerary", () => {
  it("7 days: arrival in Moscow, three Moscow days, the train, Nizhny, the return", () => {
    const { days } = plan(base);
    assert.equal(days.length, 7);
    assert.equal(days[0]!.kind, "arrivee");
    assert.deepEqual(
      days.map((d) => d.city),
      ["moscou", "moscou", "moscou", "moscou", "nijni-novgorod", "nijni-novgorod", "nijni-novgorod"],
    );
    assert.equal(days[4]!.kind, "transfert");
    assert.equal(days[6]!.kind, "retour");
    assert.ok(days.every((d) => d.day !== null), "every day of the tested product is detailed");
    assert.equal(new Set(days.map((d) => d.day!.id)).size, 7, "no day is repeated");
  });

  it("never puts two heavy days in a row", () => {
    for (const interests of [["culture"], ["sport"], ["histoire", "architecture"], ["nature"]] as const) {
      const { days } = plan({ ...base, days: 14, interests: [...interests] });
      for (let i = 1; i < days.length; i++) {
        assert.ok(!(days[i]!.effort === 3 && days[i - 1]!.effort === 3), `${interests.join()} · days ${i} and ${i + 1}`);
      }
    }
  });

  it("follows interests: sport brings the training day and the Strelka, nature the lakes", () => {
    const sport = plan({ ...base, interests: ["sport"] }).days.map((d) => d.day?.id);
    assert.ok(sport.includes("moscou-sport"));
    const nature = plan({ ...base, days: 14, interests: ["nature"] }).days.map((d) => d.day?.id);
    assert.ok(nature.includes("nijni-nature"));
  });

  it("gives each chosen interest its day: culture + sport keeps a culture day and the training day", () => {
    const ids = plan({ ...base, interests: ["culture", "sport"] }).days.map((d) => d.day?.id);
    assert.ok(ids.includes("moscou-sport"));
    assert.ok(ids.includes("moscou-historique") || ids.includes("moscou-colline"));
  });

  it("with dates, moves museum days away from Mondays when the city allows it", () => {
    // 2026-10-02 is a Friday: day 4 is a Monday.
    const { days, warnings } = plan(base, "2026-10-02");
    const monday = days.find((d) => d.weekday === "lun")!;
    assert.equal(monday.index, 4);
    if (monday.day && monday.kind === "standard") assert.deepEqual(closedOn(monday.day, "lun"), []);
    assert.ok(warnings.every((w) => !w.includes("Jour 4")));
  });

  it("annotates each day with its computed sunset when dates are known", () => {
    const { days } = plan(base, "2026-09-19");
    assert.ok(days[0]!.notes.some((n) => /Coucher du soleil à Moscou : 18 h 3\d/.test(n)));
  });

  it("never schedules an unconfirmed match, it only mentions it", () => {
    const { days } = plan({ ...base, interests: ["sport"] }, "2026-10-08");
    const flat = days.flatMap((d) => [...(d.day?.evening ?? [])].map((a) => a.title));
    assert.ok(!flat.some((t) => /Torpedo –/.test(t)));
  });

  it("marks cities without verified days as « à construire » instead of inventing them", () => {
    const { days, warnings } = plan({ ...base, days: 21 });
    assert.ok(days.some((d) => d.kind === "a-construire" && d.city === "kazan"));
    assert.ok(warnings.some((w) => w.includes("à la demande")));
  });
});

describe("sunTime", () => {
  it("matches the founder's photos at Poklonnaïa (21/09/2026)", () => {
    const set = sunTime("2026-09-21", 37.5061, 55.7314, "set")!;
    assert.equal(formatMinutes(set), "18 h 33");
  });

  it("is earlier in Nizhny than in Moscow on the same day", () => {
    assert.ok(sunTime("2026-09-22", 44.0036, 56.3288, "set")! < sunTime("2026-09-22", 37.6177, 55.7557, "set")!);
  });
});
