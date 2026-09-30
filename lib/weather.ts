/**
 * Current weather of the VERSTE cities, from Open-Meteo (open data, CC BY 4.0,
 * no key). Only our server calls it, with the cities' coordinates and nothing
 * else: no visitor data ever leaves for a third party. Pure helpers here; the
 * fetch lives in app/api/meteo/route.ts.
 */

export type CityWeather = { id: string; temperature: number; code: number; isDay: boolean; time: string };

export const OPEN_METEO_ATTRIBUTION = "Météo : Open-Meteo.com (CC BY 4.0)";

/** WMO weather interpretation codes, as Open-Meteo documents them, in a few words. */
export function weatherLabel(code: number): string {
  if (code === 0) return "Ciel dégagé";
  if (code === 1) return "Plutôt dégagé";
  if (code === 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code === 45 || code === 48) return "Brouillard";
  if (code >= 51 && code <= 57) return "Bruine";
  if (code >= 61 && code <= 67) return "Pluie";
  if (code >= 71 && code <= 77) return "Neige";
  if (code >= 80 && code <= 82) return "Averses";
  if (code === 85 || code === 86) return "Averses de neige";
  if (code >= 95) return "Orage";
  return "Temps variable";
}

/** Open-Meteo accepts several coordinates in one request; the answer comes back in the same order. */
export function openMeteoUrl(cities: { coords: readonly [number, number] }[]): string {
  const lat = cities.map((c) => c.coords[1].toFixed(4)).join(",");
  const lon = cities.map((c) => c.coords[0].toFixed(4)).join(",");
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=Europe%2FMoscow`;
}

type OpenMeteoCurrent = { current?: { time?: string; temperature_2m?: number; weather_code?: number; is_day?: number } };

export function parseOpenMeteo(ids: string[], body: unknown): CityWeather[] {
  const list = (Array.isArray(body) ? body : [body]) as OpenMeteoCurrent[];
  return ids.flatMap((id, i) => {
    const c = list[i]?.current;
    if (!c || typeof c.temperature_2m !== "number" || typeof c.weather_code !== "number") return [];
    return [{ id, temperature: c.temperature_2m, code: c.weather_code, isDay: c.is_day === 1, time: c.time ?? "" }];
  });
}
