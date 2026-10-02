import type { CameraView } from "@/lib/map/views";
import type { LonLat } from "@/lib/travel/types";

/**
 * The journey is a chain of scenes. Scrolling moves through them; a portal is
 * a click that moves you to another scene (or page). One persistent world
 * (the map) hosts the surface scenes; environments (metro, train) replace it.
 */

export type Environment = "monde" | "metro" | "train" | "fin";

export type PortalVerb = "Entrer" | "Découvrir" | "Voir" | "Descendre" | "Partir" | "Suivre le fleuve" | "Ressortir" | "S'approcher" | "Construire" | "Continuer";

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
  /** Share of the OSM `colour` kept when the part has one (default 0.7). */
  osm?: number;
};

export type Outline = { id: string; ring: LonLat[] };

/**
 * A point to explore inside a scene (the Kremlin as a hub: Red Square, the
 * cathedrals, the garden…). A click flies the camera there and opens a short
 * card; scrolling takes the journey back. Text, photo and link come from the
 * place (data/travel), never written twice.
 */
export type Hotspot = {
  id: string;
  placeId?: string;
  /** Used when no place carries the text (details of a monument, from its sourced facts). */
  label?: string;
  text?: string;
  at: LonLat;
  view: CameraView;
  /** « Continuer » moves on to another scene. */
  portal?: Portal;
};

/** A named line drawn on the world: a route walked or ridden (red), or a schematic link (dashed). */
export type WorldLine = { id: string; path: LonLat[]; style: "route" | "schematic" };

/** A named point drawn on the world (airports, cities), shown by the scenes that list it. */
export type Mark = { id: string; at: LonLat; name: string; ru?: string; sub?: string; kind: "airport" | "city" | "metro"; badge?: { text: string; color: string } };

/**
 * A vehicle crossing the world while the scene plays: the plane of the
 * opening flight, the Sapsan to Saint Petersburg. It travels its leg during
 * `fly` (local progress window), waits outside it, or stays parked for the
 * whole scene.
 */
export type SceneVehicle = {
  kind: "avion" | "train";
  leg: string;
  fly?: [number, number];
  /** Parked for the whole scene at the start (0) or the end (1) of the leg. */
  park?: 0 | 1;
  /** Turns on the ground from the end heading of this leg (the stopover). */
  turnFrom?: string;
  /** The camera centre follows the vehicle. */
  follow?: boolean;
};

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
  /**
   * 3D objects that appear during the scene, with the local progress window
   * of their appearance. Absent before their scene (the OSM volumes show),
   * standing after it; objects never listed always stand.
   */
  objects?: { id: string; rise: [number, number] }[];
  /** Light at the start and the end of the scene: -1 dawn, 0 default, 1 deep night. */
  night?: [number, number];
  /** The white nights of Saint Petersburg at the start and the end of the scene, 0 to 1. */
  tone?: [number, number];
  /** Relief exaggeration (Nizhny sits on a bluff above the Volga). */
  terrain?: number;
  /** Fortresses whose tower names are shown (the Nizhny kremlin). */
  labels?: string[];
  vehicle?: SceneVehicle;
  hotspots?: Hotspot[];
  /** Marks (airports, cities) shown on the world during the scene. */
  marks?: string[];
  /** Named lines shown during the scene (La Grande Verste, the trains to the next cities). */
  lines?: string[];
  /** Computed figures shown with the scene, each with its method. */
  figures?: { value: string; label: string; note: string }[];
  media?: string[];
  /** The photos are the scene's imagery (a destination without field photos): shown large, one after the other. */
  gallery?: boolean;
  /** How the 3D objects on screen were made (« Maquettes 3D stylisées … »), shown with the scene. */
  modelNote?: string;
  /** Time labels for a timed photo sequence (Poklonnaïa: 18 h 36 → 19 h 38). */
  mediaTimes?: string[];
  placeId?: string;
  portals: Portal[];
  /**
   * How the scene is entered and left: a fade from/to the dark (going
   * underground) or the daylight (coming out of the metro, off the train).
   */
  transition?: { in?: "dark" | "light"; out?: "dark" | "light" };
  /** Scroll length in screens. */
  length: number;
};

export type MetroLine = { id: string; number: string; ru: string; fr: string; color: string; stations: { ru: string; fr: string }[] };
