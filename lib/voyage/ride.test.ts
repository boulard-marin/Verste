import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { rideState } from "./ride.ts";

describe("the metro ride, station after station", () => {
  const n = 7; // Okhotny Riad → Vorobiovy Gory

  it("starts stopped at the first platform and ends at the last", () => {
    const start = rideState(0, n);
    assert.deepEqual([start.station, start.atPlatform, start.speed], [0, true, 0]);
    const end = rideState(1, n);
    assert.deepEqual([end.station, end.atPlatform], [6, true]);
  });

  it("stops at every station: the train is still at each platform", () => {
    for (let k = 1; k < n - 1; k++) {
      const at = rideState(k / (n - 1) + 0.01, n);
      assert.equal(at.station, k);
      assert.ok(at.atPlatform && at.speed === 0, `stopped at station ${k}`);
    }
  });

  it("moves forward only, fastest between two stations", () => {
    let last = -1;
    for (let t = 0; t <= 1; t += 0.01) {
      const d = rideState(t, n).distance;
      assert.ok(d >= last - 1e-9);
      last = d;
    }
    const mid = rideState((0.24 + 0.76 / 2) / (n - 1), n);
    assert.ok(mid.speed > 0.99, `speed ${mid.speed}`);
  });
});
