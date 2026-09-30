import type { Fortress } from "../../lib/voyage/fortress.ts";

import { kremlinNijniFortress } from "./kremlin-nijni.ts";

/** 3D fortresses of the world, loaded with the map only (never in the page payload). */
export const fortresses: Record<string, Fortress> = {
  "kremlin-nijni": kremlinNijniFortress,
};
