import "server-only";

import { geoConicConformal, geoDistance, geoGraticule10, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

import { nextStops, route, type LonLat, type Waypoint } from "@/data/route";
import { formatCoords, formatKm } from "@/lib/format";

/**
 * Everything geographic is computed here, on the server, at build time.
 * The browser receives SVG path strings and positions, never d3.
 * Source data: Natural Earth 1:110m (public domain) via world-atlas.
 */

export const MAP = { width: 1200, height: 900 } as const;

/** Mean Earth radius (IUGG). */
const EARTH_RADIUS_KM = 6371.0088;

const RUSSIA_ID = "643";

export function distanceKm(a: LonLat, b: LonLat): number {
  return geoDistance([a[0], a[1]], [b[0], b[1]]) * EARTH_RADIUS_KM;
}

type Countries = Topology<{ countries: GeometryCollection<{ name: string }> }>;

export type MapPoint = Pick<Waypoint, "id" | "name" | "nameRu" | "iata" | "airport" | "role"> & {
  x: number;
  y: number;
  coordsLabel: string;
  cumulativeKm: number;
  cumulativeLabel: string;
};

export type RouteMapData = {
  width: number;
  height: number;
  russia: string;
  segments: { id: string; d: string; km: number }[];
  points: MapPoint[];
  nextStops: { id: string; name: string; nameRu: string; x: number; y: number }[];
  totalKm: number;
  totalLabel: string;
};

function createProjection() {
  return geoConicConformal()
    .parallels([42, 58])
    .rotate([-22, 0])
    .fitExtent(
      [
        [MAP.width * 0.16, MAP.height * 0.27],
        [MAP.width * 0.78, MAP.height * 0.7],
      ],
      { type: "MultiPoint", coordinates: route.map((w) => [w.coords[0], w.coords[1]]) },
    )
    .clipExtent([
      [-40, -40],
      [MAP.width + 40, MAP.height + 40],
    ]);
}

let cache: { data: RouteMapData; baseSvg: string } | null = null;

function build() {
  if (cache) return cache;

  const topo = world as unknown as Countries;
  const projection = createProjection();
  const path = geoPath(projection).digits(1);

  const countries = feature(topo, topo.objects.countries);
  const russia = countries.features.find((f) => String(f.id) === RUSSIA_ID) as Feature<Geometry> | undefined;

  const land = countries.features.map((f) => path(f) ?? "").join("");
  const borders = path(mesh(topo, topo.objects.countries, (a, b) => a !== b)) ?? "";
  const coast = path(mesh(topo, topo.objects.countries, (a, b) => a === b)) ?? "";
  const graticule = path(geoGraticule10()) ?? "";

  const project = (c: LonLat) => {
    const xy = projection([c[0], c[1]]);
    if (!xy) throw new Error(`Point hors projection : ${c.join(", ")}`);
    return { x: Math.round(xy[0] * 10) / 10, y: Math.round(xy[1] * 10) / 10 };
  };

  const segments = route.slice(1).map((to, i) => {
    const from = route[i]!;
    return {
      id: `${from.id}-${to.id}`,
      d:
        path({
          type: "LineString",
          coordinates: [
            [from.coords[0], from.coords[1]],
            [to.coords[0], to.coords[1]],
          ],
        }) ?? "",
      km: distanceKm(from.coords, to.coords),
    };
  });

  let running = 0;
  const points: MapPoint[] = route.map((w, i) => {
    if (i > 0) running += segments[i - 1]!.km;
    return {
      id: w.id,
      name: w.name,
      nameRu: w.nameRu,
      iata: w.iata,
      airport: w.airport,
      role: w.role,
      ...project(w.coords),
      coordsLabel: formatCoords(w.coords),
      cumulativeKm: running,
      cumulativeLabel: formatKm(running),
    };
  });

  const data: RouteMapData = {
    width: MAP.width,
    height: MAP.height,
    russia: russia ? (path(russia) ?? "") : "",
    segments,
    points,
    nextStops: nextStops.map((s) => ({ id: s.id, name: s.name, nameRu: s.nameRu, ...project(s.coords) })),
    totalKm: running,
    totalLabel: formatKm(running),
  };

  // Static base layer, served as an image by app/carte/europe-russie.svg/route.ts
  const baseSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP.width} ${MAP.height}" width="${MAP.width}" height="${MAP.height}">`,
    `<path d="${graticule}" fill="none" stroke="#A9B8CC" stroke-opacity="0.07" stroke-width="1"/>`,
    `<path d="${land}" fill="#121A29"/>`,
    `<path d="${borders}" fill="none" stroke="#A9B8CC" stroke-opacity="0.16" stroke-width="0.8"/>`,
    `<path d="${coast}" fill="none" stroke="#A9B8CC" stroke-opacity="0.3" stroke-width="0.9"/>`,
    `</svg>`,
  ].join("");

  cache = { data, baseSvg };
  return cache;
}

export type ItineraryMapData = {
  width: number;
  height: number;
  land: string;
  borders: string;
  russia: string;
  route: string;
  points: { x: number; y: number }[];
};

/**
 * Map for a configurator result: the projection is fitted to the proposed
 * stops, so each itinerary gets its own framing. Rendered inline (one page,
 * not indexed).
 */
export function getItineraryMap(stops: LonLat[]): ItineraryMapData {
  const width = 1000;
  const height = 640;
  const topo = world as unknown as Countries;
  const coordinates = stops.map((c) => [c[0], c[1]] as [number, number]);
  const projection = geoConicConformal()
    .parallels([45, 62])
    .rotate([-(coordinates.reduce((s, c) => s + c[0], 0) / coordinates.length), 0])
    .fitExtent(
      [
        [width * 0.14, height * 0.2],
        [width * 0.86, height * 0.8],
      ],
      { type: "MultiPoint", coordinates },
    )
    .clipExtent([
      [-10, -10],
      [width + 10, height + 10],
    ]);
  const path = geoPath(projection).digits(1);
  const countries = feature(topo, topo.objects.countries);
  const russia = countries.features.find((f) => String(f.id) === RUSSIA_ID) as Feature<Geometry> | undefined;

  return {
    width,
    height,
    land: countries.features.map((f) => path(f) ?? "").join(""),
    borders: path(mesh(topo, topo.objects.countries, (a, b) => a !== b)) ?? "",
    russia: russia ? (path(russia) ?? "") : "",
    route: path({ type: "LineString", coordinates }) ?? "",
    points: coordinates.map((c) => {
      const xy = projection(c) ?? [0, 0];
      return { x: Math.round(xy[0] * 10) / 10, y: Math.round(xy[1] * 10) / 10 };
    }),
  };
}

export function getRouteMap(): RouteMapData {
  return build().data;
}

export function renderBaseMapSvg(): string {
  return build().baseSvg;
}
