import type { ExpressionSpecification, GeoJSONFeature, GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

import { loadMapLibre } from "@/lib/map/load";
import { buildNightStyle, mapColors } from "@/lib/map/style";
import type { CameraView } from "@/lib/map/views";
import type { LonLat } from "@/lib/travel/types";

import type { Highlight, Outline } from "./types";

/**
 * The persistent world of the journey: one MapLibre map for every surface
 * scene. It lights the monument of the current scene (the real OpenStreetMap
 * building parts), draws outlines, fades day into night, and hosts the 3D
 * objects that replace OSM volumes where they are too crude (Saint Basil).
 */

export type World = {
  map: MapLibreMap;
  setCamera(view: CameraView): void;
  setHighlights(ids: string[]): void;
  setOutlines(ids: string[]): void;
  setNight(t: number): void;
  setRise(objectId: string, t: number): void;
  resize(): void;
  destroy(): void;
};

const R = 6371008.8;
const rad = Math.PI / 180;
const metres = (a: LonLat, b: LonLat) => Math.hypot((b[0] - a[0]) * rad * Math.cos(a[1] * rad), (b[1] - a[1]) * rad) * R;

function centroid(f: GeoJSONFeature): LonLat | null {
  const g = f.geometry;
  const ring = g.type === "Polygon" ? g.coordinates[0] : g.type === "MultiPolygon" ? g.coordinates[0]?.[0] : null;
  if (!ring || ring.length === 0) return null;
  let x = 0, y = 0;
  for (const p of ring) {
    x += p[0]!;
    y += p[1]!;
  }
  return [x / ring.length, y / ring.length];
}

function inside(p: LonLat, ring: readonly LonLat[]): boolean {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!, b = ring[j]!;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i]! - v) * t).toString(16).padStart(2, "0")).join("")}`;
};

const NIGHT = { background: "#07090d", water: "#07142a", building: "#0e1420", buildingTop: "#151d2c" };
/** Dawn over the Volga: the only morning of the journey (« De la nuit à l'aube »). */
const DAWN = { background: "#1d2533", water: "#2b4f82", building: "#2a3446", buildingTop: "#3b4860" };
/** Glass towers at night: warm and cool windows, varied by building. */
const LIT_GLASS: ExpressionSpecification = ["match", ["%", ["id"], 3], 0, "#f2c983", 1, "#d6e4f5", "#9db6d8"];

export async function createWorld(container: HTMLElement, opts: { highlights: Highlight[]; outlines: Outline[]; start: CameraView; interactive?: boolean }): Promise<World> {
  const ml = await loadMapLibre();
  const map = new ml.Map({
    container,
    style: buildNightStyle(),
    center: [opts.start.center[0], opts.start.center[1]],
    zoom: opts.start.zoom,
    pitch: opts.start.pitch ?? 0,
    bearing: opts.start.bearing ?? 0,
    maxPitch: 75,
    attributionControl: { compact: true },
    fadeDuration: 0,
  });
  if (!opts.interactive) {
    for (const h of [map.scrollZoom, map.dragPan, map.dragRotate, map.touchZoomRotate, map.touchPitch, map.doubleClickZoom, map.keyboard, map.boxZoom]) h.disable();
  }
  if (process.env.NODE_ENV !== "production") Object.assign(window, { __verste_world: map });

  await new Promise<void>((resolve) => map.once("load", () => resolve()));

  // ── Outlines ────────────────────────────────────────────────────────────
  map.addSource("outlines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "outline-glow",
    type: "line",
    source: "outlines",
    layout: { "line-join": "round" },
    paint: { "line-color": "#e8485a", "line-opacity": 0.25, "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 16, 14], "line-blur": 6 },
  });
  map.addLayer({
    id: "outline",
    type: "line",
    source: "outlines",
    layout: { "line-join": "round" },
    paint: { "line-color": "#e8485a", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1, 16, 2.5] },
  });

  // ── 3D objects (three.js, loaded with the first object) ────────────────
  const model = await import("@/lib/map/saint-basil-model");
  const basil = model.createSaintBasilLayer(ml.MercatorCoordinate, 0);
  map.addLayer(basil.layer);
  basil.setRise(0);
  const risers: Record<string, (t: number) => void> = { "saint-basile": basil.setRise };
  const replaced: Record<string, { center: LonLat; radiusM: number }> = { "saint-basile": { center: model.SAINT_BASIL_CENTER, radiusM: 40 } };

  // ── Highlights and hidden OSM parts, resolved from loaded tiles ────────
  const specs = new Map(opts.highlights.map((h) => [h.id, h]));
  const found = new Map<string, Set<number>>();
  const hidden = new Set<number>();
  let active: string[] = [];
  let night = 0;
  let paintKey = "";

  function scan() {
    const feats = map.querySourceFeatures("openmaptiles", { sourceLayer: "building" });
    for (const f of feats) {
      if (typeof f.id !== "number") continue;
      const c = centroid(f);
      if (!c) continue;
      for (const r of Object.values(replaced)) if (metres(c, r.center) < r.radiusM) hidden.add(f.id);
      for (const h of specs.values()) {
        if (metres(c, h.center) > h.radiusM) continue;
        if (h.within && !inside(c, h.within)) continue;
        if (h.minHeight && Number(f.properties.render_height ?? 0) < h.minHeight) continue;
        let set = found.get(h.id);
        if (!set) found.set(h.id, (set = new Set()));
        set.add(f.id);
      }
    }
  }

  function paint(force = false) {
    const lit = active.filter((id) => found.get(id)?.size);
    const key = `${lit.map((id) => `${id}:${found.get(id)!.size}`).join("|")}#${night.toFixed(2)}#${hidden.size}`;
    if (!force && key === paintKey) return;
    paintKey = key;
    const tone = night >= 0 ? NIGHT : DAWN;
    const k = Math.abs(night);
    const building = mix(mapColors.building, tone.building, k);
    const top = mix(mapColors.buildingTop, tone.buildingTop, k);
    const base: ExpressionSpecification = ["interpolate", ["linear"], ["get", "render_height"], 0, building, 60, top];
    let color: ExpressionSpecification | string = base;
    if (lit.length) {
      const cases: unknown[] = ["case"];
      for (const id of lit) cases.push(["in", ["id"], ["literal", [...found.get(id)!]]], id === "moscow-city" ? LIT_GLASS : specs.get(id)!.color);
      cases.push(base);
      color = cases as ExpressionSpecification;
    }
    map.setPaintProperty("building-3d", "fill-extrusion-color", color);
    const filter = hidden.size ? (["!", ["in", ["id"], ["literal", [...hidden]]]] as ExpressionSpecification) : null;
    map.setFilter("building-3d", filter);
    map.setFilter("building-flat", filter);
    map.setPaintProperty("background", "background-color", mix(mapColors.background, tone.background, k));
    map.setPaintProperty("water", "fill-color", mix(mapColors.water, tone.water, k));
  }

  let scanTimer = 0;
  map.on("sourcedata", (e) => {
    if (e.sourceId !== "openmaptiles" || !e.isSourceLoaded) return;
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(() => {
      scan();
      paint();
    }, 120);
  });

  return {
    map,
    setCamera(v) {
      map.jumpTo({ center: [v.center[0], v.center[1]], zoom: v.zoom, pitch: v.pitch ?? 0, bearing: v.bearing ?? 0 });
    },
    setHighlights(ids) {
      if (ids.join() === active.join()) return;
      active = ids;
      paint();
    },
    setOutlines(ids) {
      const src = map.getSource("outlines") as GeoJSONSource | undefined;
      src?.setData({
        type: "FeatureCollection",
        features: opts.outlines
          .filter((o) => ids.includes(o.id))
          .map((o) => ({ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: o.ring.map((p) => [p[0], p[1]]) } })),
      });
    },
    setNight(t) {
      // -1 = dawn, 0 = the default night-blue style, 1 = deep night.
      const v = Math.round(Math.min(1, Math.max(-1, t)) * 20) / 20;
      if (v === night) return;
      night = v;
      paint();
    },
    setRise(id, t) {
      risers[id]?.(t);
    },
    resize() {
      map.resize();
    },
    destroy() {
      window.clearTimeout(scanTimer);
      map.remove();
    },
  };
}
