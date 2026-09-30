export type InventoryEntry = {
  file: string;
  /** Local Moscow time (UTC+3), minute precision. */
  takenAt: string | null;
  city: "moscou" | "nijni-novgorod" | "trajet";
  place: string;
  category: string;
  type: "photo" | "video" | "capture";
  orientation: "portrait" | "paysage";
  width: number | null;
  height: number | null;
  durationS?: number;
  /** A excellent · B bon · C utilisable avec réserve · D inutilisable */
  quality: "A" | "B" | "C" | "D";
  /** retenu = traité pour la V2 · reserve = utilisable plus tard · ecarte · prive = jamais publié */
  status: "retenu" | "reserve" | "ecarte" | "prive";
  use: string;
  people: "aucune" | "foule-non-identifiable" | "consentement" | "a-flouter";
  note?: string;
};
