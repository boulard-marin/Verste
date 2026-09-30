"use client";

import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { PlaceSheet } from "@/components/map/PlaceSheet";
import type { MapPhoto, MapPlace } from "@/lib/map/data";
import { loadMapLibre } from "@/lib/map/load";
import { buildNightStyle } from "@/lib/map/style";
import { prefersReducedMotion, saintBasilDescent, supportsWebGL, type CameraView } from "@/lib/map/views";
import { formatLonLat } from "@/lib/travel/geo";
import type { LonLat } from "@/lib/travel/types";
import { toggleTripPlace, useTrip } from "@/lib/trip";

type Props = {
  place: MapPlace;
  /** One photo per step, used while the map loads and as the no-WebGL version. */
  steps: { photo: MapPhoto; line: string }[];
  /** The founder's viewpoint for the golden-hour photo. */
  viewpoint: { coords: LonLat; photo: MapPhoto };
};

const CAMERA_END = 0.8;
const RISE: [number, number] = [0.62, 0.86];

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function cameraAt(p: number): CameraView {
  const keys = saintBasilDescent;
  const x = clamp01(p / CAMERA_END) * (keys.length - 1);
  const i = Math.min(keys.length - 2, Math.floor(x));
  const t = smooth(x - i);
  const a = keys[i]!, b = keys[i + 1]!;
  const lerp = (u: number, v: number) => u + (v - u) * t;
  return {
    center: [lerp(a.center[0], b.center[0]), lerp(a.center[1], b.center[1])],
    zoom: lerp(a.zoom, b.zoom),
    pitch: lerp(a.pitch ?? 0, b.pitch ?? 0),
    bearing: lerp(a.bearing ?? 0, b.bearing ?? 0),
  };
}

const FINAL = saintBasilDescent[saintBasilDescent.length - 1]!;

/**
 * ENTRER · APPROCHER · DÉCOUVRIR. Scrolling brings the camera from Moscow
 * down to Saint Basil, which rises from the ground in 3D at its real place.
 * Function of the motion: understand where the cathedral is, and its plan.
 * Rest state = final state (reduced motion shows the cathedral directly).
 */
export function SaintBasilScene({ place, steps, viewpoint }: Props) {
  const section = useRef<HTMLElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const riseRef = useRef<((t: number) => void) | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [step, setStep] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [showViewpoint, setShowViewpoint] = useState(false);
  const [sheet, setSheet] = useState(false);
  const trip = useTrip();
  const added = trip.includes(place.id);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  const apply = useCallback(
    (p: number) => {
      const map = mapRef.current;
      setStep(Math.min(saintBasilDescent.length - 1, Math.round(clamp01(p / CAMERA_END) * (saintBasilDescent.length - 1))));
      setArrived(p >= RISE[1]);
      if (!map || exploring) return;
      const cam = cameraAt(p);
      map.jumpTo({ center: [cam.center[0], cam.center[1]], zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing });
      riseRef.current?.(smooth(clamp01((p - RISE[0]) / (RISE[1] - RISE[0]))));
    },
    [exploring],
  );

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!prefersReducedMotion()) apply(p);
  });

  // Start loading when the scene is about to enter the screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: "150% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near || !container.current) return;
    if (!supportsWebGL()) {
      queueMicrotask(() => setFailed(true));
      return;
    }
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const markers = markersRef.current;
    (async () => {
      const [ml, model] = await Promise.all([loadMapLibre(), import("@/lib/map/saint-basil-model")]);
      if (cancelled || !container.current) return;
      const reduced = prefersReducedMotion();
      const start = reduced ? FINAL : cameraAt(scrollYProgress.get());
      map = new ml.Map({
        container: container.current,
        style: buildNightStyle(),
        center: [start.center[0], start.center[1]],
        zoom: start.zoom,
        pitch: start.pitch ?? 0,
        bearing: start.bearing ?? 0,
        maxPitch: 75,
        attributionControl: { compact: true },
        fadeDuration: 0,
      });
      mapRef.current = map;
      for (const h of [map.scrollZoom, map.dragPan, map.dragRotate, map.touchZoomRotate, map.touchPitch, map.doubleClickZoom, map.keyboard, map.boxZoom]) h.disable();
      map.on("load", () => {
        if (!map) return;
        // Hide the flat OSM footprint where the model stands.
        const outside = ["!", ["within", model.saintBasilFootprint()]] as const;
        for (const id of ["building-3d", "building-flat"]) if (map.getLayer(id)) map.setFilter(id, outside as unknown as Parameters<MapLibreMap["setFilter"]>[1]);
        const basil = model.createSaintBasilLayer(ml.MercatorCoordinate, 0);
        map.addLayer(basil.layer);
        riseRef.current = basil.setRise;
        basil.setRise(reduced ? 1 : smooth(clamp01((scrollYProgress.get() - RISE[0]) / (RISE[1] - RISE[0]))));

        const hotspot = document.createElement("button");
        hotspot.type = "button";
        hotspot.className = "verste-hotspot";
        hotspot.innerHTML = `<span class="verste-hotspot-dot"></span><span class="verste-hotspot-label">${place.fr}</span>`;
        hotspot.setAttribute("aria-label", `${place.fr} : ouvrir la fiche`);
        hotspot.addEventListener("click", () => setSheet(true));
        const eye = document.createElement("button");
        eye.type = "button";
        eye.className = "verste-hotspot is-viewpoint";
        eye.innerHTML = `<span class="verste-hotspot-dot"></span><span class="verste-hotspot-label">D'où la photo a été prise</span>`;
        eye.setAttribute("aria-label", "Voir d'où la photographie a été prise");
        eye.addEventListener("click", () => setShowViewpoint(true));
        markers.push(
          new ml.Marker({ element: hotspot, anchor: "bottom", offset: [0, -40] }).setLngLat([place.coords[0], place.coords[1]]).addTo(map),
          new ml.Marker({ element: eye, anchor: "left" }).setLngLat([viewpoint.coords[0], viewpoint.coords[1]]).addTo(map),
        );
        setReady(true);
      });
    })();
    return () => {
      cancelled = true;
      for (const m of markers) m.remove();
      markers.length = 0;
      map?.remove();
      mapRef.current = null;
      riseRef.current = null;
    };
  }, [near, place, viewpoint, scrollYProgress]);

  // Free exploration: the visitor takes the camera.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const h of [map.dragPan, map.dragRotate, map.touchZoomRotate, map.touchPitch, map.doubleClickZoom, map.keyboard]) {
      if (exploring) h.enable();
      else h.disable();
    }
  }, [exploring, ready]);

  // The viewpoint: stand where the founder stood, looking at the cathedral.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showViewpoint) return;
    setExploring(true);
    const opts = { center: [place.coords[0], place.coords[1]] as [number, number], zoom: 18.2, pitch: 72, bearing: 111 };
    if (prefersReducedMotion()) map.jumpTo(opts);
    else map.flyTo({ ...opts, duration: 2400, essential: true });
  }, [showViewpoint, place.coords]);

  const current = steps[step] ?? steps[0]!;
  const key = saintBasilDescent[step]!;

  return (
    <section ref={section} id="saint-basile" data-surface="night" aria-label="Saint-Basile" className="relative h-[420svh] bg-night text-fg still:h-auto">
      <div className={`sticky top-0 h-svh overflow-hidden still:relative ${exploring ? "" : "verste-scroll-map"}`}>
        <div ref={container} className="h-full w-full" data-lenis-prevent={exploring ? true : undefined} />

        {/* Photos: while the map loads, and instead of it without WebGL. */}
        {(!ready || failed) && (
          <div className="absolute inset-0">
            {steps.map((s, i) => (
              <Image
                key={s.photo.src}
                src={s.photo.src}
                alt={i === step ? s.photo.alt : ""}
                fill
                sizes="100vw"
                placeholder="blur"
                blurDataURL={s.photo.blurDataURL}
                className={`object-cover transition-opacity duration-slow ${i === step ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/60" />
            <p className="label absolute right-4 bottom-4 max-w-[60ch] text-right text-fg-2 md:right-8">
              {current.photo.kind === "verste" ? "Photographie VERSTE · " : "Image libre · "}
              {current.photo.caption}
            </p>
          </div>
        )}

        {/* Caption of the current step */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-night/85 to-transparent px-5 pt-24 pb-16 md:px-10 md:pt-32">
          <p className="label text-fg-2">
            {String(step + 1).padStart(2, "0")} / {String(saintBasilDescent.length).padStart(2, "0")} · Entrer dans Moscou
          </p>
          <h2 key={key.caption} className="enter mt-3 font-display text-h1">
            {key.caption}
          </h2>
          {key.ru && (
            <p lang="ru" className="mt-2 font-display font-cond text-[clamp(1.1rem,2.2vw,1.6rem)] text-fg-2">
              {key.ru}
            </p>
          )}
          <p className="mt-4 max-w-[40ch] text-lead text-fg">{current.line}</p>
        </div>

        {/* Progress along the verst line */}
        <div aria-hidden="true" className="absolute top-1/2 right-4 h-40 w-px -translate-y-1/2 bg-fg/20 md:right-8">
          <div className="w-px bg-route transition-[height] duration-base" style={{ height: `${((step + (arrived ? 1 : 0.5)) / saintBasilDescent.length) * 100}%` }} />
        </div>

        {/* Arrival: the visitor takes over */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/80 to-transparent px-5 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-slow ease-verste md:px-10 md:pb-10 ${
            arrived || failed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          } still:translate-y-0 still:opacity-100`}
        >
          <p className="font-mono text-[0.8rem] text-fg-2">{formatLonLat(place.coords)}</p>
          <p className="mt-2 max-w-[48ch] text-fg">{place.summary}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setSheet(true)} className="inline-flex min-h-11 items-center rounded-xs bg-route px-4 text-[0.9rem] font-medium text-on-route hover:brightness-110">
              Ouvrir la fiche
            </button>
            <button type="button" onClick={() => toggleTripPlace(place.id)} aria-pressed={added} className="inline-flex min-h-11 items-center rounded-xs border border-fg/35 px-4 text-[0.9rem] text-fg hover:border-fg">
              {added ? "Dans mon voyage ✓" : "Ajouter à mon voyage"}
            </button>
            {ready && (
              <button type="button" onClick={() => setExploring((e) => !e)} aria-pressed={exploring} className="inline-flex min-h-11 items-center rounded-xs border border-fg/35 px-4 text-[0.9rem] text-fg hover:border-fg">
                {exploring ? "Rendre la caméra" : "Tourner autour"}
              </button>
            )}
            <Link href="/carte?lieu=saint-basile" className="inline-flex min-h-11 items-center px-2 text-[0.9rem] text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-route">
              Sur la Russia Travel Map
            </Link>
          </div>
          <p className="label mt-4 text-fg-2">Modélisation stylisée VERSTE, proportions indicatives · fond © OpenStreetMap</p>
        </div>

        {showViewpoint && (
          <figure data-surface="night" className="absolute top-24 right-4 z-10 w-[min(280px,70vw)] overflow-hidden rounded-[6px] border border-line bg-night/90 backdrop-blur md:top-28 md:right-10">
            <div className="relative aspect-[3/4]">
              <Image src={viewpoint.photo.src} alt={viewpoint.photo.alt} fill sizes="280px" placeholder="blur" blurDataURL={viewpoint.photo.blurDataURL} className="object-cover" />
            </div>
            <figcaption className="p-3 text-[0.8rem] text-fg-2">
              <span className="label block text-fg">Photographie VERSTE</span>
              {viewpoint.photo.caption}
              <button type="button" onClick={() => setShowViewpoint(false)} className="label mt-2 block text-fg underline underline-offset-4">
                Fermer
              </button>
            </figcaption>
          </figure>
        )}

        {sheet && <PlaceSheet place={place} onClose={() => setSheet(false)} />}
      </div>
    </section>
  );
}
