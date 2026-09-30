import type { CustomLayerInterface, Map as MapLibreMap, MercatorCoordinate as MercatorCoordinateType } from "maplibre-gl";
import {
  AmbientLight,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";

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

export const SAINT_BASIL_CENTER: [number, number] = [37.62322, 55.75267];

type Pattern = "spiral" | "chevron" | "diamond" | "plain";

const palette = {
  brick: "#8d4c3e",
  brickDark: "#6e3a30",
  trim: "#ebe5da",
  gold: "#c9a24a",
  green: "#3f6b4f",
  blue: "#1d3b6e",
  ochre: "#c08a3e",
  frost: "#d5dfea",
};

function patternTexture(kind: Pattern, a: string, b: string): CanvasTexture | null {
  if (kind === "plain") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = a;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = b;
  if (kind === "spiral") {
    // Diagonal bands become spirals once wrapped around a lathe.
    for (let i = -256; i < 512; i += 64) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + 32, 0);
      g.lineTo(i + 32 + 256, 256);
      g.lineTo(i + 256, 256);
      g.fill();
    }
  } else if (kind === "chevron") {
    for (let y = -32; y < 288; y += 48) {
      g.beginPath();
      for (let x = 0; x <= 256; x += 32) g.lineTo(x, y + ((x / 32) % 2 === 0 ? 0 : 20));
      for (let x = 256; x >= 0; x -= 32) g.lineTo(x, y + 18 + ((x / 32) % 2 === 0 ? 0 : 20));
      g.fill();
    }
  } else {
    for (let y = 0; y < 256; y += 32) {
      for (let x = (y / 32) % 2 === 0 ? 0 : 16; x < 256; x += 32) {
        g.beginPath();
        g.moveTo(x + 16, y);
        g.lineTo(x + 32, y + 16);
        g.lineTo(x + 16, y + 32);
        g.lineTo(x, y + 16);
        g.fill();
      }
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.repeat.set(kind === "spiral" ? 2 : 4, kind === "spiral" ? 1 : 2);
  return t;
}

/** Onion dome profile, from the drum (bottom) to the tip. */
function onion(radius: number, height: number): LatheGeometry {
  const pts: Vector2[] = [new Vector2(0.01, 0)];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Swells from the drum to 1.3 r at a third of the height, then tapers to a point.
    const r = t < 0.35 ? radius * (0.85 + (t / 0.35) * 0.45) : radius * 1.3 * Math.pow(Math.cos(((t - 0.35) / 0.65) * (Math.PI / 2)), 1.35);
    pts.push(new Vector2(Math.max(0.02, r), t * height));
  }
  return new LatheGeometry(pts, 32);
}

function material(color: string, map?: CanvasTexture | null, roughness = 0.75, metalness = 0): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: map ? "#ffffff" : color, map: map ?? null, roughness, metalness });
}

function cross(height: number, mat: Material): Group {
  const g = new Group();
  const v = new Mesh(new CylinderGeometry(0.12, 0.12, height, 6), mat);
  v.position.y = height / 2;
  const h = new Mesh(new CylinderGeometry(0.1, 0.1, height * 0.5, 6), mat);
  h.rotation.z = Math.PI / 2;
  h.position.y = height * 0.72;
  g.add(v, h);
  return g;
}

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

/**
 * MapLibre custom layer drawing the model. `setRise(t)` animates it out of
 * the ground (0 = hidden, 1 = standing); the map repaints on demand only.
 */
export function createSaintBasilLayer(MercatorCoordinate: typeof MercatorCoordinateType, bearingDeg = 0) {
  const origin = MercatorCoordinate.fromLngLat(SAINT_BASIL_CENTER, 0);
  const scale = origin.meterInMercatorCoordinateUnits();
  const camera = new PerspectiveCamera();
  const scene = new Scene();
  const model = buildSaintBasil();
  model.rotation.y = (-bearingDeg * Math.PI) / 180;
  scene.add(model);
  scene.add(new HemisphereLight("#dfe8f5", "#3a2f2a", 1.1));
  scene.add(new AmbientLight("#ffffff", 0.25));
  const sun = new DirectionalLight("#ffd9ae", 2.2);
  // Low sun from the west-south-west: the golden hour of the founder's photo.
  sun.position.set(-80, 45, 30);
  scene.add(sun);

  let renderer: WebGLRenderer | null = null;
  let map: MapLibreMap | null = null;
  let rise = 1;

  const layer: CustomLayerInterface = {
    id: "saint-basil-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(m, gl) {
      map = m;
      renderer = new WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true });
      renderer.autoClear = false;
    },
    render(_gl, args) {
      if (!renderer || rise <= 0.001) return;
      model.scale.set(1, Math.max(0.001, rise), 1);
      const m = new Matrix4().fromArray(args.defaultProjectionData.mainMatrix as unknown as number[]);
      const l = new Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z)
        .scale(new Vector3(scale, -scale, scale))
        .multiply(new Matrix4().makeRotationX(Math.PI / 2));
      camera.projectionMatrix = m.multiply(l);
      renderer.resetState();
      renderer.render(scene, camera);
    },
    onRemove() {
      renderer?.dispose();
      renderer = null;
      map = null;
    },
  };

  return {
    layer,
    setRise(t: number) {
      rise = Math.min(1, Math.max(0, t));
      map?.triggerRepaint();
    },
  };
}

/** Small polygon around the cathedral, to hide the flat OSM building beneath the model. */
export function saintBasilFootprint(radiusM = 42): GeoJSON.Polygon {
  const [lon, lat] = SAINT_BASIL_CENTER;
  const dLat = radiusM / 111_320;
  const dLon = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180));
  const ring: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ring.push([lon + Math.cos(a) * dLon, lat + Math.sin(a) * dLat]);
  }
  return { type: "Polygon", coordinates: [ring] };
}
