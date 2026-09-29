"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Moscow seen from a plane at night, drawn once on a canvas.
 * The geometry follows the real radial-concentric plan of the city
 * (Boulevard Ring, Garden Ring, Third Ring, MKAD, the main radial
 * highways, the Moskva river and the largest parks), in kilometres
 * around the Kremlin. It is an illustration and is labelled as such.
 */

type Pt = { x: number; y: number; b: number; warm: boolean };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Moskva river, simplified polyline (km, x east / y north of the Kremlin)
const RIVER: [number, number][] = [
  [-18, 7], [-13, 10.5], [-9, 9], [-10.5, 5], [-8, 2.5], [-6.5, -1.5], [-4, -3.2], [-2.2, -2.4],
  [-1.6, -0.8], [-0.4, -0.3], [1.2, -0.6], [2.4, -2], [3.6, -4], [5.5, -6], [7, -8.5], [10, -9.5],
  [13, -12], [18, -14],
];

// Losiny Ostrov, Bitsa, Izmailovo, Kuzminki, Sokolniki, Fili, Kolomenskoye, Serebryany Bor
const PARKS = [
  { x: 7, y: 10, rx: 3.6, ry: 2.6 },
  { x: -2, y: -12.5, rx: 1.4, ry: 2.8 },
  { x: 8.5, y: 2.2, rx: 1.6, ry: 1.2 },
  { x: 8, y: -5.5, rx: 1.3, ry: 1.1 },
  { x: 3.2, y: 4.8, rx: 1.1, ry: 0.9 },
  { x: -7.8, y: 1.2, rx: 1.1, ry: 0.9 },
  { x: 4.3, y: -7.6, rx: 1, ry: 0.9 },
  { x: -12.5, y: 6, rx: 1.6, ry: 1.4 },
];

// Main radial highways, bearing in degrees clockwise from north
const RADIALS = [330, 355, 20, 60, 95, 115, 128, 165, 180, 205, 218, 260, 290, 312];

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function generate(): Pt[] {
  const rnd = mulberry32(1147); // the year Moscow is first mentioned in the chronicles
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const nearRiver = (x: number, y: number) => {
    for (let i = 0; i < RIVER.length - 1; i++) {
      const a = RIVER[i]!;
      const b = RIVER[i + 1]!;
      if (distToSegment(x, y, a[0], a[1], b[0], b[1]) < 0.28) return true;
    }
    return false;
  };
  const inPark = (x: number, y: number) => PARKS.some((p) => ((x - p.x) / p.rx) ** 2 + ((y - p.y) / p.ry) ** 2 < 1);

  const pts: Pt[] = [];
  const push = (x: number, y: number, b: number) => {
    if (nearRiver(x, y) || inPark(x, y)) return;
    // LED-lit centre, sodium-lit periphery
    const warmth = 0.22 + 0.4 * Math.min(1, Math.hypot(x, y) / 16);
    pts.push({ x, y, b, warm: rnd() < warmth });
  };
  // Organic outline for ring roads: low-frequency wobble instead of a perfect ellipse
  const wobble = (a: number, amount: number, phase: number) =>
    1 + amount * (0.6 * Math.sin(3 * a + phase) + 0.4 * Math.sin(7 * a + phase * 2.3));

  // 1. Neighbourhoods: clusters, dense inside the MKAD, thinning outwards
  for (let i = 0; i < 520; i++) {
    const r = -Math.log(1 - rnd() * 0.985) * 6.2;
    const a = rnd() * Math.PI * 2;
    const cx = Math.cos(a) * r * 0.9;
    const cy = Math.sin(a) * r * 1.05;
    const inside = Math.hypot(cx / 15, cy / 17.5) < 1;
    const n = inside ? 30 + rnd() * 60 : 6 + rnd() * 22;
    const spread = 0.22 + rnd() * 0.55;
    const base = inside ? 0.28 : 0.16;
    for (let j = 0; j < n; j++) {
      push(cx + gauss() * spread, cy + gauss() * spread, base + rnd() * 0.4 * Math.exp(-r / 14));
    }
  }

  // 2. Diffuse fabric that fills the gaps
  for (let i = 0; i < 9000; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd());
    const x = Math.cos(a) * r * 15.5;
    const y = Math.sin(a) * r * 18;
    push(x, y, 0.08 + 0.22 * rnd() * Math.exp(-r * 1.2));
  }

  // 3. Ring roads, brighter and continuous like lit highways
  const ring = (rx: number, ry: number, step: number, b: number, amount: number, skip?: (a: number) => boolean) => {
    const phase = rnd() * 6;
    const n = Math.round((2 * Math.PI * Math.max(rx, ry)) / step);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      if (skip?.(a)) continue;
      const w = wobble(a, amount, phase);
      push(Math.cos(a) * rx * w + gauss() * 0.025, Math.sin(a) * ry * w + gauss() * 0.025, b * (0.65 + 0.35 * rnd()));
    }
  };
  ring(1.35, 1.2, 0.07, 0.7, 0.03, (a) => a > 4.2 && a < 5.3); // Boulevard Ring, open towards the river
  ring(2.3, 2.1, 0.06, 0.85, 0.04); // Garden Ring
  ring(5.6, 5, 0.08, 0.6, 0.07); // Third Ring
  ring(15, 17.5, 0.09, 0.75, 0.035); // MKAD

  // 4. Radial highways: slightly curved, broken, fading beyond the MKAD
  for (const bearing of RADIALS) {
    const a0 = ((90 - bearing) * Math.PI) / 180;
    const bend = (rnd() - 0.5) * 0.12;
    for (let r = 1.2; r < 28; r += r < 16 ? 0.13 : 0.2) {
      if (rnd() < 0.18) continue;
      const a = a0 + bend * Math.sin(r / 6);
      const b = r < 16 ? 0.5 : 0.45 * Math.exp(-(r - 16) / 7);
      push(Math.cos(a) * r + gauss() * 0.05, Math.sin(a) * r + gauss() * 0.05, b * (0.6 + 0.4 * rnd()));
    }
    // Satellite towns at the end of some highways
    if (rnd() < 0.7) {
      const r = 20 + rnd() * 8;
      const cx = Math.cos(a0) * r;
      const cy = Math.sin(a0) * r;
      const n = 40 + rnd() * 70;
      for (let i = 0; i < n; i++) push(cx + gauss() * 0.8, cy + gauss() * 0.8, 0.18 + 0.35 * rnd());
    }
  }

  // 5. Historic centre and the Moskva-City towers, the two brightest points
  for (let i = 0; i < 420; i++) push(gauss() * 1.2, gauss() * 1.05, 0.4 + 0.4 * rnd());
  for (let i = 0; i < 90; i++) push(-4.6 + gauss() * 0.22, 0.9 + gauss() * 0.18, 0.6 + 0.3 * rnd());

  return pts;
}

function draw(canvas: HTMLCanvasElement, pts: Pt[]) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const sharp = document.createElement("canvas");
  sharp.width = Math.round(w * dpr);
  sharp.height = Math.round(h * dpr);
  const s = sharp.getContext("2d");
  if (!s) return;
  s.setTransform(dpr, 0, 0, dpr, 0, 0);
  s.globalCompositeOperation = "lighter";

  const portrait = h > w;
  // Portrait: the city fills the empty upper half, text sits below it
  const cx = w * (portrait ? 0.56 : 0.7);
  const cy = h * (portrait ? 0.36 : 0.6);
  const scale = portrait ? w / 19 : Math.min(w / 40, h / 24); // px per km
  const tilt = 0.58; // oblique view from an approaching plane
  const unit = Math.max(0.6, scale / 28);
  // Tighter scales pack more lights per pixel: dim them so the core does not blow out
  const exposure = Math.min(1, Math.max(0.5, scale / 30));

  for (const p of pts) {
    const depth = 1 - p.y / 70;
    const sx = cx + p.x * scale * depth;
    const sy = cy - p.y * scale * tilt * depth;
    if (sx < -8 || sx > w + 8 || sy < -8 || sy > h + 8) continue;
    const r = (0.3 + p.b * 0.75) * unit * depth;
    const alpha = (0.08 + p.b * 0.72) * exposure;
    s.fillStyle = p.warm ? `rgba(255,186,122,${alpha})` : `rgba(206,222,255,${alpha})`;
    s.fillRect(sx - r, sy - r, r * 2, r * 2);
  }

  canvas.width = sharp.width;
  canvas.height = sharp.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = "lighter";
  // Two haze passes (wide sodium glow, then a tighter bloom), then the sharp specks
  ctx.filter = `blur(${Math.round(22 * dpr)}px)`;
  ctx.globalAlpha = 0.75;
  ctx.drawImage(sharp, 0, 0);
  ctx.filter = `blur(${Math.round(5 * dpr)}px)`;
  ctx.globalAlpha = 0.7;
  ctx.drawImage(sharp, 0, 0);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.drawImage(sharp, 0, 0);
}

export function MoscowLights({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const pts = generate();
    let timer: number | undefined;
    let lastWidth = 0;

    const render = () => {
      draw(canvas, pts);
      lastWidth = canvas.clientWidth;
      setReady(true);
    };
    const observer = new ResizeObserver(() => {
      // Mobile browsers resize the viewport when the address bar moves: ignore height-only changes
      if (Math.abs(canvas.clientWidth - lastWidth) < 2 && lastWidth) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(render, 150);
    });

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    idle(render);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`transition-opacity duration-[2000ms] ease-verste ${ready ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
