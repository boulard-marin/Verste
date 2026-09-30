import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { grandeVersteNijni } from "../../data/travel/grande-verste.ts";
import { allPlaces, findPlace, mapCities } from "../../data/travel/index.ts";
import { journeys } from "../../data/travel/journeys.ts";
import { mediaText } from "../../data/travel/media-catalog.ts";
import { nijniDays, torpedoAnnounced } from "../../data/travel/products-nijni.ts";
import { haversineKm, lineKm } from "./geo.ts";
import { walkSchedule } from "./walk.ts";
import type { Verified } from "./types.ts";

const root = path.resolve(import.meta.dirname, "../..");
const own = JSON.parse(fs.readFileSync(path.join(root, "data/generated/media-files.json"), "utf8"));
const ext = JSON.parse(fs.readFileSync(path.join(root, "data/generated/external-media.json"), "utf8"));

function proofs(p: Record<string, unknown>): Verified<unknown>[] {
  const out: Verified<unknown>[] = [];
  for (const key of ["hours", "closedDays", "price", "visitorAccess"]) {
    if (p[key]) out.push(p[key] as Verified<unknown>);
  }
  for (const f of (p.facts as Verified<unknown>[] | undefined) ?? []) out.push(f);
  return out;
}

describe("places", () => {
  it("have unique ids", () => {
    const ids = allPlaces.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("have plausible coordinates in their city, from a declared source", () => {
    const centre = { moscou: [37.6175, 55.7506], "nijni-novgorod": [44.0075, 56.3269] } as const;
    for (const p of allPlaces) {
      assert.ok(p.coordsSource.length > 0, p.id);
      assert.doesNotMatch(p.coordsSource, /exif/i, p.id);
      const c = centre[p.cityId as keyof typeof centre];
      if (c) assert.ok(haversineKm(p.coords, c) < 30, `${p.id} is ${haversineKm(p.coords, c).toFixed(1)} km from its city`);
    }
  });

  it("back every practical fact with a dated source", () => {
    for (const p of allPlaces) {
      for (const v of proofs(p as unknown as Record<string, unknown>)) {
        assert.match(v.verification.checkedAt, /^\d{4}-\d{2}-\d{2}$/, p.id);
        if (v.verification.status === "verifie") {
          assert.ok(v.verification.sources.some((s) => s.kind === "officiel"), `${p.id}: "verifie" needs an official source`);
        }
        if (v.verification.status !== "observe") assert.ok(v.verification.sources.length > 0 || v.verification.status === "a-verifier", p.id);
        if (v.verification.status === "contradictoire") assert.ok(v.verification.note, `${p.id}: conflicting sources need both values`);
      }
    }
  });

  it("attribute every interpretation", () => {
    for (const p of allPlaces) for (const i of p.interpretations ?? []) assert.ok(i.attributedTo.length > 0, p.id);
  });

  it("reference only published media, with text", () => {
    for (const p of allPlaces) {
      for (const slug of p.media) {
        assert.ok(mediaText[slug], `${p.id}: no caption for ${slug}`);
        assert.ok(own[slug] || ext[slug], `${p.id}: ${slug} is not published`);
      }
    }
  });
});

describe("media", () => {
  it("every captioned slug is published, every external one is credited", () => {
    for (const slug of Object.keys(mediaText)) assert.ok(own[slug] || ext[slug], slug);
    for (const [slug, f] of Object.entries(ext) as Array<[string, { author: string; license: string; source: string }]>) {
      assert.ok(f.author && f.license && f.source, slug);
    }
  });
});

describe("La Grande Verste", () => {
  it("is a real walk whose distance is computed from its geometry", () => {
    const km = lineKm(grandeVersteNijni.geometry);
    assert.ok(km > 3 && km < 8, `${km} km`);
    for (const s of grandeVersteNijni.stops) assert.ok(findPlace(s.placeId), s.placeId);
    assert.ok(findPlace(grandeVersteNijni.restaurantId));
    assert.equal(grandeVersteNijni.waypointIndex.length, grandeVersteNijni.waypoints.length);
  });

  it("schedules every stop in order, and the legs add up to the whole walk", () => {
    for (const pace of ["tranquille", "normal", "soutenu"] as const) {
      const { legs, totalKm } = walkSchedule(grandeVersteNijni, pace);
      assert.equal(legs.length, grandeVersteNijni.stops.length);
      const sum = legs.reduce((a, l) => a + l.km, 0);
      assert.ok(Math.abs(sum - totalKm) < 0.05, `${sum} vs ${totalKm}`);
      for (let i = 1; i < legs.length; i++) assert.ok(legs[i]!.arrive >= legs[i - 1]!.leave);
    }
  });
});

describe("itineraries", () => {
  it("never schedule a place on a day it is closed", () => {
    for (const day of Object.values(nijniDays)) {
      for (const a of [...day.morning, ...day.afternoon, ...day.evening]) {
        if (!a.placeId) continue;
        const place = findPlace(a.placeId);
        assert.ok(place, a.placeId);
        const closed = place.closedDays?.value ?? [];
        for (const d of closed) assert.ok(day.avoid?.weekdays.includes(d), `${day.id} uses ${place.id} closed on ${d} without saying so`);
      }
    }
  });

  it("only announce events that are not presented as confirmed", () => {
    for (const e of torpedoAnnounced) assert.notEqual(e.verification.status, "verifie", e.id);
  });
});

describe("map", () => {
  it("draws journeys with a declared basis", () => {
    for (const j of journeys) {
      assert.ok(j.path.length >= 2 && j.pathBasis.length > 0, j.id);
    }
    assert.ok(mapCities.filter((c) => c.ready).length >= 2);
  });
});
