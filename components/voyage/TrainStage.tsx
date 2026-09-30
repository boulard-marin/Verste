"use client";

import { formatNumber } from "@/lib/format";
import { lineKm, pointAlong, sliceAlong } from "@/lib/travel/geo";
import type { LonLat } from "@/lib/travel/types";

type Station = { ru: string; fr: string; at: number };

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * LA LASTOCHKA. The platform and the doors, then the window: dawn over birch
 * forests, poles and wires streaming by, and the map where the red line moves
 * forward kilometre by kilometre. Distances are computed along the drawn line
 * (an indicative route through the main stations), and labelled as such.
 */
export function TrainStage({ path, stations, progress, duration }: { path: LonLat[]; stations: Station[]; progress: number; duration: string }) {
  const doors = smooth(clamp01(progress / 0.14));
  const ride = clamp01((progress - 0.14) / 0.76);
  const arrive = smooth(clamp01((progress - 0.9) / 0.1));
  const total = lineKm(path);
  const km = total * ride;
  const current = [...stations].reverse().find((s) => ride >= s.at - 0.001) ?? stations[0]!;

  // Map inset: equirectangular fit of the rail line into a 320×140 box.
  const lons = path.map((p) => p[0]), lats = path.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
  const W = 320, H = 140, pad = 14, k = Math.cos((((y0 + y1) / 2) * Math.PI) / 180);
  const sx = (W - pad * 2) / ((x1 - x0) * k), sy = (H - pad * 2) / (y1 - y0), s = Math.min(sx, sy);
  const proj = (p: LonLat) => [pad + (p[0] - x0) * k * s, H - pad - (p[1] - y0) * s] as const;
  const d = (pts: LonLat[]) => pts.map((p, i) => `${i ? "L" : "M"}${proj(p).join(",")}`).join("");
  const dot = proj(pointAlong(path, ride));

  // Dawn: the sky brightens along the ride.
  const light = smooth(ride);
  const skyTop = `color-mix(in oklab, #0b1a33 ${Math.round((1 - light) * 100)}%, #86a6cf)`;
  const skyLow = `color-mix(in oklab, #2a3f66 ${Math.round((1 - light) * 100)}%, #f6d2a6)`;
  const shift = ride * 100;

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {/* The window */}
      <div className="absolute inset-[6%_5%_22%] overflow-hidden rounded-[28px] border-[10px] border-[#20252d] shadow-[inset_0_0_60px_rgb(0_0_0/0.6)] md:inset-[10%_8%_24%]" style={{ background: `linear-gradient(to bottom, ${skyTop}, ${skyLow})` }}>
        <svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <pattern id="pines" width="180" height="600" patternUnits="userSpaceOnUse">
              {[10, 55, 96, 140].map((x, i) => (
                <path key={x} d={`M${x} ${300 + (i % 2) * 18} l18 60 h-8 l14 44 h-9 l13 40 h-56 l13 -40 h-9 l14 -44 h-8z`} fill="#1f3329" />
              ))}
              <rect x="0" y="440" width="180" height="160" fill="#1a2a22" />
            </pattern>
            <pattern id="birches" width="460" height="600" patternUnits="userSpaceOnUse">
              {[
                [24, 7, 262, 34],
                [71, 4, 300, 26],
                [118, 9, 250, 40],
                [196, 5, 286, 30],
                [251, 8, 270, 36],
                [330, 4, 310, 24],
                [388, 7, 258, 38],
              ].map(([x, w, y, r], i) => (
                <g key={x}>
                  <ellipse cx={x! + w! / 2} cy={y! - 6} rx={r!} ry={r! * 1.5} fill={i % 2 ? "#3c5a3e" : "#476b45"} />
                  <rect x={x} y={y} width={w} height={600 - y!} fill="#e2e2d6" />
                  {[0.2, 0.45, 0.7].map((k) => (
                    <rect key={k} x={x} y={y! + (600 - y!) * k} width={w} height="5" fill="#2b2b27" />
                  ))}
                </g>
              ))}
              <rect x="0" y="520" width="460" height="80" fill="#2c3a24" />
            </pattern>
            <pattern id="poles" width="520" height="600" patternUnits="userSpaceOnUse">
              <rect x="250" y="120" width="12" height="480" fill="#111418" />
              <rect x="222" y="140" width="68" height="7" fill="#111418" />
            </pattern>
          </defs>
          {/* Far hills and, once, a church on the horizon */}
          <g transform={`translate(${-shift * 3} 0)`}>
            <path d="M0 380 Q200 330 420 360 T840 350 T1280 365 T1720 350 T2160 360 T2600 352 T3040 362 T3480 350 T3920 360 V600 H0Z" fill="#26405f" opacity="0.8" />
            <g transform="translate(1900 300)" fill="#26405f">
              <rect x="0" y="30" width="40" height="50" />
              <path d="M20 -10 C 36 6 34 24 20 30 C 6 24 4 6 20 -10Z" />
              <rect x="18" y="-24" width="4" height="16" />
            </g>
          </g>
          {/* Pine forest far away, birches close by */}
          <rect x={-shift * 6} y="0" width="4000" height="600" fill="url(#pines)" />
          <rect x={-shift * 16} y="0" width="8000" height="600" fill="url(#birches)" />
          {/* Poles and wires, fastest */}
          <rect x={-shift * 60} y="0" width="12000" height="600" fill="url(#poles)" />
          <path d="M0 150 Q400 175 800 150 T1600 150" stroke="#111418" strokeWidth="2" fill="none" />
          <path d="M0 175 Q400 200 800 175 T1600 175" stroke="#111418" strokeWidth="2" fill="none" />
        </svg>
        {/* Glass reflection */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.08),transparent_40%,transparent_70%,rgb(255_255_255/0.05))]" />
        {/* Doors, at the very start */}
        <div className="absolute inset-0 flex" style={{ opacity: 1 - clamp01((progress - 0.12) / 0.04) }}>
          <div className="h-full w-1/2 border-r border-black/40 bg-[#2f4f82]" style={{ transform: `translateX(${-doors * 100}%)` }} />
          <div className="h-full w-1/2 border-l border-black/40 bg-[#2f4f82]" style={{ transform: `translateX(${doors * 100}%)` }} />
        </div>
      </div>

      {/* Instruments */}
      <div className="absolute inset-x-[5%] bottom-[3%] grid items-end gap-4 md:inset-x-[8%] md:grid-cols-[1fr_auto]">
        <div>
          <p className="label text-fg-2">Lastochka · {duration}</p>
          <p className="mt-2 font-mono text-[clamp(1.6rem,4vw,2.8rem)] leading-none text-fg tabular-nums">
            km {formatNumber(km)} <span className="text-fg-2">/ {formatNumber(total)}</span>
          </p>
          <p className="mt-2 text-[0.85rem] text-fg-2">
            Près de <span className="text-fg">{current.fr}</span> <span lang="ru">({current.ru})</span> · distance calculée sur le tracé indicatif
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-[min(320px,100%)] max-md:hidden" aria-hidden="true">
          <path d={d(path)} fill="none" stroke="#a9b8cc" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="3 4" />
          <path d={d(sliceAlong(path, ride))} fill="none" stroke="var(--color-carmine-signal)" strokeWidth="3" strokeLinecap="round" />
          {stations.map((st) => {
            const [x, y] = proj(pointAlong(path, st.at));
            return <circle key={st.fr} cx={x} cy={y} r="3" fill={ride >= st.at ? "#e8485a" : "#a9b8cc"} />;
          })}
          <circle cx={dot[0]} cy={dot[1]} r="6" fill="none" stroke="#eef2f8" strokeWidth="2" />
        </svg>
      </div>

      {/* Arrival */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#f4f6f9]" style={{ opacity: arrive }}>
        <p lang="ru" className="font-display font-cond text-[clamp(2.6rem,9vw,7rem)] leading-none tracking-wide text-[#0d1626] uppercase">
          Нижний Новгород
        </p>
      </div>
    </div>
  );
}
