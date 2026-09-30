import type { LonLat } from "@/lib/travel/types";

/** Camera presets shared by the Russia Travel Map and the immersive scenes. */
export type CameraView = { center: LonLat; zoom: number; pitch?: number; bearing?: number };

/** European Russia with Moscow, Nizhny, Saint Petersburg and Kazan in frame. */
export const RUSSIA_BOUNDS: [LonLat, LonLat] = [
  [27.5, 53.2],
  [51.5, 61.2],
];

export const cityViews: Record<string, CameraView> = {
  moscou: { center: [37.6175, 55.7506], zoom: 11.6, pitch: 30, bearing: 0 },
  "nijni-novgorod": { center: [43.992, 56.3265], zoom: 13.2, pitch: 45, bearing: -20 },
  "saint-petersbourg": { center: [30.3167, 59.95], zoom: 10.5, pitch: 0, bearing: 0 },
  kazan: { center: [49.1144, 55.7908], zoom: 11, pitch: 0, bearing: 0 },
};

/**
 * Descent onto Saint Basil: Moscow → Kremlin → Red Square → the cathedral.
 * Used by the scroll-driven scene; each key has the caption shown with it.
 */
export const saintBasilDescent: Array<CameraView & { caption: string; ru?: string }> = [
  { center: [37.62, 55.752], zoom: 9.6, pitch: 0, bearing: 0, caption: "Moscou", ru: "Москва" },
  { center: [37.6178, 55.7517], zoom: 13.4, pitch: 25, bearing: -10, caption: "Le Kremlin", ru: "Кремль" },
  { center: [37.6205, 55.7535], zoom: 15.6, pitch: 55, bearing: -25, caption: "La place Rouge", ru: "Красная площадь" },
  { center: [37.6232, 55.7524], zoom: 17.4, pitch: 62, bearing: -35, caption: "Saint-Basile", ru: "Храм Василия Блаженного" },
];

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}
