import type { ExpressionSpecification, GeoJSONFeature, GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

import { loadMapLibre } from "@/lib/map/load";
import { buildNightStyle, lights, mapColors, skies } from "@/lib/map/style";
import type { CameraView } from "@/lib/map/views";
import type { LonLat } from "@/lib/travel/types";

import { buildFortress, distanceToWall, towerAnchor, type Fortress } from "./fortress";
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
  /** Relief exaggeration, or null for a flat world. */
  setTerrain(exaggeration: number | null): void;
  setRise(objectId: string, t: number): void;
  /** Shows the tower names of these fortresses. */
  setLabels(fortressIds: string[]): void;
  resize(): void;
  destroy(): void;
};

const R = 6371008.8;
const rad = Math.PI / 180;
const metres = (a: LonLat, b: LonLat) => Math.hypot((b[0] - a[0]) * rad * Math.cos(a[1] * rad), (b[1] - a[1]) * rad) * R;

/** Centroid of every polygon of a feature: one OSM building relation can have parts far apart. */
function centroids(f: GeoJSONFeature): LonLat[] {
  const g = f.geometry;
  const rings = g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((poly) => poly[0]) : [];
  const out: LonLat[] = [];
  for (const ring of rings) {
    if (!ring?.length) continue;
    let x = 0, y = 0;
    for (const q of ring) {
      x += q[0]!;
      y += q[1]!;
    }
    out.push([x / ring.length, y / ring.length]);
  }
  return out;
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

export async function createWorld(
  container: HTMLElement,
  opts: { highlights: Highlight[]; outlines: Outline[]; start: CameraView; interactive?: boolean; objects?: boolean; fortresses?: Fortress[] },
): Promise<World> {
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

  // Ready as soon as the style is: tiles stream in afterwards, instead of a long wait on a still photo.
  await new Promise<void>((resolve) => (map.isStyleLoaded() ? resolve() : map.once("style.load", () => resolve())));

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
  const risers: Record<string, (t: number) => void> = {};
  const replaced: Record<string, { center: LonLat; radiusM: number }> = {};
  if (opts.objects !== false) {
    const model = await import("@/lib/map/saint-basil-model");
    const basil = model.createSaintBasilLayer(ml.MercatorCoordinate, 0);
    map.addLayer(basil.layer);
    basil.setRise(0);
    risers["saint-basile"] = basil.setRise;
    replaced["saint-basile"] = { center: model.SAINT_BASIL_CENTER, radiusM: 40 };
  }

  // ── Fortresses: walls and towers stepping on the relief ─────────────────
  const fortresses = opts.fortresses ?? [];
  type Label = { el: HTMLElement; marker: InstanceType<typeof ml.Marker>; at: LonLat; heightM: number };
  const labels = new Map<string, Label[]>();
  let shownLabels = "";
  if (fortresses.length) {
    map.addSource("fortress", {
      type: "geojson",
      data: { type: "FeatureCollection", features: fortresses.flatMap((f) => buildFortress(f).features) },
      tolerance: 0.15,
      buffer: 32,
    });
    map.addLayer({
      id: "fortress",
      type: "fill-extrusion",
      source: "fortress",
      minzoom: 12.5,
      paint: {
        "fill-extrusion-color": ["get", "color"],
        "fill-extrusion-base": ["get", "base"],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-opacity": 1,
        "fill-extrusion-vertical-gradient": true,
      },
    });
    for (const f of fortresses) {
      const els = f.towers.map((t): Label => {
        const el = document.createElement("div");
        el.className = "verste-tower is-hidden";
        el.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.className = "verste-tower-name";
        name.textContent = `Tour ${t.fr}`;
        const ru = document.createElement("span");
        ru.lang = "ru";
        ru.textContent = t.ru;
        name.append(ru);
        const mast = document.createElement("span");
        mast.className = "verste-tower-mast";
        el.append(name, mast);
        const at = towerAnchor(t);
        const marker = new ml.Marker({ element: el, anchor: "bottom", opacityWhenCovered: "0" }).setLngLat([...at]).addTo(map);
        return { el, marker, at, heightM: Math.max(...t.parts.map((q) => q.h)) + 2.4 };
      });
      labels.set(f.id, els);
    }
  }

  /** Tower names: the few nearest the camera's focus, each on a mast rising from its roof. */
  const LABELS_SHOWN = 6;
  function placeLabels() {
    const ids = shownLabels ? shownLabels.split(",") : [];
    const c = map.getCenter();
    const centre: LonLat = [c.lng, c.lat];
    // Metres per screen pixel (512 px tiles), then the tower's apparent height at this pitch.
    const mpp = (40075016.7 * Math.cos(c.lat * rad)) / (512 * 2 ** map.getZoom());
    const lift = Math.sin(map.getPitch() * rad) / mpp;
    // Never under the scene text: the left column on large screens, the lower half on phones.
    const w = container.clientWidth, h = container.clientHeight;
    const narrow = w < 1024;
    const free = (at: LonLat) => {
      const q = map.project([at[0], at[1]]);
      return q.x > 24 && q.x < w - 24 && q.y > 70 && (narrow ? q.y < h * 0.52 : q.x > Math.min(520, w * 0.44) + 24);
    };
    for (const [id, list] of labels) {
      const on = ids.includes(id);
      const nearest = new Set(on ? list.filter((l) => free(l.at)).sort((a, b) => metres(a.at, centre) - metres(b.at, centre)).slice(0, narrow ? 3 : LABELS_SHOWN) : []);
      for (const l of list) {
        l.el.classList.toggle("is-hidden", !nearest.has(l));
        if (nearest.has(l)) l.marker.setOffset([0, -Math.round(l.heightM * lift)]);
      }
    }
  }

  // ── Highlights and hidden OSM parts, resolved from loaded tiles ────────
  const specs = new Map(opts.highlights.map((h) => [h.id, h]));
  const found = new Map<string, Set<number>>();
  /** Features with at least one part outside a highlight: never lit (a match on id lights every part). */
  const rejected = new Map<string, Set<number>>();
  const hidden = new Set<number>();
  /** OSM parts replaced by a fortress, and features that mix wall parts with other buildings (kept). */
  const walled = new Set<number>();
  const mixed = new Set<number>();
  const add = (m: Map<string, Set<number>>, key: string, id: number) => {
    let set = m.get(key);
    if (!set) m.set(key, (set = new Set()));
    set.add(id);
  };
  const litIds = (id: string) => [...(found.get(id) ?? [])].filter((x) => !rejected.get(id)?.has(x));
  const hiddenIds = () => [...hidden, ...[...walled].filter((x) => !mixed.has(x))];
  let active: string[] = [];
  let night = 0;
  let paintKey = "";
  let terrain: number | null = null;
  let sky: keyof typeof skies = "night";

  function scan() {
    const feats = map.querySourceFeatures("openmaptiles", { sourceLayer: "building" });
    for (const f of feats) {
      if (typeof f.id !== "number") continue;
      const cs = centroids(f);
      const c = cs[0];
      if (!c) continue;
      const height = Number(f.properties.render_height ?? 0);
      for (const r of Object.values(replaced)) if (metres(c, r.center) < r.radiusM) hidden.add(f.id);
      // OSM wall and towers replaced by the fortress model (flat slabs would float on the slope).
      for (const fz of fortresses) {
        if (metres(c, fz.ring[0]!) > 1500 || height > 40) continue;
        const near = cs.map((q) => distanceToWall(fz, q) < 14);
        if (!near.some(Boolean)) continue;
        if (cs.every((q, i) => near[i] || inside(q, fz.ring))) walled.add(f.id);
        else mixed.add(f.id);
      }
      for (const h of specs.values()) {
        const ok = (q: LonLat) => metres(q, h.center) <= h.radiusM && (!h.within || inside(q, h.within));
        if (!cs.some(ok)) continue;
        if (!cs.every(ok) || (h.minHeight && height < h.minHeight)) add(rejected, h.id, f.id);
        else add(found, h.id, f.id);
      }
    }
  }

  function paint(force = false) {
    const lit = active.map((id) => [id, litIds(id)] as const).filter(([, ids]) => ids.length);
    const gone = hiddenIds();
    const key = `${lit.map(([id, ids]) => `${id}:${ids.length}`).join("|")}#${night.toFixed(2)}#${gone.length}`;
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
      for (const [id, ids] of lit) cases.push(["in", ["id"], ["literal", ids]], id === "moscow-city" ? LIT_GLASS : specs.get(id)!.color);
      cases.push(base);
      color = cases as ExpressionSpecification;
    }
    map.setPaintProperty("building-3d", "fill-extrusion-color", color);
    const filter = gone.length ? (["!", ["in", ["id"], ["literal", gone]]] as ExpressionSpecification) : null;
    map.setFilter("building-3d", filter);
    map.setFilter("building-flat", filter);
    const nextSky: keyof typeof skies = night > 0.5 ? "deep" : night < -0.3 ? "dawn" : "night";
    if (nextSky !== sky) {
      sky = nextSky;
      map.setSky(skies[sky]);
      const l = sky === "dawn" ? lights.dawn : lights.night;
      map.setLight({ ...l, position: [...l.position] });
    }
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
      // On phones the scene text covers the lower half: the camera looks at the upper part.
      const narrow = container.clientWidth < 1024;
      const padding = { top: narrow ? 56 : 0, bottom: narrow ? Math.round(container.clientHeight * 0.42) : 0, left: 0, right: 0 };
      map.jumpTo({ center: [v.center[0], v.center[1]], zoom: v.zoom, pitch: v.pitch ?? 0, bearing: v.bearing ?? 0, padding });
      if (shownLabels) placeLabels();
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
    setTerrain(exaggeration) {
      if (exaggeration === terrain) return;
      terrain = exaggeration;
      map.setTerrain(exaggeration ? { source: "relief", exaggeration } : null);
    },
    setRise(id, t) {
      risers[id]?.(t);
    },
    setLabels(ids) {
      const key = ids.join();
      if (key === shownLabels) return;
      shownLabels = key;
      placeLabels();
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
