import type { ISODate, Source, Verification, Verified } from "@/lib/travel/types";

/** Date of the last verification pass on official sites. */
export const CHECKED: ISODate = "2026-09-30";
/** Last day of the founder's field week. */
export const FIELD: ISODate = "2026-09-26";

export const terrain: Source = { label: "Terrain VERSTE, septembre 2026", kind: "terrain" };
export const conseil: Source = { label: "Conseil Verste", kind: "conseil" };

export function verified<T>(value: T, sources: Source[], note?: string): Verified<T> {
  return { value, verification: { status: "verifie", checkedAt: CHECKED, sources, ...(note ? { note } : {}) } };
}

export function toConfirm<T>(value: T, sources: Source[], note?: string): Verified<T> {
  return { value, verification: { status: "a-verifier", checkedAt: CHECKED, sources, ...(note ? { note } : {}) } };
}

export function observed<T>(value: T, note?: string): Verified<T> {
  return { value, verification: { status: "observe", checkedAt: FIELD, sources: [terrain], ...(note ? { note } : {}) } };
}

export function conflicting<T>(value: T, sources: Source[], note: string): Verified<T> {
  return { value, verification: { status: "contradictoire", checkedAt: CHECKED, sources, note } };
}

export const wiki = (title: string, lang: "ru" | "fr" = "ru"): Source => ({
  label: `Wikipédia (${lang})`,
  url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  kind: "secondaire",
});

export const official = (label: string, url: string): Source => ({ label, url, kind: "officiel" });
export const secondary = (label: string, url?: string): Source => ({ label, ...(url ? { url } : {}), kind: "secondaire" });

export const COORDS_WIKI = "Wikipédia (ru), coordonnées de l'article";
export const COORDS_OSM = "OpenStreetMap (Nominatim), adresse";

export type { Verification };
