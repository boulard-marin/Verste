import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { flightLegs, flightTotalKm } from "../../data/voyage/flight.ts";
import { scenes } from "../../data/voyage/scenes.ts";
import { haversineKm } from "../travel/geo.ts";
import { flightState, routeProgress } from "./flight.ts";

const CDG = [2.5479, 49.0097] as const;
const IST = [28.7519, 41.2753] as const;
const SVO = [37.4146, 55.9726] as const;
const near = (a: readonly [number, number], b: readonly [number, number], km = 1) => haversineKm(a, b) < km;

describe("the opening flight", () => {
  const leg1 = { kind: "avion" as const, leg: "cdg-ist", fly: [0.2, 0.9] as [number, number] };

  it("waits on the ground in Paris, flies, and lands in Istanbul", () => {
    const before = flightState(leg1, 0.1, flightLegs)!;
    assert.ok(near(before.at, CDG) && before.altitude === 0);
    const mid = flightState(leg1, 0.55, flightLegs)!;
    assert.ok(mid.altitude > 0.99, "cruise at mid-leg");
    const after = flightState(leg1, 0.95, flightLegs)!;
    assert.ok(near(after.at, IST) && after.altitude === 0);
  });

  it("points south-east leaving Paris, as the great circle does", () => {
    const h = flightState(leg1, 0.25, flightLegs)!.heading;
    assert.ok(h > 100 && h < 140, `heading ${h}`);
  });

  it("turns on the ground at the stopover, then heads for Moscow", () => {
    const stop = { kind: "avion" as const, leg: "ist-svo", park: 0 as const, turnFrom: "cdg-ist" };
    const a = flightState(stop, 0, flightLegs)!, b = flightState(stop, 1, flightLegs)!;
    assert.ok(near(a.at, IST) && a.altitude === 0);
    assert.ok(Math.abs(a.heading - b.heading) > 40, "the plane turns");
  });

  it("counts great-circle kilometres, never the stylised drawing", () => {
    const landed = flightState({ kind: "avion", leg: "ist-svo", park: 1 }, 0.5, flightLegs)!;
    assert.ok(near(landed.at, SVO));
    assert.equal(Math.round(landed.km), Math.round(haversineKm(CDG, IST) + haversineKm(IST, SVO)));
    assert.equal(Math.round(flightTotalKm), Math.round(landed.km));
  });

  it("draws the legs flown by earlier scenes, not the later ones", () => {
    const istanbul = scenes.findIndex((s) => s.id === "istanbul");
    const legs = routeProgress(scenes, istanbul, null, flightLegs);
    assert.deepEqual(legs.map((l) => l.t), [1, 0]);
    assert.ok(legs.every((l) => l.showPlanned));
    const kremlin = scenes.findIndex((s) => s.id === "kremlin");
    assert.deepEqual(routeProgress(scenes, kremlin, null, flightLegs).map((l) => [l.t, l.showPlanned]), [[1, false], [1, false]]);
  });
});
