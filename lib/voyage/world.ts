import type { ExpressionSpecification, GeoJSONFeature, GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

import { loadMapLibre } from "@/lib/map/load";
import { buildNightStyle, lights, mapColors, skies } from "@/lib/map/style";
import type { CameraView } from "@/lib/map/views";
import { sliceAlong } from "@/lib/travel/geo";
import type { LonLat } from "@/lib/travel/types";

import { buildFortress, distanceToWall, towerAnchor, towerDiscs, type Fortress } from "./fortress";
import type { Highlight, Mark, Outline, WorldLine } from "./types";

/**
 * The persistent world of the journey: one MapLibre map for every surface
 * scene. It lights the monument of the current scene (the real OpenStreetMap
 * building parts), draws outlines, fades day into night, and hosts the 3D
 * objects that replace OSM volumes where they are too crude (Saint Basil,
 * the Conquerors of Space, the spires and domes of Saint Petersburg).
 */

export type World = {
  map: MapLibreMap;
  setCamera(view: CameraView): void;
  setHighlights(ids: string[]): void;
  setOutlines(ids: string[]): void;
  setNight(t: number): void;
  /** The white nights of Saint Petersburg, 0 (off) to 1: a pale sky that never darkens, silver water. */
  setTone(t: number): void;
  /** Relief exaggeration, or null for a flat world. */
  setTerrain(exaggeration: number | null): void;
  /** The 3D objects of the world, by id. */
  objectIds: string[];
  /** How complete an object is, 0 (absent: its OSM volumes show) to 1. */
  setRise(objectId: string, t: number): void;
  /** Shows the tower names of these fortresses. */
  setLabels(fortressIds: string[]): void;
  /** The plane (or nothing): where it is, where it points, how high it flies (0–1). */
  setVehicle(v: VehicleState | null): void;
  /** The red thread of the journey: each leg drawn up to its progress; planned legs dotted. */
  setRoute(legs: RouteLeg[]): void;
  /** Shows these marks (airports, cities), hides the others. */
  setMarks(ids: string[]): void;
  /** Shows these named lines, hides the others. */
  setLines(ids: string[]): void;
  /** The points to explore of the scene; `onPick` receives the id clicked. */
  setHotspots(spots: { id: string; label: string; at: LonLat }[], onPick: (id: string) => void): void;
  /** An animated camera move (exploring a hotspot, coming back to the journey). */
  flyTo(view: CameraView, durationMs: number): void;
  resize(): void;
  destroy(): void;
};

export type VehicleState = { at: LonLat; heading: number; altitude: number; kind?: "avion" | "train" };
export type RouteLeg = { path: LonLat[]; t: number; showPlanned: boolean };

/** A small plane seen from above, nose up. Pure outline of the brand: light body, no logo. */
const PLANE_PATH =
  "M32 4c1.9 0 3 2.6 3 6v13.2l20.5 11.6c.8.5 1.3 1.3 1.3 2.2v2.3l-21.8-6.3v11.5l6.6 4.9c.4.3.6.7.6 1.2V53L32 50.6 21.8 53v-2.4c0-.5.2-.9.6-1.2l6.6-4.9V33l-21.8 6.3V37c0-.9.5-1.7 1.3-2.2L29 23.2V10c0-3.4 1.1-6 3-6z";
/** A high-speed train seen from above, nose up: long light body, a dark band of windows. */
const TRAIN_SVG =
  '<svg viewBox="0 0 64 64"><path d="M32 2c3.4 0 5.6 4.8 5.6 10.4V59c0 1.7-1.3 3-3 3h-5.2c-1.7 0-3-1.3-3-3V12.4C26.4 6.8 28.6 2 32 2z"/><path class="verste-train-windows" d="M30.3 13h3.4v44h-3.4z"/></svg>';

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
/** The white nights of Saint Petersburg: the light never goes, the Neva stays silver. */
const WHITE = { background: "#5b6882", water: "#a2b5d0", building: "#737f98", buildingTop: "#a7b1c5" };
/** Detailed OSM buildings are drawn from their parts: their outline (hide_3d) would be a crude box around them. */
const SHOW_3D: ExpressionSpecification = ["!", ["to-boolean", ["coalesce", ["get", "hide_3d"], false]]];
/**
 * OSM colour of a lit part (gilding, brick, green roofs), softened towards
 * the floodlight tone so the night holds together. `osm` is the share kept
 * of the OSM colour (a saturated `aquamarine` is toned down to the real green).
 */
const realColour = (light: string, osm = 0.7): ExpressionSpecification => ["interpolate", ["linear"], ["literal", 1 - osm], 0, ["to-color", ["get", "colour"], light], 1, light];
/** Glass towers at night: warm and cool windows, varied by building. */
const LIT_GLASS: ExpressionSpecification = ["match", ["%", ["id"], 3], 0, "#f2c983", 1, "#d6e4f5", "#9db6d8"];

export async function createWorld(
  container: HTMLElement,
  opts: { highlights: Highlight[]; outlines: Outline[]; start: CameraView; interactive?: boolean; objects?: boolean; fortresses?: Fortress[]; marks?: Mark[]; lines?: WorldLine[] },
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

  // ── The red thread and the plane ───────────────────────────────────────
  map.addSource("journey", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "journey-planned",
    type: "line",
    source: "journey",
    filter: ["==", ["get", "kind"], "planned"],
    layout: { "line-cap": "round" },
    paint: { "line-color": "#eef2f8", "line-opacity": 0.42, "line-width": 1.3, "line-dasharray": [0.6, 2.6] },
  });
  map.addLayer({
    id: "journey-flown",
    type: "line",
    source: "journey",
    filter: ["==", ["get", "kind"], "flown"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#e8485a", "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2.2, 10, 3.2] },
  });
  let routeKey = "";

  // Named lines: routes walked or ridden, and schematic links.
  map.addSource("lines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "lines-schematic",
    type: "line",
    source: "lines",
    filter: ["==", ["get", "style"], "schematic"],
    layout: { "line-cap": "round" },
    paint: { "line-color": "#eef2f8", "line-opacity": 0.6, "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.3, 12, 2.4], "line-dasharray": [2, 2.5] },
  });
  map.addLayer({
    id: "lines-route-glow",
    type: "line",
    source: "lines",
    filter: ["==", ["get", "style"], "route"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#e8485a", "line-opacity": 0.25, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 17, 16], "line-blur": 5 },
  });
  map.addLayer({
    id: "lines-route",
    type: "line",
    source: "lines",
    filter: ["==", ["get", "style"], "route"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#e8485a", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.8, 17, 5] },
  });
  let linesKey = "";

  const planeEl = document.createElement("div");
  planeEl.className = "verste-plane is-hidden";
  planeEl.setAttribute("aria-hidden", "true");
  planeEl.innerHTML = `<svg viewBox="0 0 64 64"><path d="${PLANE_PATH}"/></svg>`;
  const shadowEl = document.createElement("div");
  shadowEl.className = "verste-plane-shadow is-hidden";
  shadowEl.setAttribute("aria-hidden", "true");
  shadowEl.innerHTML = planeEl.innerHTML;
  const markerOptions = { rotationAlignment: "map" as const, pitchAlignment: "map" as const };
  const shadow = new ml.Marker({ element: shadowEl, ...markerOptions }).setLngLat([0, 0]).addTo(map);
  const plane = new ml.Marker({ element: planeEl, ...markerOptions }).setLngLat([0, 0]).addTo(map);
  const trainEl = document.createElement("div");
  trainEl.className = "verste-train is-hidden";
  trainEl.setAttribute("aria-hidden", "true");
  trainEl.innerHTML = TRAIN_SVG;
  const train = new ml.Marker({ element: trainEl, ...markerOptions }).setLngLat([0, 0]).addTo(map);
  let vehicleOn: "avion" | "train" | null = null;

  // ── Marks: airports and cities, in the brand's typography ──────────────
  const marks = new Map<string, HTMLElement>();
  for (const m of opts.marks ?? []) {
    const el = document.createElement("div");
    el.className = `verste-mark is-${m.kind} is-hidden`;
    el.setAttribute("aria-hidden", "true");
    const dot = document.createElement("span");
    dot.className = "verste-mark-dot";
    if (m.badge) {
      dot.textContent = m.badge.text;
      dot.style.background = m.badge.color;
    }
    const text = document.createElement("span");
    text.className = "verste-mark-text";
    const name = document.createElement("span");
    name.className = "verste-mark-name";
    name.textContent = m.name;
    text.append(name);
    if (m.ru) {
      const ru = document.createElement("span");
      ru.className = "verste-mark-ru";
      ru.lang = "ru";
      ru.textContent = m.ru;
      text.append(ru);
    }
    if (m.sub) {
      const sub = document.createElement("span");
      sub.className = "verste-mark-sub";
      sub.textContent = m.sub;
      text.append(sub);
    }
    el.append(dot, text);
    new ml.Marker({ element: el, anchor: "left", offset: [-6, 0] }).setLngLat([m.at[0], m.at[1]]).addTo(map);
    marks.set(m.id, el);
  }
  let marksKey = "";

  /**
   * The scene text covers the lower half on phones and the left column on
   * large screens: the camera always looks at the free part of the screen.
   */
  function framePadding() {
    const w = container.clientWidth;
    return w < 1024
      ? { top: 56, bottom: Math.round(container.clientHeight * 0.42), left: 0, right: 0 }
      : { top: 0, bottom: 0, left: Math.round(Math.min(520, w * 0.44) * 0.8), right: 0 };
  }

  // ── Hotspots: points to explore, real buttons ──────────────────────────
  let spotMarkers: InstanceType<typeof ml.Marker>[] = [];
  let spotsKey = "";

  // ── 3D objects (three.js, loaded with the world) ────────────────────────
  let objects: { ids: string[]; setRise(id: string, t: number): void; present(id: string): boolean } | null = null;
  let replaced: { id: string; center: LonLat; radiusM: number; minFrom?: number }[] = [];
  if (opts.objects !== false) {
    const [{ createObjectsLayer }, { worldObjects }] = await Promise.all([import("@/lib/map/objects-layer"), import("@/lib/map/world-objects")]);
    const layer = createObjectsLayer(ml.MercatorCoordinate, worldObjects);
    map.addLayer(layer.layer);
    objects = layer;
    replaced = layer.replaced;
  }

  // ── Fortresses: walls and towers stepping on the relief ─────────────────
  const fortresses = opts.fortresses ?? [];
  const discsOf = new Map(fortresses.map((f) => [f.id, towerDiscs(f)]));
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
      const els = f.towers.filter((t) => !t.minor).map((t): Label => {
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
  /** OSM parts replaced by each 3D object, and ids that also cover a part outside it (kept: hiding is by id). */
  const replacedBy = new Map<string, Set<number>>();
  const replacedMixed = new Set<number>();
  /** OSM parts replaced by a fortress, and features that mix wall parts with other buildings (kept). */
  const walled = new Set<number>();
  const mixed = new Set<number>();
  const add = (m: Map<string, Set<number>>, key: string, id: number) => {
    let set = m.get(key);
    if (!set) m.set(key, (set = new Set()));
    set.add(id);
  };
  const litIds = (id: string) => [...(found.get(id) ?? [])].filter((x) => !rejected.get(id)?.has(x));
  // An object's OSM volumes disappear only while the object stands: absent, the city keeps its own.
  const hiddenIds = () => [
    ...[...replacedBy].flatMap(([id, set]) => (objects?.present(id) ? [...set].filter((x) => !replacedMixed.has(x)) : [])),
    ...[...walled].filter((x) => !mixed.has(x)),
  ];
  let active: string[] = [];
  let night = 0;
  let tone = 0;
  let paintKey = "";
  let terrain: number | null = null;
  let sky: keyof typeof skies = "night";

  function scan() {
    const feats = map.querySourceFeatures("openmaptiles", { sourceLayer: "building" });
    // Every part of an id, across features and tiles: an id is replaced only if all its parts are.
    const parts = new Map<number, { cs: LonLat[]; min: number[] }>();
    for (const f of feats) {
      if (typeof f.id !== "number") continue;
      const cs = centroids(f);
      const c = cs[0];
      if (!c) continue;
      const height = Number(f.properties.render_height ?? 0);
      if (replaced.length) {
        const p = parts.get(f.id) ?? { cs: [], min: [] };
        p.cs.push(...cs);
        p.min.push(Number(f.properties.render_min_height ?? 0));
        parts.set(f.id, p);
      }
      // OSM wall and towers replaced by the fortress model (flat slabs would float on the slope).
      for (const fz of fortresses) {
        if (metres(c, fz.ring[0]!) > 2500) continue;
        if (fz.replaces === "towers") {
          const discs = discsOf.get(fz.id)!;
          const onTower = cs.map((q) => discs.some((d) => metres(q, d.at) < d.r));
          if (!onTower.some(Boolean) || height > 95) continue;
          if (onTower.every(Boolean)) walled.add(f.id);
          else mixed.add(f.id);
          continue;
        }
        if (height > 40) continue;
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
    for (const r of replaced) {
      for (const [id, p] of parts) {
        const near = p.cs.map((q) => metres(q, r.center) < r.radiusM);
        if (!near.some(Boolean)) continue;
        if (near.every(Boolean) && (r.minFrom === undefined || p.min.every((m) => m >= r.minFrom!))) add(replacedBy, r.id, id);
        else replacedMixed.add(id);
      }
    }
  }

  function paint(force = false) {
    const lit = active.map((id) => [id, litIds(id)] as const).filter(([, ids]) => ids.length);
    const gone = hiddenIds();
    const standing = objects ? objects.ids.map((id) => (objects!.present(id) ? 1 : 0)).join("") : "";
    const key = `${lit.map(([id, ids]) => `${id}:${ids.length}`).join("|")}#${night.toFixed(2)}#${tone.toFixed(2)}#${gone.length}#${standing}`;
    if (!force && key === paintKey) return;
    paintKey = key;
    // Night or dawn first, then the white nights over it.
    const base0 = night >= 0 ? NIGHT : DAWN;
    const k = Math.abs(night);
    const shade = (from: string, key: keyof typeof NIGHT) => mix(mix(from, base0[key], k), WHITE[key], tone);
    const building = shade(mapColors.building, "building");
    const top = shade(mapColors.buildingTop, "buildingTop");
    const base: ExpressionSpecification = ["interpolate", ["linear"], ["get", "render_height"], 0, building, 60, top];
    let color: ExpressionSpecification | string = base;
    if (lit.length) {
      const cases: unknown[] = ["case"];
      // A lit monument takes its real colours when OSM has them (gilded domes, brick, green roofs).
      for (const [id, ids] of lit) {
        const spec = specs.get(id)!;
        cases.push(["in", ["id"], ["literal", ids]], id === "moscow-city" ? LIT_GLASS : realColour(spec.color, spec.osm));
      }
      cases.push(base);
      color = cases as ExpressionSpecification;
    }
    map.setPaintProperty("building-3d", "fill-extrusion-color", color);
    const filter: ExpressionSpecification = gone.length ? ["all", SHOW_3D, ["!", ["in", ["id"], ["literal", gone]]]] : SHOW_3D;
    map.setFilter("building-3d", filter);
    map.setFilter("building-flat", filter);
    const nextSky: keyof typeof skies = tone > 0.5 ? "white" : night > 0.5 ? "deep" : night < -0.3 ? "dawn" : "night";
    if (nextSky !== sky) {
      sky = nextSky;
      map.setSky(skies[sky]);
      const l = sky === "white" ? lights.white : sky === "dawn" ? lights.dawn : lights.night;
      map.setLight({ ...l, position: [...l.position] });
    }
    map.setPaintProperty("background", "background-color", shade(mapColors.background, "background"));
    map.setPaintProperty("water", "fill-color", shade(mapColors.water, "water"));
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
      map.jumpTo({ center: [v.center[0], v.center[1]], zoom: v.zoom, pitch: v.pitch ?? 0, bearing: v.bearing ?? 0, padding: framePadding() });
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
    setTone(t) {
      const v = Math.round(Math.min(1, Math.max(0, t)) * 20) / 20;
      if (v === tone) return;
      tone = v;
      paint();
    },
    setTerrain(exaggeration) {
      if (exaggeration === terrain) return;
      terrain = exaggeration;
      map.setTerrain(exaggeration ? { source: "relief", exaggeration } : null);
    },
    objectIds: objects?.ids ?? [],
    setRise(id, t) {
      if (!objects) return;
      const was = objects.present(id);
      objects.setRise(id, t);
      if (objects.present(id) !== was) paint();
    },
    setVehicle(v) {
      const kind = v ? (v.kind ?? "avion") : null;
      if (kind !== vehicleOn) {
        vehicleOn = kind;
        planeEl.classList.toggle("is-hidden", kind !== "avion");
        shadowEl.classList.toggle("is-hidden", kind !== "avion");
        trainEl.classList.toggle("is-hidden", kind !== "train");
      }
      if (!v) return;
      if (kind === "train") {
        train.setLngLat([v.at[0], v.at[1]]).setRotation(v.heading);
        return;
      }
      // The plane climbs above its shadow (screen space) and grows a little.
      const lift = Math.round(v.altitude * 46);
      plane.setLngLat([v.at[0], v.at[1]]).setRotation(v.heading).setOffset([0, -lift]);
      shadow.setLngLat([v.at[0], v.at[1]]).setRotation(v.heading);
      planeEl.style.setProperty("--scale", String(0.78 + 0.42 * v.altitude));
      shadowEl.style.setProperty("--scale", String(0.78 + 0.1 * v.altitude));
      shadowEl.style.setProperty("--shade", String(0.5 - 0.3 * v.altitude));
    },
    setRoute(legs) {
      const key = legs.map((l) => `${l.t.toFixed(4)}${l.showPlanned ? "p" : ""}`).join("|");
      if (key === routeKey) return;
      routeKey = key;
      const features: GeoJSON.Feature[] = [];
      for (const l of legs) {
        if (l.showPlanned) features.push({ type: "Feature", properties: { kind: "planned" }, geometry: { type: "LineString", coordinates: l.path.map((q) => [q[0], q[1]]) } });
        if (l.t > 0) {
          const flown = sliceAlong(l.path, l.t);
          if (flown.length > 1) features.push({ type: "Feature", properties: { kind: "flown" }, geometry: { type: "LineString", coordinates: flown.map((q) => [q[0], q[1]]) } });
        }
      }
      (map.getSource("journey") as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features });
    },
    setHotspots(spots, onPick) {
      const key = spots.map((q) => q.id).join();
      if (key === spotsKey) return;
      spotsKey = key;
      for (const m of spotMarkers) m.remove();
      spotMarkers = spots.map((spot) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "verste-hotspot is-spot";
        el.setAttribute("aria-label", `Explorer : ${spot.label}`);
        const dot = document.createElement("span");
        dot.className = "verste-hotspot-dot";
        const text = document.createElement("span");
        text.textContent = spot.label;
        el.append(dot, text);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onPick(spot.id);
        });
        return new ml.Marker({ element: el, anchor: "left", offset: [-8, 0] }).setLngLat([spot.at[0], spot.at[1]]).addTo(map);
      });
    },
    flyTo(v, durationMs) {
      map.flyTo({ center: [v.center[0], v.center[1]], zoom: v.zoom, pitch: v.pitch ?? 0, bearing: v.bearing ?? 0, padding: framePadding(), duration: durationMs, essential: true });
    },
    setLines(ids) {
      const key = ids.join();
      if (key === linesKey) return;
      linesKey = key;
      const features = (opts.lines ?? [])
        .filter((l) => ids.includes(l.id))
        .map((l) => ({ type: "Feature" as const, properties: { style: l.style }, geometry: { type: "LineString" as const, coordinates: l.path.map((q) => [q[0], q[1]]) } }));
      (map.getSource("lines") as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features });
    },
    setMarks(ids) {
      const key = ids.join();
      if (key === marksKey) return;
      marksKey = key;
      for (const [id, el] of marks) el.classList.toggle("is-hidden", !ids.includes(id));
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
