import type { LonLat } from "@/data/route";
import { getItineraryMap } from "@/lib/geo";

type Stop = { ru: string; fr: string; coords: LonLat; days: number };

/**
 * The proposed itinerary on a map: computed on the server, the verste line is
 * drawn once with CSS (no JavaScript). City labels are HTML so they stay
 * legible at every size.
 */
export function ItineraryMap({ stops }: { stops: Stop[] }) {
  const map = getItineraryMap(stops.map((s) => s.coords));
  // Labels go right of their point; the easternmost one goes left and above,
  // so it never runs over its neighbours' labels.
  const eastmost = map.points.reduce((best, p, i) => (p.x > (map.points[best]?.x ?? -1) ? i : best), 0);
  return (
    <figure data-surface="midnight" className="relative overflow-hidden bg-surface text-fg">
      <div className="relative aspect-[1000/640] w-full">
        <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true" className="absolute inset-0 size-full">
          <path d={map.land} fill="#121a29" />
          <path d={map.russia} fill="#1d3b6e" fillOpacity={0.55} />
          <path d={map.borders} fill="none" stroke="#a9b8cc" strokeOpacity={0.16} strokeWidth={0.8} />
          <path
            d={map.route}
            pathLength={1}
            fill="none"
            strokeWidth={2.6}
            strokeLinejoin="round"
            className="route-draw"
            style={{ stroke: "var(--route)" }}
          />
          {map.points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === 0 ? 7 : 5}
              stroke="#eef2f8"
              strokeWidth={1.5}
              style={{ fill: i === 0 ? "var(--route)" : "#0b1a33" }}
            />
          ))}
        </svg>
        {map.points.map((p, i) => {
          const stop = stops[i]!;
          const flip = i === eastmost;
          return (
            <div
              key={stop.fr}
              className="absolute"
              style={{ left: `${(p.x / map.width) * 100}%`, top: `${(p.y / map.height) * 100}%` }}
            >
              <div
                className={
                  flip ? "-translate-x-[calc(100%+0.6rem)] -translate-y-[calc(100%+0.4rem)] text-right" : "translate-x-2.5 translate-y-2"
                }
              >
                <p lang="ru" className="font-display font-cond text-[clamp(0.9rem,2vw,1.35rem)] leading-none whitespace-nowrap uppercase">
                  {stop.ru}
                </p>
                <p className="label mt-1 whitespace-nowrap text-fg-2 max-sm:hidden">
                  {stop.fr} · {stop.days}&nbsp;j
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="label border-t border-line px-4 py-3 text-fg-2">
        Tracé indicatif, à vol d&apos;oiseau · Natural Earth
      </figcaption>
    </figure>
  );
}
