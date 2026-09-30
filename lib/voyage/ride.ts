/**
 * The metro ride as a pure function of its progress: which leg, how far
 * along, how fast, and which station the train is at (or nearest to). Shared
 * by the 3D tunnel (metro.ts) and the station list, so both always agree, and
 * kept apart from three.js so the page can import it for free.
 */

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Share of each leg spent stopped at the departure platform. */
const DWELL = 0.24;

export function rideState(t: number, stationCount: number) {
  const legs = Math.max(1, stationCount - 1);
  const x = clamp01(t) * legs;
  const leg = Math.min(legs - 1, Math.floor(x));
  const u = t >= 1 ? 1 : x - leg;
  const moving = u > DWELL;
  const k = moving ? (u - DWELL) / (1 - DWELL) : 0;
  const move = t >= 1 ? 1 : smooth(k);
  return {
    leg,
    distance: leg + move,
    speed: moving && t < 1 ? Math.sin(Math.PI * k) : 0,
    /** Stopped at a platform, or between two. */
    atPlatform: !moving || t >= 1 || k > 0.97,
    station: t >= 1 ? legs : move < 0.5 ? leg : leg + 1,
  };
}
