import { destinations, KM_ZERO, moscow } from "@/data/cities";
import type { LonLat } from "@/data/route";

import type { CityId } from "./engine.ts";

/** Maps the engine's city ids to names in both alphabets and coordinates. */
export const configuratorCities: Record<CityId, { ru: string; fr: string; coords: LonLat }> = {
  moscou: { ru: moscow.ru, fr: moscow.fr, coords: KM_ZERO },
  ...(Object.fromEntries(destinations.map((d) => [d.id, { ru: d.ru, fr: d.fr, coords: d.coords }])) as Record<
    Exclude<CityId, "moscou">,
    { ru: string; fr: string; coords: LonLat }
  >),
};
