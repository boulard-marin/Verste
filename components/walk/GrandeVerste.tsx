"use client";

import type { GeoJSONSource, Marker } from "maplibre-gl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { prefersReducedMotion, supportsWebGL } from "@/lib/map/views";
import { formatDistance } from "@/lib/travel/geo";
import type { LonLat, Walk } from "@/lib/travel/types";
import { formatClock, formatDuration, paces, walkSchedule, type Pace } from "@/lib/travel/walk";
import { toggleTripPlace, useTrip } from "@/lib/trip";
import type { Highlight, Outline } from "@/lib/voyage/types";
import type { World } from "@/lib/voyage/world";

export type WalkStopView = {
  label: string;
  title: string;
  placeId: string;
  placeFr: string;
  placeRu: string;
  story: string;
  tip: string;
  photo?: { src: string; alt: string; caption: string; blurDataURL: string; kind: "verste" | "illustrative"; credit?: string };
};

type Props = {
  walk: Walk;
  stops: WalkStopView[];
  highlights: Highlight[];
  outlines: Outline[];
};

const line = (path: LonLat[]) => ({ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: path.map((p) => [p[0], p[1]]) } });

/**
 * LA GRANDE VERSTE. The map follows the walker: each stop that comes into
 * view moves the camera there and draws the red line up to it. Distances are
 * measured along the real footpath; times follow the pace chosen.
 */
export function GrandeVerste({ walk, stops, highlights, outlines }: Props) {
  const mapBox = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [pace, setPace] = useState<Pace>("normal");
  const [done, setDone] = useState(false);
  const trip = useTrip();
  const schedule = useMemo(() => walkSchedule(walk, pace), [walk, pace]);

  useEffect(() => {
    if (!mapBox.current || !supportsWebGL()) return;
    let cancelled = false;
    const markers: Marker[] = [];
    (async () => {
      const [{ createWorld }, { loadMapLibre }] = await Promise.all([import("@/lib/voyage/world"), import("@/lib/map/load")]);
      const first = walk.waypoints[0]!;
      const world = await createWorld(mapBox.current!, { highlights, outlines, start: { center: first, zoom: 15.4, pitch: 50, bearing: 20 }, objects: false });
      if (cancelled) return world.destroy();
      const ml = await loadMapLibre();
      worldRef.current = world;
      world.setNight(-1);
      world.setOutlines(outlines.map((o) => o.id));
      world.setHighlights(highlights.map((h) => h.id));
      const map = world.map;
      map.addSource("gv-full", { type: "geojson", data: line(walk.geometry) });
      map.addSource("gv-done", { type: "geojson", data: line(walk.geometry.slice(0, 1)) });
      map.addLayer({ id: "gv-full", type: "line", source: "gv-full", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#eef2f8", "line-opacity": 0.45, "line-width": 2, "line-dasharray": [1.5, 2] } });
      map.addLayer({ id: "gv-done", type: "line", source: "gv-done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#e8485a", "line-width": ["interpolate", ["linear"], ["zoom"], 13, 3, 17, 7] } });
      walk.stops.forEach((s, i) => {
        const el = document.createElement("span");
        el.className = "verste-stop";
        el.textContent = String(i + 1);
        el.setAttribute("aria-hidden", "true");
        markers.push(new ml.Marker({ element: el }).setLngLat([walk.waypoints[s.waypoint]![0], walk.waypoints[s.waypoint]![1]]).addTo(map));
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
      for (const m of markers) m.remove();
      worldRef.current?.destroy();
      worldRef.current = null;
    };
  }, [walk, highlights, outlines]);

  // The stop in view drives the map.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          if (i === stops.length) setDone(true);
          else {
            setDone(false);
            setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const c of cards.current) if (c) io.observe(c);
    return () => io.disconnect();
  }, [stops.length]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world || !ready) return;
    const map = world.map;
    const stop = walk.stops[active]!;
    const upTo = done ? walk.geometry.length : walk.waypointIndex[stop.waypoint]! + 1;
    (map.getSource("gv-done") as GeoJSONSource | undefined)?.setData(line(walk.geometry.slice(0, Math.max(2, upTo))));
    const target = done
      ? { center: [43.999, 56.3297] as [number, number], zoom: 14.6, pitch: 45, bearing: 0 }
      : { center: [walk.waypoints[stop.waypoint]![0], walk.waypoints[stop.waypoint]![1]] as [number, number], zoom: 16.5, pitch: 58, bearing: -20 + active * 12 };
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (prefersReducedMotion()) map.jumpTo(target);
    else map.flyTo({ ...target, duration: 1800, essential: true, padding: mobile ? { top: 0, bottom: 0, left: 0, right: 0 } : { top: 40, bottom: 40, left: 40, right: 40 } });
  }, [active, done, ready, walk]);

  const added = trip.includes(walk.id);

  return (
    <div className="relative md:grid md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      {/* The map follows the walker */}
      <div data-surface="night" className="sticky top-16 z-0 h-[42svh] bg-night md:top-20 md:h-[calc(100svh-5rem)]">
        <div ref={mapBox} className="h-full w-full" aria-label="Carte de La Grande Verste" role="region" />
        <div className="pointer-events-none absolute top-3 left-3 rounded-full bg-night/80 px-3 py-1.5 font-mono text-[0.85rem] text-fg backdrop-blur">
          {done ? formatDistance(schedule.totalKm) : formatDistance(schedule.legs[active]!.fromKm + schedule.legs[active]!.km)} / {formatDistance(schedule.totalKm)}
        </div>
      </div>

      {/* The stops */}
      <div data-surface="frost" className="relative z-10 bg-surface text-fg">
        <div className="sticky top-16 z-10 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur md:top-20 md:px-10">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="label mr-2 float-left py-2 text-fg-2">Rythme</legend>
            {(Object.keys(paces) as Pace[]).map((p) => (
              <label key={p} className="label cursor-pointer rounded-full border border-line px-3 py-2 text-fg-2 has-checked:border-fg has-checked:text-fg">
                <input type="radio" name="rythme" value={p} checked={pace === p} onChange={() => setPace(p)} className="sr-only" />
                {paces[p].label}
              </label>
            ))}
            <span className="label ml-auto text-fg-2">Départ 11 h 00 · retour vers {formatClock(11 * 60 + schedule.totalMin)}</span>
          </fieldset>
        </div>

        <ol className="px-5 md:px-10">
          {stops.map((s, i) => {
            const leg = schedule.legs[i]!;
            return (
              <li key={s.label} ref={(el) => void (cards.current[i] = el)} data-index={i} className={`scroll-mt-40 border-b border-line py-12 transition-opacity duration-base ${i === active && !done ? "opacity-100" : "opacity-60"}`}>
                <p className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[1.1rem] text-route">{s.label}</span>
                  <span className="label text-fg-2">
                    {i === 0 ? "Départ" : `+ ${formatDistance(leg.km)} · ${formatDuration(leg.walkMin)} à pied`} · arrivée {formatClock(leg.arrive)}
                  </span>
                </p>
                <h2 className="mt-3 font-display text-h2">{s.title}</h2>
                <p className="mt-1 text-fg-2">
                  {s.placeFr} · <span lang="ru">{s.placeRu}</span>
                </p>
                {s.photo && (
                  <figure className="mt-5">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-night">
                      <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(min-width: 768px) 40vw, 100vw" placeholder="blur" blurDataURL={s.photo.blurDataURL} className="object-cover" />
                    </div>
                    <figcaption className="mt-2 text-[0.78rem] text-fg-2">
                      <span className="label mr-2">{s.photo.kind === "verste" ? "Photographie VERSTE" : "Image libre"}</span>
                      {s.photo.caption}
                      {s.photo.credit && <span className="block opacity-80">{s.photo.credit}</span>}
                    </figcaption>
                  </figure>
                )}
                <p className="mt-5 text-[1.02rem] leading-relaxed text-fg">{s.story}</p>
                <p className="mt-4 border-l-2 border-route pl-4 text-[0.95rem] text-fg">
                  <span className="label mb-1 block text-fg-2">Conseil Verste</span>
                  {s.tip}
                </p>
                <p className="label mt-4 text-fg-2">
                  Sur place : {formatDuration(leg.stayMin)} · <Link href={`/lieux/${s.placeId}`} className="underline underline-offset-4 hover:text-fg">fiche du lieu</Link>
                </p>
              </li>
            );
          })}
          <li ref={(el) => void (cards.current[stops.length] = el)} data-index={stops.length} className="py-20 text-center">
            <p className="label text-fg-2">La Grande Verste · Nijni Novgorod</p>
            <p className="mt-4 font-display font-cond text-[clamp(2rem,5vw,3.6rem)] leading-[0.95] uppercase">
              Vous venez de parcourir {formatDistance(schedule.totalKm)}
            </p>
            <p className="mt-4 text-fg-2">
              {formatDuration(schedule.walkMin)} de marche, {formatDuration(schedule.totalMin)} avec les visites, au rythme « {paces[pace].label.toLowerCase()} ». Distance mesurée sur l&apos;itinéraire piéton réel (OpenStreetMap).
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => toggleTripPlace(walk.id)} aria-pressed={added} className={`inline-flex min-h-12 items-center rounded-xs px-6 text-[0.95rem] font-medium ${added ? "border border-fg/40 text-fg" : "bg-route text-on-route hover:brightness-110"}`}>
                {added ? "Dans mon voyage ✓" : "Ajouter La Grande Verste à mon voyage"}
              </button>
              <Link href="/destinations/nijni-novgorod" className="inline-flex min-h-12 items-center rounded-xs border border-fg/35 px-6 text-[0.95rem] text-fg hover:border-fg">
                Retour à Nijni Novgorod
              </Link>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
