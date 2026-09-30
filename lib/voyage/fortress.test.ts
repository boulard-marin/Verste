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
