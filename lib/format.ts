import type { LonLat } from "@/data/route";

const fr = "fr-FR";

/** "3 964" with the narrow no-break space French uses for thousands. */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString(fr);
}

export function formatKm(km: number): string {
  return `${formatNumber(km)} km`;
}

/** "29/09/2026" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(fr, { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

function dm(value: number): string {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  return min === 60 ? `${deg + 1}°00′` : `${deg}°${String(min).padStart(2, "0")}′`;
}

/** "49°00′ N · 2°33′ E" */
export function formatCoords([lon, lat]: LonLat): string {
  return `${dm(lat)} ${lat >= 0 ? "N" : "S"} · ${dm(lon)} ${lon >= 0 ? "E" : "O"}`;
}
