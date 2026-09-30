import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { compose, keyword, keywords } from "./compose.ts";

describe("compose: the trip as something that can be drawn", () => {
  it("7 days: Moscow then Nizhny, both lived; Saint Petersburg offered as the other branch", () => {
    const c = compose({ days: 7, interests: ["culture"] });
    assert.deepEqual(c.stops.map((s) => [s.city, s.days, s.lived]), [["moscou", 4, true], ["nijni-novgorod", 3, true]]);
    assert.equal(c.branch?.city, "saint-petersbourg");
    assert.equal(c.chain.length, 7);
  });

  it("14 days: more cities, Kazan offered as a branch down the Volga", () => {
    const c = compose({ days: 14, interests: ["culture"] });
    assert.ok(c.stops.length >= 3);
    assert.equal(c.stops.reduce((s, x) => s + x.days, 0), 14);
    assert.equal(c.branch?.city, "kazan");
    assert.equal(c.branch?.from, "nijni-novgorod");
  });

  it("sport reorganises Moscow: the training day appears, honestly (no invented club)", () => {
    const culture = compose({ days: 7, interests: ["culture"] }).chain.flatMap((d) => d.keys);
    const sport = compose({ days: 7, interests: ["sport"] }).chain.flatMap((d) => d.keys);
    assert.ok(!culture.includes("Séance d'entraînement"));
    assert.ok(sport.includes("Séance d'entraînement"));
  });

  it("marks the cities without VERSTE days as « à construire » instead of inventing them", () => {
    const c = compose({ days: 21, interests: ["culture"] });
    const kazan = c.stops.find((s) => s.city === "kazan");
    assert.ok(kazan && !kazan.built && !kazan.lived);
    assert.ok(c.chain.some((d) => d.kind === "a-construire" && d.title === "À construire avec vous"));
  });

  it("keeps a few words per day, taken from the day templates", () => {
    assert.equal(keyword("Le Kremlin"), "Kremlin");
    assert.equal(keyword("Saint-Basile, de l'intérieur"), "Saint-Basile");
    assert.equal(keyword("L'étang"), "Étang");
    assert.equal(keyword("START · Le kremlin"), "Kremlin");
    assert.deepEqual(keywords("Le Bolchoï, la place Rouge, Saint-Basile"), ["Bolchoï", "Place Rouge", "Saint-Basile"]);
    assert.deepEqual(keywords("Saint-Basile, de l'intérieur"), ["Saint-Basile"]);
    assert.deepEqual(keywords("Séance de sambo (option sport)"), ["Séance de sambo"]);
    const day2 = compose({ days: 7, interests: ["culture", "histoire"] }).chain[1]!;
    assert.ok(day2.keys.length > 0 && day2.keys.length <= 3);
  });
});
