import external from "@/data/generated/external-media.json";
import own from "@/data/generated/media-files.json";
import { mediaText } from "@/data/travel/media-catalog";

/**
 * Resolves a media slug to everything a component needs. Priority: the
 * founder's own media ("verste"), then freely licensed images
 * ("illustrative", with credit), then an explicit placeholder.
 */

export type Credit = { author: string; license: string; licenseUrl: string | null; source: string };

export type ResolvedMedia = {
  slug: string;
  kind: "verste" | "illustrative";
  type: "photo" | "video";
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  alt: string;
  caption: string;
  wide?: { src: string; width: number; height: number };
  poster?: string;
  hd?: string;
  durationS?: number;
  sequence?: { pattern: string; count: number; width: number; height: number };
  credit?: Credit;
};

type OwnFile = Omit<ResolvedMedia, "slug" | "kind" | "alt" | "caption" | "credit">;
type ExternalFile = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  source: string;
};

const ownFiles = own as Record<string, OwnFile>;
const externalFiles = external as Record<string, ExternalFile>;

export function getMedia(slug: string): ResolvedMedia | null {
  const text = mediaText[slug];
  if (!text) return null;
  const mine = ownFiles[slug];
  if (mine) return { slug, kind: "verste", ...mine, ...text };
  const ext = externalFiles[slug];
  if (ext) {
    const { author, license, licenseUrl, source, ...file } = ext;
    return { slug, kind: "illustrative", type: "photo", ...file, ...text, credit: { author, license, licenseUrl, source } };
  }
  return null;
}

export function getMediaList(slugs: readonly string[]): ResolvedMedia[] {
  return slugs.map(getMedia).filter((m): m is ResolvedMedia => m !== null);
}

/** "Photo : Jorge Láscar, CC BY 2.0, Wikimedia Commons" */
export function creditLine(credit: Credit): string {
  return `${credit.author}, ${credit.license}, Wikimedia Commons`;
}

export function allMediaSlugs(): string[] {
  return Object.keys(mediaText);
}
