"use client";

import * as m from "motion/react-m";
import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { BilingualName } from "@/components/brand/BilingualName";
import { track } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import type { RouteMapData } from "@/lib/geo";

/**
 * Pinned scene: the verste line draws Paris → Istanbul → Moscow while the
 * distance counter runs. Timeline, as a share of the scene's scroll:
 *   0.10–0.42 first leg · 0.42–0.56 stopover · 0.56–0.86 second leg · 0.86+ arrival
 * Resting state (server render, reduced motion, no JavaScript) is the arrival.
 */
const LEG_1: [number, number] = [0.1, 0.42];
const LEG_2: [number, number] = [0.56, 0.86];

type Range = [number, number];
type Range4 = [number, number, number, number];

/** Same mapping as useTransform(p, range, [0, 1]), usable synchronously. */
const along = (v: number, [a, b]: Range) => Math.min(1, Math.max(0, (v - a) / (b - a)));

export function RouteSceneClient({ map, baseSrc, note }: { map: RouteMapData; baseSrc: string; note: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const lengths = useRef<number[]>([]);
  // Cached layout sizes: read on resize, never during scroll
  const sizes = useRef({ stage: 0, frame: 0 });
  const live = useRef(false);
  const completed = useRef(false);

  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const p = useMotionValue(1);

  const [paris, istanbul, moscou] = map.points;
  const firstLegKm = istanbul?.cumulativeKm ?? 0;

  const leg1 = useTransform(p, LEG_1, [0, 1]);
  const leg2 = useTransform(p, LEG_2, [0, 1]);
  const km = useTransform(p, [LEG_1[0], LEG_1[1], LEG_2[0], LEG_2[1]], [0, firstLegKm, firstLegKm, map.totalKm]);
  const kmText = useTransform(km, (v) => formatNumber(v));
  const russiaFill = useTransform(p, [0.84, 0.97], [0, 0.55]);
  const russiaStroke = useTransform(p, [0.84, 0.97], [0, 0.45]);
  const sceneBg = useTransform(p, [0.8, 1], ["#0c0f14", "#0b1a33"]);

  const tipX = useMotionValue(moscou?.x ?? 0);
  const tipY = useMotionValue(moscou?.y ?? 0);
  const panX = useMotionValue(0);
  const panSpring = useSpring(panX, { stiffness: 140, damping: 32, mass: 0.6 });

  // The traveller dot follows the head of the line; on narrow screens the
  // map pans so the dot stays in view.
  // Reads p directly: derived motion values may not have updated yet when
  // this runs inside p's own change listener.
  const update = useCallback(() => {
    const [a, b] = legRefs.current;
    if (!a || !b) return;
    if (!lengths.current.length) lengths.current = [a.getTotalLength(), b.getTotalLength()];
    const v = p.get();
    const onSecond = along(v, LEG_2) > 0;
    const el = onSecond ? b : a;
    const t = onSecond ? along(v, LEG_2) : along(v, LEG_1);
    const point = el.getPointAtLength((lengths.current[onSecond ? 1 : 0] ?? 0) * t);
    tipX.set(point.x);
    tipY.set(point.y);

    const frame = frameRef.current;
    if (frame) frame.dataset.arrived = v > 0.85 ? "true" : "false";

    const { stage, frame: frameWidth } = sizes.current;
    const overflow = (stage - frameWidth) / 2;
    if (overflow <= 1) {
      panX.set(0);
      return;
    }
    const tipPx = (point.x / map.width) * stage;
    const anchor = 0.36; // share of the frame width where the traveller sits
    const target = frameWidth * (anchor - 0.5) + stage / 2 - tipPx;
    panX.set(Math.max(-overflow, Math.min(overflow, target)));
  }, [p, map.width, panX, tipX, tipY]);

  const measure = useCallback(() => {
    sizes.current = { stage: stageRef.current?.offsetWidth ?? 0, frame: frameRef.current?.clientWidth ?? 0 };
    update();
  }, [update]);

  useEffect(() => {
    if (reduced) {
      live.current = false;
      p.set(1);
    } else {
      live.current = true;
      p.set(scrollYProgress.get());
    }
    frameRef.current?.style.setProperty("--scene-bg", sceneBg.get());
    measure();
    const observer = new ResizeObserver(measure);
    if (frameRef.current) observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, [reduced, p, scrollYProgress, sceneBg, measure]);

  // The scene colour is shared with the scrims through a CSS variable
  useMotionValueEvent(sceneBg, "change", (color) => {
    frameRef.current?.style.setProperty("--scene-bg", color);
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (live.current) p.set(v);
  });

  useMotionValueEvent(p, "change", (v) => {
    update();
    if (live.current && !completed.current && v > 0.97) {
      completed.current = true;
      track("route_completed");
    }
  });

  const pos = (x: number, y: number) => ({ left: `${(x / map.width) * 100}%`, top: `${(y / map.height) * 100}%` });

  return (
    <section
      ref={sectionRef}
      id="trajet"
      data-surface="night"
      aria-labelledby="trajet-title"
      className="relative h-[380vh] bg-night still:h-auto"
    >
      <h2 id="trajet-title" className="sr-only">
        Le trajet : Paris, Istanbul, Moscou
      </h2>

      <m.div
        ref={frameRef}
        data-arrived="true"
        style={{ backgroundColor: sceneBg }}
        className="group/frame sticky [--scene-bg:#0b1a33] top-0 h-[100svh] overflow-hidden still:relative still:h-[max(100svh,44rem)]"
      >
        {/* Map stage: covers the frame like object-fit: cover, pans on narrow screens */}
        <m.div
          ref={stageRef}
          aria-hidden="true"
          style={{ x: reduced ? panX : panSpring }}
          className="absolute top-1/2 left-1/2 aspect-[4/3] w-[max(100%,calc(100svh*4/3))] [translate:-50%_-66%] md:[translate:-50%_-58%]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG generated at build time */}
          <img
            src={baseSrc}
            alt=""
            width={map.width}
            height={map.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full select-none"
          />

          <svg
            viewBox={`0 0 ${map.width} ${map.height}`}
            aria-hidden="true"
            className="absolute inset-0 size-full overflow-visible"
          >
            <m.path
              d={map.russia}
              fill="#1d3b6e"
              stroke="#a9b8cc"
              strokeWidth={0.9}
              style={{ fillOpacity: russiaFill, strokeOpacity: russiaStroke }}
            />

            {map.segments.map((segment, i) => (
              <path
                key={`plan-${segment.id}`}
                ref={(el) => {
                  legRefs.current[i] = el;
                }}
                d={segment.d}
                fill="none"
                style={{ stroke: "var(--route)" }}
                strokeOpacity={0.28}
                strokeWidth={1.4}
                strokeDasharray="2 7"
                strokeLinecap="round"
              />
            ))}

            {map.segments.map((segment, i) => (
              <m.path
                key={`draw-${segment.id}`}
                d={segment.d}
                fill="none"
                strokeWidth={2.4}
                style={{ stroke: "var(--route)", pathLength: i === 0 ? leg1 : leg2 }}
              />
            ))}

            {map.nextStops.map((stop) => (
              <StopDot key={stop.id} p={p} x={stop.x} y={stop.y} />
            ))}

            {map.points.map((point) => (
              <circle
                key={point.id}
                cx={point.x}
                cy={point.y}
                r={point.role === "escale" ? 4 : 5}
                style={{ fill: point.role === "escale" ? "var(--scene-bg)" : "#eef2f8" }}
                stroke="#eef2f8"
                strokeWidth={1.5}
              />
            ))}

            <m.circle cx={tipX} cy={tipY} r={14} fillOpacity={0.18} style={{ fill: "var(--route)" }} />
            <m.circle cx={tipX} cy={tipY} r={5.5} style={{ fill: "var(--route)" }} />
          </svg>

          {paris && (
            <MapLabel p={p} range={[-0.01, 0]} style={pos(paris.x, paris.y)} place="above-right">
              <p className="font-display font-cond text-[clamp(1.6rem,2.6vw,2.5rem)] leading-none font-medium">PARIS</p>
              <p className="label mt-2 text-fg-2 md:whitespace-nowrap">
                {paris.iata}
                <span className="max-md:block"><span className="max-md:hidden"> · </span>{paris.coordsLabel}</span>
              </p>
              <p className="label mt-1 text-route">KM 0</p>
            </MapLabel>
          )}

          {istanbul && (
            <MapLabel
              p={p}
              range={[0.4, 0.45]}
              style={pos(istanbul.x, istanbul.y)}
              place="below-right"
              className="transition-[visibility] max-md:group-data-[arrived=true]/frame:invisible"
            >
              <p className="font-display font-cond text-[clamp(1.4rem,2.2vw,2.1rem)] leading-none font-medium">
                ISTANBUL
                <span lang="ru" className="ml-3 text-[0.6em] text-fg-2">
                  Стамбул
                </span>
              </p>
              <p className="label mt-2 whitespace-nowrap text-fg-2">{istanbul.iata} · escale</p>
              <p className="label mt-1 text-route">{istanbul.cumulativeLabel}</p>
            </MapLabel>
          )}

          {moscou && (
            <MapLabel p={p} range={[0.84, 0.9]} style={pos(moscou.x, moscou.y)} place="below-right">
              <BilingualName ru={moscou.nameRu ?? "Москва"} fr="Moscou" size="compact" />
              <p className="label mt-1 text-fg-2 md:whitespace-nowrap">
                {moscou.iata}
                <span className="max-md:block"><span className="max-md:hidden"> · </span>{moscou.coordsLabel}</span>
              </p>
              <p className="label mt-1 text-route">{moscou.cumulativeLabel}</p>
            </MapLabel>
          )}

          {map.nextStops.map((stop) => (
            <MapLabel
              key={stop.id}
              p={p}
              range={[0.9, 0.97]}
              style={pos(stop.x, stop.y)}
              place={stop.id === "spb" ? "below-left" : "right"}
              className="max-md:hidden"
            >
              <p lang="ru" className="font-display font-cond text-[1.05rem] leading-none whitespace-nowrap">
                {stop.nameRu}
              </p>
              <p className="label mt-1 whitespace-nowrap text-fg-2">{stop.name}</p>
            </MapLabel>
          ))}
        </m.div>

        {/* Scrims keep text legible over the map */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,var(--scene-bg),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(to_top,var(--scene-bg)_12%,color-mix(in_srgb,var(--scene-bg)_60%,transparent)_40%,transparent)]"
        />

        {/* Narrative + counter */}
        <div className="gutter absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] flex-col gap-6 pb-[max(2.25rem,6vh)] lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="grid max-w-[36rem]">
            <Beat p={p} range={[-1, -0.5, 0.13, 0.17]}>
              <p className="label text-route">
                <span lang="ru">Верста 01</span> · Départ
              </p>
              <p className="mt-3 font-display text-h2">Paris.</p>
              <p className="mt-4 text-lead text-fg-2">Le voyage commence ici, bien avant l&apos;aéroport.</p>
            </Beat>
            <Beat p={p} range={[0.17, 0.21, 0.38, 0.42]}>
              <p className="label text-route">Cap au sud-est</p>
              <p className="mt-3 font-display text-h2">Pas de ligne droite.</p>
              <p className="mt-4 text-lead text-fg-2">
                Aucun vol direct ne relie plus la France à la Russie. On passe par un pays tiers.
              </p>
            </Beat>
            <Beat p={p} range={[0.42, 0.46, 0.55, 0.59]}>
              <p className="label text-route">Escale · Istanbul</p>
              <p className="mt-3 font-display text-h2">Il n&apos;y a plus de vol direct.</p>
              <p className="mt-2 font-display-italic text-h2 italic text-fg-2">Il y a toujours un chemin.</p>
            </Beat>
            <Beat p={p} range={[0.59, 0.63, 0.8, 0.84]}>
              <p className="label text-route">Cap au nord</p>
              <p className="mt-3 font-display text-h2">La mer Noire, puis les plaines.</p>
              <p className="mt-4 text-lead text-fg-2">Quelques heures de vol encore, et le paysage change d&apos;échelle.</p>
            </Beat>
            <Beat p={p} range={[0.86, 0.91, 2, 3]} still>
              <p className="label text-route">
                <span lang="ru">Верста 01</span> · Arrivée
              </p>
              <p className="mt-3 font-display text-h2">Kilomètre zéro.</p>
              <p className="mt-4 text-lead text-fg-2">
                {map.totalLabel} depuis Paris. Près de la place Rouge, une plaque de bronze marque le kilomètre zéro,
                d&apos;où l&apos;on mesure les routes de Russie. Votre première verste commence là.
              </p>
            </Beat>
          </div>

          <div className="order-first flex items-baseline gap-x-4 gap-y-2 max-lg:flex-wrap lg:order-none lg:block lg:text-right">
            <p className="label text-fg-2 max-lg:order-last max-lg:basis-full">
              <span className="lg:hidden">À vol d&apos;oiseau · une escale parmi d&apos;autres</span>
              <span className="max-lg:hidden">Distance parcourue</span>
            </p>
            <p className="font-mono text-[clamp(2rem,5vw,4.5rem)] leading-none tabular text-fg lg:mt-2">
              <m.span>{kmText}</m.span>
              <span className="ml-2 text-[0.38em] text-fg-2">km</span>
            </p>
            <p className="mt-3 hidden max-w-[22rem] text-[0.8rem] leading-snug text-fg-2 lg:ml-auto lg:block">{note}</p>
          </div>
        </div>
      </m.div>
    </section>
  );
}

function Beat({ p, range, still = false, children }: { p: MotionValue<number>; range: Range4; still?: boolean; children: ReactNode }) {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, range, [18, 0, 0, -18]);
  return (
    <m.div style={{ opacity, y }} className={`[grid-area:1/1] ${still ? "" : "still:hidden"}`}>
      {children}
    </m.div>
  );
}

const placements = {
  "above-right": "translate-x-3 -translate-y-[calc(100%+0.6rem)]",
  "below-right": "translate-x-4 translate-y-3",
  "below-left": "-translate-x-[calc(100%+0.75rem)] translate-y-2 text-right",
  right: "translate-x-4 -translate-y-1/2",
} as const;

function MapLabel({
  p,
  range,
  style,
  place,
  className = "",
  children,
}: {
  p: MotionValue<number>;
  range: Range;
  style: { left: string; top: string };
  place: keyof typeof placements;
  className?: string;
  children: ReactNode;
}) {
  const opacity = useTransform(p, range, [0, 1]);
  return (
    <m.div style={{ ...style, opacity }} className={`absolute ${className}`}>
      <div className={placements[place]}>{children}</div>
    </m.div>
  );
}

function StopDot({ p, x, y }: { p: MotionValue<number>; x: number; y: number }) {
  const opacity = useTransform(p, [0.9, 0.97], [0, 1]);
  return <m.circle cx={x} cy={y} r={3.5} fill="none" stroke="#eef2f8" strokeWidth={1.2} style={{ opacity }} />;
}
