import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { flightLegs, flightTotalKm } from "../../data/voyage/flight.ts";
import { sapsanLeg, trainLegs } from "../../data/voyage/sapsan.ts";
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

describe("the Sapsan to Saint Petersburg", () => {
  const legs = { ...flightLegs, ...trainLegs };
  const LENINGRADSKI = [37.65531, 55.77625] as const;
  const MOSKOVSKI = [30.36243, 59.92872] as const;
  const scene = scenes.find((s) => s.id === "vers-saint-petersbourg")!;

  it("runs on the ground, from station to station, heading north-west", () => {
    const start = flightState(scene.vehicle!, 0, legs)!, mid = flightState(scene.vehicle!, 0.5, legs)!, end = flightState(scene.vehicle!, 1, legs)!;
    assert.ok(near(start.at, LENINGRADSKI) && near(end.at, MOSKOVSKI));
    assert.ok([start, mid, end].every((s) => s.altitude === 0), "a train never climbs");
    assert.ok(mid.heading > 270 && mid.heading < 360, `heading ${mid.heading}`);
  });

  it("counts kilometres on the schematic drawing, labelled as such", () => {
    assert.ok(sapsanLeg.km > haversineKm(LENINGRADSKI, MOSKOVSKI), "the drawing is longer than the great circle");
    assert.match(sapsanLeg.basis, /schématique/);
  });

  it("dots only its own planned route, and keeps the flight drawn", () => {
    const i = scenes.indexOf(scene);
    const p = routeProgress(scenes, i, flightState(scene.vehicle!, 0.5, legs), legs);
    assert.deepEqual(p.map((l) => l.showPlanned), [false, false, true]);
    assert.deepEqual(p.slice(0, 2).map((l) => l.t), [1, 1]);
    const istanbul = scenes.findIndex((s) => s.id === "istanbul");
    assert.deepEqual(routeProgress(scenes, istanbul, null, legs).map((l) => [l.t, l.showPlanned]), [[1, true], [0, true], [0, false]]);
  });
});
