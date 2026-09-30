/**
 * Travel data model. Every practical fact carries its proof (source, date,
 * status) so the site can say *Officiel*, *Terrain*, *Conseil Verste*,
 * *À confirmer* or *Sources divergentes*, and tests can refuse the rest.
 * Content lives in data/, logic in lib/.
 */

export type ISODate = `${number}-${number}-${number}`;
export type LonLat = readonly [lon: number, lat: number];

// ─── Proof ───────────────────────────────────────────────────────────────────

export type SourceKind = "officiel" | "terrain" | "conseil" | "secondaire";

export type VerificationStatus =
  /** Checked on the institution's own site at `checkedAt`. */
  | "verifie"
  /** Lived by the founder (September 2026). */
  | "observe"
  /** Secondary source only, or nothing found yet. */
  | "a-verifier"
  /** Sources disagree: both values are shown. */
  | "contradictoire";

export type Source = { label: string; url?: string; kind: SourceKind };

export type Verification = {
  status: VerificationStatus;
  checkedAt: ISODate;
  sources: Source[];
  note?: string;
};

export type Verified<T> = { value: T; verification: Verification };

// ─── Places ─────────────────────────────────────────────────────────────────

export type CityId = "moscou" | "nijni-novgorod" | "saint-petersbourg" | "kazan";

export type Theme =
  | "histoire"
  | "architecture"
  | "art"
  | "spiritualite"
  | "panorama"
  | "sport"
  | "nature"
  | "gastronomie"
  | "shopping"
  | "transport"
  | "memoire";

export type PlaceCategory =
  | "monument"
  | "eglise"
  | "musee"
  | "parc"
  | "panorama"
  | "rue"
  | "metro"
  | "gare"
  | "sport"
  | "nature"
  | "restaurant"
  | "boutique";

export type Weekday = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

/** A fact states what is; an interpretation states who presents it how. */
export type Interpretation = { text: string; attributedTo: string; source?: Source };

export type Place = {
  id: string;
  cityId: CityId;
  ru: string;
  fr: string;
  category: PlaceCategory;
  themes: Theme[];
  coords: LonLat;
  /** Where the coordinates come from: never from a photo's EXIF. */
  coordsSource: string;
  address?: string;
  access?: string;
  /** One factual sentence. */
  summary: string;
  facts?: Verified<string>[];
  interpretations?: Interpretation[];
  hours?: Verified<string>;
  closedDays?: Verified<Weekday[]>;
  price?: Verified<string>;
  website?: string;
  /** Media slugs, own first (see lib/travel/media.ts). */
  media: string[];
  /** Conseil Verste. */
  tip?: string;
  /** Terrain: what the founder saw, dated. */
  fieldNote?: string;
  /** Typical visit length in minutes. */
  visitMin?: number;
};

export type Restaurant = Place & {
  category: "restaurant";
  cuisine: string;
  why: string;
};

export type SportVenue = Place & {
  category: "sport";
  disciplines: string[];
  visitorAccess: Verified<string>;
  level?: string;
  language?: string;
  equipment?: string;
  booking?: string;
};

export type SportEvent = {
  id: string;
  venueId: string;
  date: ISODate;
  title: string;
  startsAt?: string;
  /** The engine only proposes events whose status is "verifie". */
  verification: Verification;
};

// ─── Journeys and walks ─────────────────────────────────────────────────────

export type Journey = {
  id: string;
  from: string;
  to: string;
  mode: "avion" | "train";
  service?: string;
  path: LonLat[];
  /** How the drawn path was obtained. */
  pathBasis: string;
  duration?: Verified<string>;
  notes: string[];
};

export type WalkStop = {
  letter: string;
  placeId: string;
  title: string;
  text: string;
  stayMin: number;
  optional?: { placeId: string; text: string; extraKm: number };
};

export type Walk = {
  id: string;
  name: "La Grande Verste";
  cityId: CityId;
  subtitle: string;
  stops: WalkStop[];
  /** Real pedestrian geometry (OSRM foot profile on OpenStreetMap data). */
  geometry: LonLat[];
  geometrySource: string;
  walkMin: number;
  totalDuration: string;
  rhythm: string;
  difficulty: string;
  bestStart: string;
  transport: string;
  pauses: string[];
  restaurantId: string;
  sportOption: string;
  cultureOption: string;
  checkedAt: ISODate;
};

// ─── Itineraries ────────────────────────────────────────────────────────────

export type Moment = "matin" | "apres-midi" | "soir";

export type Activity = {
  title: string;
  placeId?: string;
  text: string;
  /** Effort points: walking, standing, attention. Used by the engine. */
  effort: 1 | 2 | 3;
  durationMin: number;
  optional?: boolean;
  kind?: SourceKind;
};

export type ItineraryDay = {
  id: string;
  cityId: CityId;
  title: string;
  theme: string;
  intro: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  transport: string[];
  meals: string[];
  optionalExperiences: string[];
  /** Days to avoid, with the reason (museum closures…). */
  avoid?: { weekdays: Weekday[]; reason: string };
  walkingKm?: number;
  media: string[];
};

export type Product = {
  id: string;
  title: string;
  cityId: CityId;
  subtitle: string;
  days: ItineraryDay[];
};
