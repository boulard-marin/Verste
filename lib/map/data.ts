import "server-only";

import { grandeVersteNijni } from "@/data/travel/grande-verste";
import { allPlaces, getPlace, mapCities, type MapCity } from "@/data/travel/index";
import { journeys } from "@/data/travel/journeys";
import { lineKm } from "@/lib/travel/geo";
import { getMedia } from "@/lib/travel/media";
import type { CityId, LonLat, Place, Theme, VerificationStatus } from "@/lib/travel/types";

/**
 * What the Russia Travel Map needs, and nothing more: the browser receives
 * lean objects (no sources list, no long texts), built here on the server.
 */

export type MapGroup = "culture" | "sport" | "nature" | "table" | "trajet";

export type MapProof = { text: string; status: VerificationStatus; checkedAt: string; note?: string };

export type MapPhoto = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  alt: string;
  caption: string;
  kind: "verste" | "illustrative";
  credit?: string;
};

export type MapPlace = {
  id: string;
  cityId: CityId;
  ru: string;
  fr: string;
  group: MapGroup;
  categoryLabel: string;
  coords: LonLat;
  summary: string;
  hours?: MapProof;
  price?: MapProof;
  tip?: string;
  fieldNote?: string;
  photo?: MapPhoto;
  href: string;
};

export type MapJourney = { id: string; mode: "avion" | "train"; label: string; basis: string; path: LonLat[]; km: number };

export type MapWalk = {
  id: string;
  name: string;
  subtitle: string;
  geometry: LonLat[];
  km: number;
  walkMin: number;
  stops: { letter: string; title: string; coords: LonLat; placeId: string }[];
  href: string;
};

export type MapData = { cities: MapCity[]; places: MapPlace[]; journeys: MapJourney[]; walks: MapWalk[] };

const categoryLabel: Record<Place["category"], string> = {
  monument: "Monument",
  eglise: "Église, cathédrale",
  musee: "Musée",
  parc: "Parc",
  panorama: "Panorama",
  rue: "Rue",
  metro: "Station de métro",
  gare: "Gare",
  sport: "Sport",
  nature: "Nature",
  restaurant: "Restaurant",
  boutique: "Boutique",
};

function groupOf(p: Place): MapGroup {
  if (p.category === "restaurant") return "table";
  if (p.category === "gare") return "trajet";
  if (p.themes.includes("sport")) return "sport";
  const natural: Theme[] = ["nature"];
  if (p.themes.some((t) => natural.includes(t)) || p.category === "nature") return "nature";
  return "culture";
}

function proof(v: Place["hours"]): MapProof | undefined {
  if (!v) return undefined;
  return { text: v.value, status: v.verification.status, checkedAt: v.verification.checkedAt, ...(v.verification.note ? { note: v.verification.note } : {}) };
}

export function photoOf(slug: string | undefined): MapPhoto | undefined {
  if (!slug) return undefined;
  const m = getMedia(slug);
  if (!m) return undefined;
  const src = m.type === "video" ? m.poster : m.src;
  if (!src) return undefined;
  return {
    src,
    width: m.type === "video" ? 1080 : m.width,
    height: m.type === "video" ? 1920 : m.height,
    blurDataURL: m.blurDataURL,
    alt: m.alt,
    caption: m.caption,
    kind: m.kind,
    ...(m.credit ? { credit: `${m.credit.author}, ${m.credit.license}, Wikimedia Commons` } : {}),
  };
}

export function toMapPlace(p: Place): MapPlace {
  return {
    id: p.id,
    cityId: p.cityId,
    ru: p.ru,
    fr: p.fr,
    group: groupOf(p),
    categoryLabel: categoryLabel[p.category],
    coords: p.coords,
    summary: p.summary,
    ...(p.hours ? { hours: proof(p.hours) } : {}),
    ...(p.price ? { price: proof(p.price) } : {}),
    ...(p.tip ? { tip: p.tip } : {}),
    ...(p.fieldNote ? { fieldNote: p.fieldNote } : {}),
    ...(p.media[0] ? { photo: photoOf(p.media[0]) } : {}),
    href: `/lieux/${p.id}`,
  };
}

export function getMapData(): MapData {
  const walk = grandeVersteNijni;
  return {
    cities: mapCities,
    places: allPlaces.map(toMapPlace),
    journeys: journeys
      .filter((j) => j.id !== "train-nijni-moscou")
      .map((j) => ({
        id: j.id,
        mode: j.mode,
        label: j.mode === "train" ? `${j.from} → ${j.to} · ${j.service}` : `${j.from} → ${j.to}`,
        basis: j.pathBasis,
        path: j.path,
        km: lineKm(j.path),
      })),
    walks: [
      {
        id: walk.id,
        name: walk.name,
        subtitle: walk.subtitle,
        geometry: walk.geometry,
        km: lineKm(walk.geometry),
        walkMin: walk.walkMin,
        stops: walk.stops.map((s) => ({ letter: s.letter, title: s.title, placeId: s.placeId, coords: getPlace(s.placeId).coords })),
        href: "/destinations/nijni-novgorod/la-grande-verste",
      },
    ],
  };
}
