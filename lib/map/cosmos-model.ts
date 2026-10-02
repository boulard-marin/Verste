import { BoxGeometry, BufferGeometry, ConeGeometry, CylinderGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from "three";

import type { LonLat } from "@/lib/travel/types";

/**
 * The Monument to the Conquerors of Space (VDNKh), lofted from its real OSM
 * cross-sections: one smooth titanium trail instead of a staircase of boxes,
 * with the rocket at its tip. `launchCosmos(model, t)` replays the launch:
 * the trail is drawn upwards and the rocket climbs with it.
 */

type Section = { min: number; h: number; ring: readonly LonLat[] };

const R = 6371008.8;
const rad = Math.PI / 180;
const N = 28;
/** Length of the rocket at the top of the monument (Russian Wikipedia, read on 02/10/2026). */
const ROCKET = 11;

/** Ring resampled to N points by arc length, counter-clockwise, starting due east of its centre. */
function resample(pts: [number, number][]): [number, number][] {
  let ring = pts;
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!, b = ring[(i + 1) % ring.length]!;
    s += a[0] * b[1] - b[0] * a[1];
  }
  if (s < 0) ring = [...ring].reverse();
  const cx = ring.reduce((t, p) => t + p[0], 0) / ring.length;
  const cz = ring.reduce((t, p) => t + p[1], 0) / ring.length;
  // Start at the vertex closest to due east, so successive rings line up.
  let start = 0;
  let best = -Infinity;
  ring.forEach((p, i) => {
    const score = (p[0] - cx) / (Math.hypot(p[0] - cx, p[1] - cz) || 1);
    if (score > best) {
      best = score;
      start = i;
    }
  });
  ring = [...ring.slice(start), ...ring.slice(0, start)];
  const lens = ring.map((p, i) => Math.hypot(ring[(i + 1) % ring.length]![0] - p[0], ring[(i + 1) % ring.length]![1] - p[1]));
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  const out: [number, number][] = [];
  for (let k = 0; k < N; k++) {
    let d = (k / N) * total;
    let i = 0;
    while (d > lens[i]! && i < ring.length - 1) d -= lens[i++]!;
    const a = ring[i]!, b = ring[(i + 1) % ring.length]!;
    const u = lens[i]! ? d / lens[i]! : 0;
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}

export function buildCosmos(sections: Section[], anchor: LonLat): Group {
  const kx = Math.cos(anchor[1] * rad) * R * rad;
  const kz = R * rad;
  const local = (p: LonLat): [number, number] => [(p[0] - anchor[0]) * kx, -(p[1] - anchor[1]) * kz];

  // Rings at the base of each OSM step, then the tip.
  const rings = sections.map((s) => ({ y: s.min, pts: resample(s.ring.map(local)) }));
  // Smooth the staircase: average each ring with its neighbours (centre and size).
  const smooth = rings.map((r, i) => {
    const a = rings[Math.max(0, i - 1)]!, b = rings[Math.min(rings.length - 1, i + 1)]!;
    return { y: r.y, pts: r.pts.map((p, k) => [(a.pts[k]![0] + 2 * p[0] + b.pts[k]![0]) / 4, (a.pts[k]![1] + 2 * p[1] + b.pts[k]![1]) / 4] as [number, number]) };
  });
  const last = sections[sections.length - 1]!;
  const tipXZ = local(last.ring.reduce((t, p) => [t[0] + p[0] / last.ring.length, t[1] + p[1] / last.ring.length], [0, 0]) as unknown as LonLat);
  const tip = new Vector3(tipXZ[0], last.h, tipXZ[1]);

  const positions: number[] = [];
  for (const r of smooth) for (const p of r.pts) positions.push(p[0], r.y, p[1]);
  positions.push(tip.x, tip.y, tip.z);
  const tipIndex = smooth.length * N;
  const index: number[] = [];
  for (let j = 0; j < smooth.length - 1; j++) {
    for (let k = 0; k < N; k++) {
      const a = j * N + k, b = j * N + ((k + 1) % N), c = (j + 1) * N + k, d = (j + 1) * N + ((k + 1) % N);
      index.push(a, c, b, b, c, d);
    }
  }
  for (let k = 0; k < N; k++) index.push((smooth.length - 1) * N + k, tipIndex, (smooth.length - 1) * N + ((k + 1) % N));
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const titanium = new MeshStandardMaterial({ color: "#c9d0d9", metalness: 0.72, roughness: 0.26, emissive: "#1f2631", emissiveIntensity: 0.45 });
  const trail = new Mesh(geometry, titanium);
  trail.name = "trail";

  // The spine of the trail: centre of each ring, then the tip.
  const spine = [...smooth.map((r) => new Vector3(r.pts.reduce((t, p) => t + p[0], 0) / N, r.y, r.pts.reduce((t, p) => t + p[1], 0) / N)), tip];
  // The rocket is the top of the trail (11 m, as on the real monument): its base rests 11 m under the tip.
  let rest = spine.length - 1;
  for (let k = 1; k < spine.length; k++) {
    if (spine[k]!.y >= tip.y - ROCKET) {
      const a = spine[k - 1]!, b = spine[k]!;
      rest = k - 1 + (tip.y - ROCKET - a.y) / (b.y - a.y || 1);
      break;
    }
  }
  const base = along(spine, rest);
  const axis = tip.clone().sub(base).normalize();
  const rocket = new Group();
  const metal = new MeshStandardMaterial({ color: "#dfe5ec", metalness: 0.8, roughness: 0.22, emissive: "#262d38", emissiveIntensity: 0.5 });
  const body = new Mesh(new CylinderGeometry(1.25, 1.25, 7, 16), metal);
  body.position.y = 3.5;
  const nose = new Mesh(new ConeGeometry(1.25, 4, 16), metal);
  nose.position.y = 9;
  rocket.add(body, nose);
  for (let i = 0; i < 3; i++) {
    const fin = new Mesh(new BoxGeometry(0.2, 2.6, 2.2), metal);
    const a = (i / 3) * Math.PI * 2;
    fin.position.set(Math.cos(a) * 1.4, 1.2, Math.sin(a) * 1.4);
    fin.rotation.y = -a;
    rocket.add(fin);
  }
  rocket.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axis));
  rocket.position.copy(base);
  rocket.name = "rocket";

  const g = new Group();
  g.add(trail, rocket);
  g.userData.spine = spine;
  g.userData.rest = rest;
  g.userData.triangles = index.length;
  return g;
}

/** A point of the spine at a fractional index. */
function along(spine: Vector3[], x: number): Vector3 {
  const i = Math.min(spine.length - 2, Math.max(0, Math.floor(x)));
  return spine[i]!.clone().lerp(spine[i + 1]!, x - i);
}

/** The launch: the trail drawn upwards, the rocket riding its tip. */
export function launchCosmos(model: Group, t: number) {
  const trail = model.getObjectByName("trail") as Mesh | undefined;
  const rocket = model.getObjectByName("rocket");
  const spine = model.userData.spine as Vector3[] | undefined;
  if (!trail || !rocket || !spine) return;
  const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 2);
  const total = model.userData.triangles as number;
  trail.geometry.setDrawRange(0, Math.max(3, Math.floor((total * e) / 3) * 3));
  rocket.position.copy(along(spine, e * (model.userData.rest as number)));
  model.visible = t > 0.001;
}
