import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { kremlinNijniFortress as nn } from "../../data/voyage/kremlin-nijni.ts";
import { lineKm } from "../travel/geo.ts";
import { buildFortress, closedMean, distanceToWall, frame } from "./fortress.ts";

describe("buildFortress (Nizhny kremlin)", () => {
  const fc = buildFortress(nn);
  const { toXY } = frame(nn.ring[0]!);

  it("keeps the thirteen OSM towers, each with a roof and a finial", () => {
    assert.equal(nn.towers.length, 13);
    assert.equal(fc.features.filter((f) => f.properties.part === "finial").length, 13);
  });

  it("cuts the 2.2 km wall into short bays that each step on the relief", () => {
    const km = lineKm(nn.ring);
    assert.ok(km > 2.1 && km < 2.4, `${km} km`);
    const walls = fc.features.filter((f) => f.properties.part === "wall");
    assert.ok(walls.length > 350, `${walls.length} bays`);
    for (const w of walls) assert.ok(distanceToWall(nn, w.geometry.coordinates[0]![0]!) < 6);
  });

  it("stacks merlon and roofs of a bay on the same terrain centroid (within 0.5 m)", () => {
    const walls = fc.features.filter((f) => f.properties.part === "wall");
    const merlons = fc.features.filter((f) => f.properties.part === "merlon");
    assert.equal(walls.length, merlons.length);
    for (let i = 0; i < walls.length; i += 25) {
      const a = closedMean(walls[i]!.geometry.coordinates[0]!.slice(0, -1).map(toXY));
      const b = closedMean(merlons[i]!.geometry.coordinates[0]!.slice(0, -1).map(toXY));
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5);
    }
  });

  it("never runs the wall through a tower", () => {
    const towers = fc.features.filter((f) => f.properties.part === "finial").map((f) => closedMean(f.geometry.coordinates[0]!.slice(0, -1).map(toXY)));
    for (const w of fc.features.filter((f) => f.properties.part === "wall")) {
      const c = closedMean(w.geometry.coordinates[0]!.slice(0, -1).map(toXY));
      for (const t of towers) assert.ok(Math.hypot(c[0] - t[0], c[1] - t[1]) > 3);
    }
  });

  it("every polygon is closed and extruded upwards", () => {
    for (const f of fc.features) {
      const r = f.geometry.coordinates[0]!;
      assert.deepEqual(r[0], r[r.length - 1]);
      assert.ok(f.properties.height > f.properties.base);
    }
  });
});

describe("buildFortress (Moscow Kremlin towers)", async () => {
  const { kremlinMoscouFortress: mk } = await import("../../data/voyage/kremlin-moscou.ts");
  const fc = buildFortress(mk);
  const parts = (name: string) => fc.features.filter((f) => f.properties.part === name);

  it("rebuilds the twenty towers from their OSM tiers, keeping the OSM wall", () => {
    assert.equal(mk.towers.length, 20);
    assert.equal(parts("wall").length, 0);
    assert.ok(parts("roof").length >= 19 * 8, "a tent roof on each tower");
  });

  it("puts a ruby star on exactly five towers", () => {
    assert.deepEqual(mk.towers.filter((t) => t.star).map((t) => t.fr).sort(), ["Borovitskaïa", "Nikolskaïa", "Spasskaïa", "Troïtskaïa", "Vodovzvodnaïa"]);
    assert.equal(parts("star").length, 5 * 3);
  });

  it("never draws the full-height outline box of a tower mapped in parts", () => {
    const spasskaia = mk.towers.find((t) => t.fr === "Spasskaïa")!;
    const H = spasskaia.heightM!;
    const tallest = Math.max(...parts("tower").filter((f) => f.properties.base === 0).map((f) => f.properties.height));
    assert.ok(tallest < H - 1, `no ground-to-top box (tallest from ground: ${tallest} m)`);
  });

  it("keeps the Spasskaïa star at its OSM height", () => {
    const tops = parts("star").map((f) => f.properties.height);
    assert.ok(tops.some((h) => Math.abs(h - 71) < 1.5), `star tops ${tops.join(", ")}`);
  });
});
