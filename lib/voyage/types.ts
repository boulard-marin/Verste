import type { CameraView } from "@/lib/map/views";
import type { LonLat } from "@/lib/travel/types";

/**
 * The journey is a chain of scenes. Scrolling moves through them; a portal is
 * a click that moves you to another scene (or page). One persistent world
 * (the map) hosts the surface scenes; environments (metro, train) replace it.
 */

export type Environment = "monde" | "metro" | "train" | "fin";

export type PortalVerb = "Entrer" | "Découvrir" | "Voir" | "Descendre" | "Partir" | "Suivre le fleuve" | "Ressortir" | "S'approcher" | "Construire";

export type Portal = {
  verb: PortalVerb;
  label: string;
  /** A scene (optionally a point inside it, 0–1) or a page. */
  to: { scene: string; at?: number } | { href: string };
};

/** A monument of the real city (OpenStreetMap building parts) lit while its scene is on. */
export type Highlight = {
  id: string;
  center: LonLat;
  radiusM: number;
  /** Keep only parts whose centroid falls inside this outline (the Kremlin). */
  within?: LonLat[];
  minHeight?: number;
  color: string;
};

export type Outline = { id: string; ring: LonLat[] };

export type Scene = {
  id: string;
  environment: Environment;
  kicker: string;
  title: string;
  ru?: string;
  text: string;
  /** Camera keys over the scene, interpolated with scroll (monde only). */
  camera?: CameraView[];
  highlights?: string[];
  outlines?: string[];
  /** 3D objects shown, with the local progress window in which they rise. */
  objects?: { id: string; rise: [number, number] }[];
  /** Light at the start and the end of the scene: -1 dawn, 0 default, 1 deep night. */
  night?: [number, number];
  media?: string[];
  /** Time labels for a timed photo sequence (Poklonnaïa: 18 h 36 → 19 h 38). */
  mediaTimes?: string[];
  placeId?: string;
  portals: Portal[];
  /** Scroll length in screens. */
  length: number;
};

export type MetroLine = { id: string; number: string; ru: string; fr: string; color: string; stations: { ru: string; fr: string }[] };
