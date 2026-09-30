/**
 * Sunrise and sunset (NOAA "General Solar Position" approximation, zenith
 * 90.833°), accurate to a couple of minutes at these latitudes. Pure, no
 * dependency. Times are returned in Moscow time (UTC+3, no DST since 2014).
 */

const rad = Math.PI / 180;
const MOSCOW_UTC_OFFSET = 3;

function dayOfYear(y: number, m: number, d: number): number {
  return Math.floor(275 * m / 9) - Math.floor((m + 9) / 12) * (1 + Math.floor((y - 4 * Math.floor(y / 4) + 2) / 3)) + d - 30;
}

/** Minutes after midnight, Moscow time; null during polar day or night. */
export function sunTime(date: string, lon: number, lat: number, kind: "rise" | "set"): number | null {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const N = dayOfYear(y, m, d);
  const lngHour = lon / 15;
  const t = N + ((kind === "rise" ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;
  const H = (kind === "rise" ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const UT = (((T - lngHour) % 24) + 24) % 24;
  return Math.round(((UT + MOSCOW_UTC_OFFSET) % 24) * 60);
}

export function formatMinutes(min: number): string {
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}
