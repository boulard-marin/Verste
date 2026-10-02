import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, LatheGeometry, Mesh, SphereGeometry, Vector2, type Material } from "three";

import { block, colonnade, cross, dome, gold, lit, material, onion, patternTexture, prism, spire, type Pattern } from "./model-kit";

/**
 * The great silhouettes of Saint Petersburg, built from published dimensions
 * (Russian Wikipedia, read on 02/10/2026) on OpenStreetMap footprints (ODbL):
 * the needle of the Peter and Paul Cathedral and its angel (122.5 m), the
 * Admiralty spire and its ship (72 m), the gilded dome of Saint Isaac
 * (101.5 m), the Alexander Column (47.5 m), the Saviour on the Spilled Blood
 * (81 m, nine onion domes). Stylised on purpose: heights and plans follow the
 * sources, ornament does not. Units are metres; +x along the main axis of the
 * building, +y up (each object is turned to its real bearing when placed).
 */

const at = <T extends Mesh | Group>(m: T, x: number, y: number, z = 0): T => {
  m.position.set(x, y, z);
  return m;
};

/** An angel holding a cross (Peter and Paul, the Alexander Column): robe, head, raised wings. */
function angel(height: number, span: number, mat: Material): Group {
  const g = new Group();
  const robe = new Mesh(new ConeGeometry(height * 0.13, height * 0.7, 12), mat);
  robe.position.y = height * 0.35;
  const torso = new Mesh(new CylinderGeometry(height * 0.055, height * 0.085, height * 0.16, 10), mat);
  torso.position.y = height * 0.76;
  const head = new Mesh(new SphereGeometry(height * 0.065, 12, 8), mat);
  head.position.y = height * 0.9;
  g.add(robe, torso, head);
  for (const side of [-1, 1]) {
    const wing = new Mesh(new BoxGeometry(span / 2, height * 0.4, 0.06), mat);
    wing.position.set((side * span) / 4, height * 0.74, 0.16);
    wing.rotation.set(0, side * -0.4, side * 0.38);
    g.add(wing);
  }
  return g;
}

/** The tall octagonal golden crown of the Peter and Paul bell tower. */
function crown(r: number, h: number, mat: Material): Mesh {
  const pts = [0, 0.15, 0.35, 0.6, 0.8, 1].map((t, i) => new Vector2([r, r * 1.1, r * 0.95, r * 0.62, r * 0.42, r * 0.36][i]!, t * h));
  return new Mesh(new LatheGeometry(pts, 8), mat);
}

// ── Peter and Paul Cathedral ────────────────────────────────────────────────
/**
 * x = 0 is the spire, +x runs east along the nave (61 m long, 27.5 m wide).
 * Bell tower: two wide tiers, a third, the octagonal golden crown, a slender
 * golden turret, then the 40 m spire, the angel (3.2 m, 3.8 m wingspan) and
 * its cross: 122.5 m in all.
 */
export function buildPierreEtPaul(): Group {
  const wall = lit("#e6d6a6", 0.16);
  const trim = lit("#f1ece0", 0.2);
  const roof = lit("#56645d", 0.08, 0.7);
  const g = gold();
  const root = new Group();
  // Nave, from the west front (x = -3.8) to the apse (x = 57.2).
  root.add(block(61, 27.5, 0, 20, wall, 26.7), block(61.6, 28.1, 20, 1, trim, 26.7), block(60, 26.5, 21, 2, roof, 26.7), block(56, 18, 23, 1.6, roof, 26.7));
  // Bell tower.
  root.add(block(9.8, 23, 0, 32, wall, 1.1), block(10.4, 23.6, 32, 0.9, trim, 1.1));
  root.add(block(8.4, 14, 32.9, 11, wall, 0.2), block(9, 14.6, 43.9, 0.8, trim, 0.2));
  root.add(prism(4.3, 4, 44.7, 10.3, wall, 8), prism(4.7, 4.7, 55, 0.8, trim, 8));
  root.add(at(crown(4.2, 10.5, g), 0, 55.8), prism(1.55, 1.25, 66.3, 9.7, g, 8));
  root.add(at(spire(1.25, 40, g), 0, 76 + 20), at(new Mesh(new SphereGeometry(0.55, 12, 8), g), 0, 116.3));
  root.add(at(angel(3.2, 3.8, g), 0, 116.6), at(cross(6, g), 0.5, 116.5, -0.3));
  // Drum and dome over the altar.
  root.add(prism(4.6, 4.6, 21, 10, wall, 8, 40.4), prism(5, 5, 31, 0.6, trim, 8, 40.4));
  root.add(at(dome(4.8, 5.5, g), 40.4, 31.6), prism(1, 0.9, 37.1, 2.6, g, 8, 40.4), at(spire(0.5, 5, g), 40.4, 39.7 + 2.5));
  return root;
}

// ── The Admiralty tower ─────────────────────────────────────────────────────
/** 72 m to the top of the ship, 23 m of which are the spire. 28 columns, 28 statues. */
export function buildAmiraute(): Group {
  const yellow = lit("#e2bd68", 0.16);
  const white = lit("#f0ebdf", 0.2);
  const g = gold();
  const root = new Group();
  root.add(block(27.4, 27.4, 0, 21, yellow), block(28.2, 28.2, 21, 1.2, white), block(13.6, 13.6, 22.2, 9.8, yellow));
  // Square colonnade, seven columns a side, a statue above each.
  const column = new CylinderGeometry(0.42, 0.46, 9.8, 10);
  const statue = new CylinderGeometry(0.26, 0.32, 1.9, 8);
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 7; i++) {
      const u = -8.7 + i * 2.9;
      const [x, z] = [[u, -8.7], [8.7, u], [-u, 8.7], [-8.7, -u]][side]!;
      root.add(at(new Mesh(column, white), x!, 27.1, z), at(new Mesh(statue, white), x!, 34.55, z));
    }
  }
  root.add(block(18.6, 18.6, 32, 1.6, white), block(15.6, 15.6, 33.6, 2.8, yellow), block(9.6, 9.6, 36.4, 4.1, yellow), block(10.2, 10.2, 40.5, 0.5, white));
  // Gilded lantern, spire, ball and ship.
  root.add(block(7.4, 7.4, 41, 3.4, g), at(dome(3.9, 4.6, g), 0, 44.4), at(spire(1.15, 21.2, g), 0, 49 + 10.6));
  root.add(at(new Mesh(new SphereGeometry(0.4, 12, 8), g), 0, 70.45), block(1.92, 0.45, 70.85, 0.35, g));
  for (const x of [-0.6, 0, 0.6]) root.add(prism(0.035, 0.035, 71.2, x === 0 ? 0.8 : 0.62, g, 4, x));
  return root;
}

// ── Saint Isaac's Cathedral ─────────────────────────────────────────────────
/**
 * Above the OpenStreetMap body (kept, 50 m): the drum and its colonnade of 24
 * columns, the attic, the gilded dome (25.8 m across), the lantern and the
 * cross at 101.5 m. The four belfries keep their OSM volumes and get their
 * gilded cupolas (positions relative to the dome).
 */
export function buildIsaac(belfries: readonly (readonly [number, number])[]): Group {
  const stone = lit("#b9b2a5", 0.14);
  const red = lit("#9a6d61", 0.12, 0.6);
  const g = gold();
  const root = new Group();
  root.add(prism(18.3, 18.3, 49.6, 1.4, stone, 40), prism(13.6, 13.6, 51, 13.5, stone, 40), colonnade(24, 16.6, 0.8, 51, 12.2, red));
  root.add(prism(17.7, 17.7, 63.2, 1.6, stone, 40), prism(14.6, 14.6, 64.8, 5.4, stone, 40), at(dome(12.9, 16, g), 0, 70.2));
  root.add(prism(2.7, 2.6, 86.2, 6.3, g, 8), at(dome(2.8, 3.2, g), 0, 92.5), at(cross(5.8, g), 0, 95.7));
  for (const [x, z] of belfries) {
    root.add(prism(4.4, 4.4, 60, 2.8, stone, 16, x, z), at(dome(4.6, 5.6, g), x, 62.8, z), at(cross(2.2, g), x, 68.4, z));
  }
  return root;
}

// ── The Alexander Column ────────────────────────────────────────────────────
/**
 * A pink granite monolith of 25.6 m (3.66 m across at the foot, 3.19 m at the
 * top) on a 10 m pedestal, the bronze capital, the angel (4.26 m) and its
 * cross (6.4 m): 47.5 m.
 */
export function buildColonne(): Group {
  const granite = lit("#6e625c", 0.1);
  const redGranite = lit("#8c564e", 0.12);
  const pink = lit("#b8766b", 0.16, 0.38);
  const bronze = lit("#4c5347", 0.15, 0.5, 0.35);
  const figure = lit("#5b6150", 0.24, 0.45, 0.4);
  const root = new Group();
  root.add(block(10.2, 10.2, 0, 0.9, granite), block(6.4, 6.4, 0.9, 7.3, redGranite));
  // Bronze reliefs on the four faces of the pedestal.
  for (const s of [-1, 1]) root.add(block(4.6, 0.12, 2.4, 4.2, bronze, 0, s * 3.24), block(0.12, 4.6, 2.4, 4.2, bronze, s * 3.24, 0));
  root.add(block(7, 7, 8.2, 1, granite), block(5.6, 5.6, 9.2, 0.8, bronze), prism(2.15, 2, 10, 0.9, bronze, 32));
  root.add(prism(1.83, 1.6, 10.9, 25.6, pink, 32), prism(1.75, 1.75, 36.5, 0.3, bronze, 32), prism(1.75, 2.3, 36.8, 1, bronze, 32), block(4.6, 4.6, 37.8, 0.9, bronze));
  root.add(prism(1.55, 1.55, 38.7, 1.9, bronze, 32), at(dome(1.55, 0.9, bronze), 0, 40.6));
  root.add(at(angel(4.26, 2.6, figure), 0, 41.2), at(cross(6.4, figure), 0.45, 41.1, -0.35));
  return root;
}

// ── The Saviour on the Spilled Blood ────────────────────────────────────────
type Enamel = { pattern: Pattern; colors: [string, string, string?] };

const BLUE = "#26508c";
const GREEN = "#2f7a55";
const WHITE = "#f1ede2";
const GILT = "#d8b45a";

/** The four enamelled domes around the tent (Russian Wikipedia, « Купола »). */
const ENAMEL: Record<"nw" | "ne" | "sw" | "se", Enamel> = {
  nw: { pattern: "stripes", colors: [BLUE, GREEN] },
  ne: { pattern: "diamond", colors: [BLUE, GILT] },
  sw: { pattern: "chevron", colors: [WHITE, BLUE, GREEN] },
  se: { pattern: "diamond", colors: [WHITE, GREEN, GILT] },
};

const enamelled = (e: Enamel) => material(e.colors[0], patternTexture(e.pattern, ...e.colors), 0.45, 0.1);

/**
 * Frame: +x along the church from the bell tower (west, on the canal) to the
 * apses (east), +z across. Compact body crowned by five domes: the octagonal
 * tent rising to 81 m with its lantern and small striped onion, four
 * enamelled onions around it; the bell tower with its large gilded onion;
 * three small gilded onions over the apses. Nine onion domes in all.
 */
export function buildSauveur(): Group {
  const brick = lit("#9a4c3f", 0.14);
  const trim = lit("#efe7d8", 0.18);
  const roof = lit("#3f6b4f", 0.1, 0.7);
  const tiles = material("#2f6b52", patternTexture("diamond", "#2f6b52", "#e9e2cf", GILT), 0.6);
  const g = gold();
  const root = new Group();
  const cx = -1.5;
  // Body (четверик) and its roof.
  root.add(block(38, 31, 0, 26, brick, cx), block(38.8, 31.8, 26, 1, trim, cx), block(37, 30, 27, 3, roof, cx));
  // The tent: octagonal drum, tent, lantern, central onion (white, green and blue twisted bands).
  root.add(prism(7.6, 7.6, 30, 10, brick, 8, cx), prism(8, 8, 39.4, 0.8, trim, 8, cx), prism(7.2, 2.3, 40.2, 29.8, tiles, 8, cx), prism(2.2, 2.2, 70, 3.5, trim, 8, cx));
  root.add(at(new Mesh(onion(2.2, 5.2), enamelled({ pattern: "spiral", colors: [WHITE, GREEN, BLUE] })), cx, 73.5), at(cross(2.3, g), cx, 78.7));
  // Four enamelled onions on low drums, narrower than the domes.
  for (const [key, dx, dz] of [["nw", -9, -8.5], ["ne", 9, -8.5], ["sw", -9, 8.5], ["se", 9, 8.5]] as const) {
    root.add(prism(2.5, 2.5, 30, 5.5, brick, 16, cx + dx, dz), at(new Mesh(onion(2.9, 8.2), enamelled(ENAMEL[key])), cx + dx, 35.5, dz), at(cross(2.2, g), cx + dx, 43.6, dz));
  }
  // Bell tower over the canal, with its large gilded onion.
  root.add(block(10, 14.5, 0, 40, brick, -22.5, 3.75), block(10.6, 15.1, 40, 0.8, trim, -22.5, 3.75), prism(4.8, 4.6, 40.8, 6.5, brick, 8, -22.5, 3.75));
  root.add(prism(3.2, 3.2, 47.3, 2.2, trim, 16, -22.5, 3.75), at(new Mesh(onion(3.4, 8.5), g), -22.5, 49.5, 3.75), at(cross(2.6, g), -22.5, 57.9, 3.75));
  // Apses (east), with three small gilded onions.
  const apse = new Mesh(new CylinderGeometry(12.5, 12.5, 20, 24, 1, false, 0, Math.PI), brick);
  const apseRoof = new Mesh(new ConeGeometry(12.5, 4, 24, 1, false, 0, Math.PI), roof);
  root.add(at(apse, 17, 10), at(apseRoof, 17, 22));
  for (const a of [-0.9, 0, 0.9]) {
    const x = 17 + Math.cos(a) * 8, z = Math.sin(a) * 8;
    root.add(prism(1.5, 1.5, 21, 3, brick, 12, x, z), at(new Mesh(onion(1.6, 4.2), g), x, 24, z), at(cross(1.6, g), x, 28.2, z));
  }
  return root;
}
