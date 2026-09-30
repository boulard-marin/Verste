import { mapCities } from "@/data/travel/index";
import { openMeteoUrl, parseOpenMeteo } from "@/lib/weather";

/**
 * Current weather of the VERSTE cities. Static, regenerated every 30 minutes
 * at most: one request to Open-Meteo per half hour whatever the traffic, and
 * the visitor's browser never talks to a third party. If Open-Meteo does not
 * answer, the map simply shows no weather.
 */
export const dynamic = "force-static";
export const revalidate = 1800;

const cities = mapCities.filter((c) => c.status !== "a-venir");

export async function GET() {
  try {
    const res = await fetch(openMeteoUrl(cities), { next: { revalidate: 1800 }, headers: { "User-Agent": "verste/1.0" } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    return Response.json({ cities: parseOpenMeteo(cities.map((c) => c.id), await res.json()) });
  } catch {
    return Response.json({ cities: [] });
  }
}
