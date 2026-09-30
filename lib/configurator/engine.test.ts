import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildProfile, COMFORTS, DURATIONS, INTERESTS, RUSSIAN_LEVELS, type Answers } from "./engine.ts";
import { firstMissingStep, isComplete, parseAnswers, toQuery } from "./params.ts";

const base: Answers = { days: 14, interests: ["culture"], russian: "quelques-mots", comfort: "confort" };

describe("buildProfile", () => {
  it("allocates exactly the chosen number of days, for every combination", () => {
    for (const days of DURATIONS) {
      for (const interest of INTERESTS) {
        for (const level of RUSSIAN_LEVELS) {
          for (const comfort of COMFORTS) {
            const profile = buildProfile({ days, interests: [interest.id], russian: level.id, comfort: comfort.id });
            const total = profile.stops.reduce((sum, stop) => sum + stop.days, 0);
            assert.equal(total, days, `${days} j, ${interest.id}`);
            assert.equal(profile.stops[0]?.city, "moscou", "every trip starts in Moscow");
          }
        }
      }
    }
  });

  it("7 days: Moscow and Nizhny Novgorod (the tested product), découverte offer", () => {
    const profile = buildProfile({ ...base, days: 7 });
    assert.deepEqual(
      profile.stops.map((s) => s.city),
      ["moscou", "nijni-novgorod"],
    );
    assert.equal(profile.offer, "decouverte");
    assert.equal(profile.rhythm.id, "pose");
  });

  it("14 days culture + sport: Moscow, Nizhny Novgorod, Saint Petersburg (brief example)", () => {
    const profile = buildProfile({ ...base, interests: ["culture", "sport"] });
    assert.deepEqual(
      profile.stops.map((s) => s.city),
      ["moscou", "nijni-novgorod", "saint-petersbourg"],
    );
    assert.equal(profile.title, "Culture + Sport / lutte");
    assert.equal(profile.offer, "immersion");
  });

  it("28 days with nature adds Lake Baikal and raises the logistics level", () => {
    const withNature = buildProfile({ ...base, days: 28, interests: ["nature"] });
    const without = buildProfile({ ...base, days: 28, interests: ["culture"] });
    assert.ok(withNature.stops.some((s) => s.city === "baikal"));
    assert.ok(!without.stops.some((s) => s.city === "baikal"));
    assert.ok(withNature.logistics.reasons.some((r) => r.includes("vol intérieur")));
  });

  it("no Russian and five stops calls for full support and suggests the conciergerie", () => {
    const profile = buildProfile({ ...base, days: 21, russian: "aucun" });
    assert.equal(profile.logistics.id, "complet");
    assert.equal(profile.concierge, true);
  });

  it("good Russian and a simple route stays autonomous", () => {
    const profile = buildProfile({ ...base, days: 7, russian: "intermediaire", comfort: "essentiel" });
    assert.equal(profile.logistics.id, "autonomie");
    assert.equal(profile.concierge, false);
  });

  it("only suggests experiences in cities on the route, without duplicates", () => {
    const profile = buildProfile({ ...base, days: 7, interests: ["gastronomie", "nature", "culture"] });
    const cities = profile.stops.map((s) => s.city);
    assert.ok(profile.experiences.every((e) => cities.includes(e.city)));
    assert.equal(new Set(profile.experiences.map((e) => e.text)).size, profile.experiences.length);
    assert.ok(!profile.experiences.some((e) => e.city === "kazan"));
  });

  it("warns about the eVisa limit for 28 days", () => {
    assert.match(buildProfile({ ...base, days: 28 }).visaNote, /30 jours/);
  });
});

describe("params", () => {
  it("parses repeated and comma-separated interests, drops unknown values", () => {
    const parsed = parseAnswers({ duree: "21", profils: ["culture", "sport,inconnu", "culture"], russe: "aucun", confort: "luxe" });
    assert.equal(parsed.days, 21);
    assert.deepEqual(parsed.interests, ["culture", "sport"]);
    assert.equal(parsed.russian, "aucun");
    assert.equal(parsed.comfort, undefined);
  });

  it("rejects durations outside the four formats", () => {
    assert.equal(parseAnswers({ duree: "10" }).days, undefined);
  });

  it("finds the first missing step and round-trips through the query string", () => {
    const partial = parseAnswers({ duree: "14", profils: "culture" });
    assert.equal(firstMissingStep(partial), 3);
    assert.equal(isComplete(partial), false);
    const complete = parseAnswers(Object.fromEntries(new URLSearchParams(toQuery({ ...partial, russian: "debutant", comfort: "premium" }))));
    assert.equal(isComplete(complete), true);
    assert.equal(firstMissingStep(complete), 5);
  });
});
