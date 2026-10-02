import { CylinderGeometry, Group, Mesh } from "three";

import { cross, material, onion, palette, patternTexture, type Pattern } from "./model-kit";

/**
 * Saint Basil's Cathedral, modelled procedurally and placed at its real
 * coordinates inside the MapLibre scene. Stylised on purpose ("proportions
 * indicatives"): what matters is the plan the photo cannot show — one central
 * church under a tent roof, four large churches on the axes, four small ones
 * on the diagonals, all on a single base.
 *
 * Units are metres; +x east, +y up, +z south (three.js), converted to
 * Mercator in render().
 */

/** Centre of the central church, from the OpenStreetMap building parts (the Wikipedia point is ~20 m off). */
export const SAINT_BASIL_CENTER: [number, number] = [37.623064, 55.752487];

type Chapel = { x: number; z: number; radius: number; height: number; sides: number; dome: { r: number; h: number; pattern: Pattern; a: string; b: string } };

function buildChapel(c: Chapel, mats: ReturnType<typeof sharedMaterials>): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(c.radius, c.radius * 1.04, c.height, c.sides), mats.brick);
  body.position.y = c.height / 2;
  const cornice = new Mesh(new CylinderGeometry(c.radius * 1.08, c.radius * 1.08, 0.6, c.sides), mats.trim);
  cornice.position.y = c.height;
  const drumH = c.dome.r * 1.1;
  const drum = new Mesh(new CylinderGeometry(c.dome.r * 0.78, c.dome.r * 0.82, drumH, 16), mats.brickDark);
  drum.position.y = c.height + drumH / 2;
  const tex = patternTexture(c.dome.pattern, c.dome.a, c.dome.b);
  const dome = new Mesh(onion(c.dome.r * 0.8, c.dome.h), material(c.dome.a, tex, c.dome.pattern === "plain" ? 0.35 : 0.6, c.dome.pattern === "plain" ? 0.6 : 0));
  dome.position.y = c.height + drumH;
  const x = cross(2.4, mats.gold);
  x.position.y = c.height + drumH + c.dome.h - 0.1;
  g.add(body, cornice, drum, dome, x);
  g.position.set(c.x, 6, c.z);
  return g;
}

function sharedMaterials() {
  return {
    brick: material(palette.brick),
    brickDark: material(palette.brickDark),
    trim: material(palette.trim, null, 0.9),
    gold: material(palette.gold, null, 0.3, 0.7),
  };
}

/** The cathedral as a three.js group, base at y = 0. */
export function buildSaintBasil(): Group {
  const mats = sharedMaterials();
  const root = new Group();

  // Base (podklet) and gallery: one platform for all the churches.
  const base = new Mesh(new CylinderGeometry(27, 28, 6, 8), mats.brick);
  base.position.y = 3;
  base.rotation.y = Math.PI / 8;
  const gallery = new Mesh(new CylinderGeometry(27.4, 27.4, 0.8, 8), mats.trim);
  gallery.position.y = 6;
  gallery.rotation.y = Math.PI / 8;
  root.add(base, gallery);

  // Central church of the Intercession: octagon + tent roof.
  const central = new Group();
  const tower = new Mesh(new CylinderGeometry(8, 8.6, 22, 8), mats.brick);
  tower.position.y = 11;
  const kokoshniks = new Mesh(new CylinderGeometry(8.6, 8.6, 2.2, 8), mats.trim);
  kokoshniks.position.y = 22.5;
  const tent = new Mesh(new CylinderGeometry(0.9, 7.2, 24, 8), material(palette.trim, patternTexture("diamond", palette.trim, palette.green), 0.8));
  tent.position.y = 23.6 + 12;
  const drum = new Mesh(new CylinderGeometry(1.4, 1.6, 3, 12), mats.brickDark);
  drum.position.y = 23.6 + 24 + 1.5;
  const dome = new Mesh(onion(1.6, 5), material(palette.gold, null, 0.3, 0.7));
  dome.position.y = 23.6 + 24 + 3;
  const c = cross(3, mats.gold);
  c.position.y = 23.6 + 24 + 3 + 4.9;
  central.add(tower, kokoshniks, tent, drum, dome, c);
  central.position.y = 6;
  root.add(central);

  // Four large churches on the axes, four small ones on the diagonals.
  const axial: Chapel[] = [
    { x: 0, z: -17, radius: 5.2, height: 15, sides: 8, dome: { r: 4.4, h: 8.5, pattern: "spiral", a: palette.green, b: palette.ochre } },
    { x: 17, z: 0, radius: 5.2, height: 16, sides: 8, dome: { r: 4.6, h: 9, pattern: "chevron", a: palette.frost, b: palette.blue } },
    { x: 0, z: 17, radius: 5.2, height: 15, sides: 8, dome: { r: 4.4, h: 8.5, pattern: "diamond", a: palette.ochre, b: palette.green } },
    { x: -17, z: 0, radius: 5.4, height: 17, sides: 8, dome: { r: 4.8, h: 9.5, pattern: "spiral", a: palette.blue, b: palette.frost } },
  ];
  const diagonal: Chapel[] = [
    { x: 12, z: -12, radius: 3.4, height: 11, sides: 12, dome: { r: 3.2, h: 6.2, pattern: "spiral", a: palette.ochre, b: palette.trim } },
    { x: 12, z: 12, radius: 3.4, height: 11, sides: 12, dome: { r: 3.2, h: 6.2, pattern: "diamond", a: palette.green, b: palette.trim } },
    { x: -12, z: 12, radius: 3.4, height: 11, sides: 12, dome: { r: 3.2, h: 6.2, pattern: "chevron", a: palette.gold, b: palette.green } },
    { x: -12, z: -12, radius: 3.4, height: 11, sides: 12, dome: { r: 3.2, h: 6.2, pattern: "spiral", a: palette.frost, b: palette.green } },
  ];
  for (const ch of [...axial, ...diagonal]) root.add(buildChapel(ch, mats));

  // Bell tower, south-east of the complex.
  const bell = new Group();
  const bBase = new Mesh(new CylinderGeometry(3.4, 3.6, 12, 4), mats.brick);
  bBase.rotation.y = Math.PI / 4;
  bBase.position.y = 6;
  const bTop = new Mesh(new CylinderGeometry(2.6, 2.9, 8, 8), mats.trim);
  bTop.position.y = 16;
  const bTent = new Mesh(new CylinderGeometry(0.4, 2.8, 9, 8), material(palette.green));
  bTent.position.y = 24.5;
  const bDome = new Mesh(onion(0.8, 2.6), material(palette.gold, null, 0.3, 0.7));
  bDome.position.y = 29;
  bell.add(bBase, bTop, bTent, bDome);
  bell.position.set(25, 0, 14);
  root.add(bell);

  return root;
}
