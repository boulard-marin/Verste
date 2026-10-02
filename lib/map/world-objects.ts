import { COSMOS_ANCHOR, cosmosSections } from "@/data/voyage/monument-cosmos";
import { isaacBelfries, spbMonuments } from "@/data/voyage/monuments-spb";

import { buildCosmos, launchCosmos } from "./cosmos-model";
import type { WorldObject } from "./objects-layer";
import { buildSaintBasil, SAINT_BASIL_CENTER } from "./saint-basil-model";
import { buildAmiraute, buildColonne, buildIsaac, buildPierreEtPaul, buildSauveur } from "./spb-models";

/**
 * Every 3D object of the journey's world, loaded with three.js when the
 * world opens. Each replaces the crude OpenStreetMap volumes around it.
 */
export const worldObjects: WorldObject[] = [
  { id: "saint-basile", at: SAINT_BASIL_CENTER, build: buildSaintBasil, replaces: { radiusM: 40 } },
  // The OSM model starts on its stylobate (7 m): the slab below is kept.
  { id: "cosmos", at: COSMOS_ANCHOR, build: () => buildCosmos(cosmosSections, COSMOS_ANCHOR), animate: launchCosmos, replaces: { radiusM: 45, minFrom: 7 } },
  { ...spbMonuments["pierre-et-paul"], build: buildPierreEtPaul },
  { ...spbMonuments.amiraute, build: buildAmiraute },
  { ...spbMonuments.isaac, build: () => buildIsaac(isaacBelfries) },
  { ...spbMonuments["colonne-alexandre"], build: buildColonne },
  { ...spbMonuments.sauveur, build: buildSauveur },
];
