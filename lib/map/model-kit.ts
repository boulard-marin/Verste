import { BoxGeometry, CanvasTexture, CylinderGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Vector2, type Material } from "three";

/**
 * Shared kit of the procedural monuments (Saint Basil, the Saviour on the
 * Spilled Blood, the golden spires and domes of Saint Petersburg, the
 * Conquerors of Space): patterned and onion domes, materials, crosses.
 * Units are metres; +x east, +y up, +z south.
 */

export type Pattern = "spiral" | "chevron" | "diamond" | "stripes" | "plain";

export const palette = {
  brick: "#8d4c3e",
  brickDark: "#6e3a30",
  trim: "#ebe5da",
  gold: "#c9a24a",
  green: "#3f6b4f",
  blue: "#1d3b6e",
  ochre: "#c08a3e",
  frost: "#d5dfea",
};

/** A tiling pattern for a dome: `b` (and `third`, alternating, when given) drawn over `a`. */
export function patternTexture(kind: Pattern, a: string, b: string, third?: string): CanvasTexture | null {
  if (kind === "plain") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = a;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = b;
  let n = 0;
  const next = () => (g.fillStyle = third && n++ % 2 ? third : b);
  if (kind === "spiral") {
    // Diagonal bands become spirals once wrapped around a lathe.
    for (let i = -256; i < 512; i += 64) {
      next();
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + 32, 0);
      g.lineTo(i + 32 + 256, 256);
      g.lineTo(i + 256, 256);
      g.fill();
    }
  } else if (kind === "stripes") {
    // Vertical bands, from the drum to the tip.
    for (let x = 0; x < 256; x += 32) {
      next();
      g.fillRect(x, 0, 16, 256);
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
        next();
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
  t.repeat.set(kind === "spiral" ? 2 : 4, kind === "spiral" || kind === "stripes" ? 1 : 2);
  return t;
}

/** Onion dome profile, from the drum (bottom) to the tip. */
export function onion(radius: number, height: number): LatheGeometry {
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

export function material(color: string, map?: CanvasTexture | null, roughness = 0.75, metalness = 0): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: map ? "#ffffff" : color, map: map ?? null, roughness, metalness });
}

export function cross(height: number, mat: Material): Group {
  const g = new Group();
  const v = new Mesh(new CylinderGeometry(0.12, 0.12, height, 6), mat);
  v.position.y = height / 2;
  const h = new Mesh(new CylinderGeometry(0.1, 0.1, height * 0.5, 6), mat);
  h.rotation.z = Math.PI / 2;
  h.position.y = height * 0.72;
  g.add(v, h);
  return g;
}

/**
 * Gilding that still reads as gold at night: metallic, with a faint warm
 * glow (the spires and domes are floodlit), since the scene has no
 * environment map for the metal to reflect.
 */
export function gold(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: "#d8b45a", roughness: 0.32, metalness: 0.65, emissive: "#4a3410", emissiveIntensity: 0.55 });
}

/** A slender cone (a spire), base radius `r` at y = 0, tip at y = `h`. */
export function spire(r: number, h: number, mat: Material, sides = 12): Mesh {
  const m = new Mesh(new CylinderGeometry(0.04, r, h, sides), mat);
  m.position.y = h / 2;
  return m;
}

/** A dome (half-ellipsoid) of radius `r` and height `h`, base at y = 0. */
export function dome(r: number, h: number, mat: Material): Mesh {
  const pts: Vector2[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new Vector2(Math.max(0.02, Math.cos(a) * r), Math.sin(a) * h));
  }
  return new Mesh(new LatheGeometry(pts, 40), mat);
}

export function stack(...parts: Mesh[]): Group {
  const g = new Group();
  g.add(...parts);
  return g;
}

/** A box standing on y = `y0`: width along x, depth along z. */
export function block(w: number, d: number, y0: number, h: number, mat: Material, x = 0, z = 0): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.position.set(x, y0 + h / 2, z);
  return m;
}

/** A vertical prism (cylinder, octagon…) standing on y = `y0`, tapering from `r0` to `r1`. */
export function prism(r0: number, r1: number, y0: number, h: number, mat: Material, sides = 24, x = 0, z = 0): Mesh {
  const m = new Mesh(new CylinderGeometry(r1, r0, h, sides), mat);
  m.position.set(x, y0 + h / 2, z);
  return m;
}

/** Columns evenly spaced on a circle of radius `r`, from `y0` up to `y0 + h`. */
export function colonnade(count: number, r: number, columnR: number, y0: number, h: number, mat: Material): Group {
  const g = new Group();
  const geometry = new CylinderGeometry(columnR, columnR * 1.08, h, 10);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const c = new Mesh(geometry, mat);
    c.position.set(Math.cos(a) * r, y0 + h / 2, Math.sin(a) * r);
    g.add(c);
  }
  return g;
}

/** Floodlit stone, plaster or metal: matt, with a faint glow so it still reads at night. */
export function lit(color: string, glow = 0.18, roughness = 0.8, metalness = 0): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness, metalness, emissive: color, emissiveIntensity: glow });
}
