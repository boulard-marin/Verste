import { routeNote } from "@/data/route";
import { getRouteMap } from "@/lib/geo";

import { RouteSceneClient } from "./RouteSceneClient";

/**
 * S02 · Le trajet. Geometry and distances are computed on the server
 * (lib/geo.ts); the client only animates what it receives.
 */
export function RouteScene() {
  return <RouteSceneClient map={getRouteMap()} baseSrc="/carte/europe-russie.svg" note={routeNote} />;
}
