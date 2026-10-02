"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { track } from "@/lib/analytics";
import { formatKm } from "@/lib/format";
import type { CameraView } from "@/lib/map/views";
import { prefersReducedMotion, supportsWebGL } from "@/lib/map/views";
import { scrollToY } from "@/lib/scroll";
import type { LonLat } from "@/lib/travel/types";
import { useTrip } from "@/lib/trip";
import { flightState, routeProgress, type Legs } from "@/lib/voyage/flight";
import { rideState } from "@/lib/voyage/ride";
import type { Metro } from "@/lib/voyage/metro";
import type { Highlight, Hotspot, Mark, MetroLine, Outline, Portal, Scene, WorldLine } from "@/lib/voyage/types";
import type { World } from "@/lib/voyage/world";

import { EscalatorSequence } from "./EscalatorSequence";
import { TrainStage } from "./TrainStage";

export type VoyageMedia = {
  src: string;
  video?: string;
  width: number;
  height: number;
  blurDataURL: string;
  alt: string;
  caption: string;
  kind: "verste" | "illustrative";
  credit?: string;
};

/** A hotspot with its text, photo and link resolved on the server (from its place). */
export type VoyageHotspot = Hotspot & { label: string; ru?: string; text?: string; photo?: VoyageMedia; href?: string };

export type VoyageScene = Scene & { resolved: VoyageMedia[]; spots?: VoyageHotspot[] };

type Props = {
  id?: string;
  label?: string;
  scenes: VoyageScene[];
  highlights: Highlight[];
  outlines: Outline[];
  line?: MetroLine;
  train?: { path: LonLat[]; stations: { ru: string; fr: string; at: number }[]; duration: string };
  escalator?: { pattern: string; count: number; width: number; height: number };
  /** 3D objects in the world (Saint Basil). Off for journeys that do not need them. */
  objects?: boolean;
  /** Stylised 3D fortresses on the relief (data/voyage/fortresses.ts), by id. */
  fortresses?: string;
  /** Legs flown by the plane of the opening flight, by id (data/voyage/flight.ts). */
  legs?: Legs;
  /** Airports and cities drawn on the world. */
  marks?: Mark[];
  /** Named lines drawn on the world (walks, trains). */
  lines?: WorldLine[];
};

// Metro scene: the real escalator first, then the stylised station.
const ESCALATOR_END = 0.24;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const phase = (p: number, a: number, b: number) => (b <= a ? 1 : clamp01((p - a) / (b - a)));

/** A fade over the first or last 0.35 screen of a scene, as the scene declares it. */
function sceneVeil(scene: Scene, local: number): { color: string; opacity: number } {
  const w = Math.min(0.5, 0.35 / scene.length);
  const colour = (c: "dark" | "light") => (c === "light" ? "#f4f6f9" : "#000000");
  if (scene.transition?.in && local < w) return { color: colour(scene.transition.in), opacity: smooth(1 - local / w) };
  if (scene.transition?.out && local > 1 - w) return { color: colour(scene.transition.out), opacity: smooth((local - (1 - w)) / w) };
  return { color: "", opacity: 0 };
}

function cameraAt(keys: CameraView[], t: number): CameraView {
  if (keys.length === 1) return keys[0]!;
  const x = clamp01(t) * (keys.length - 1);
  const i = Math.min(keys.length - 2, Math.floor(x));
  const u = smooth(x - i);
  const a = keys[i]!, b = keys[i + 1]!;
  const lerp = (m: number, n: number) => m + (n - m) * u;
  let db = (b.bearing ?? 0) - (a.bearing ?? 0);
  if (db > 180) db -= 360;
  if (db < -180) db += 360;
  // Zoom moves in log space already; centre follows zoom so the flight feels like a descent.
  return {
    center: [lerp(a.center[0], b.center[0]), lerp(a.center[1], b.center[1])],
    zoom: lerp(a.zoom, b.zoom),
    pitch: lerp(a.pitch ?? 0, b.pitch ?? 0),
    bearing: (a.bearing ?? 0) + db * u,
  };
}

/**
 * LE VOYAGE. One sticky stage; scrolling moves through the scenes, portals
 * move you to another scene (a click = a journey). The world (map) persists
 * across surface scenes; the metro and the train replace it. Each scene has
 * an anchor (/#metro) so every moment can be linked and the back button works.
 */
export function Voyage({ id = "voyage", label = "Le voyage, de Moscou à Nijni Novgorod", scenes, highlights, outlines, line, train, escalator, objects = true, fortresses = "", legs, marks, lines }: Props) {
  const section = useRef<HTMLElement>(null);
  const mapBox = useRef<HTMLDivElement>(null);
  const metroCanvas = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const metroRef = useRef<Metro | null>(null);
  const [near, setNear] = useState(false);
  const [worldReady, setWorldReady] = useState(false);
  const [worldFailed, setWorldFailed] = useState(false);
  const [view, setView] = useState({ i: 0, local: 0 });
  const trip = useTrip();
  const landed = useRef(false);
  // Exploring a hotspot: the camera leaves the scroll path until the visitor scrolls on.
  const [focus, setFocus] = useState<{ spot: VoyageHotspot; y: number } | null>(null);
  const focusRef = useRef<{ spot: VoyageHotspot; y: number } | null>(null);
  const returningUntil = useRef(0);
  const pickRef = useRef<(id: string) => void>(() => {});

  const lengths = useMemo(() => scenes.map((s) => s.length), [scenes]);
  const total = useMemo(() => lengths.reduce((a, b) => a + b, 0), [lengths]);
  const starts = useMemo(() => lengths.reduce<number[]>((acc, l, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + lengths[i - 1]!], []), [lengths]);
  const metroIndex = scenes.findIndex((s) => s.environment === "metro");
  /** The scene in which each 3D object appears: absent before it, standing after it. */
  const appears = useMemo(() => {
    const m = new Map<string, number>();
    scenes.forEach((s, i) => s.objects?.forEach((o) => !m.has(o.id) && m.set(o.id, i)));
    return m;
  }, [scenes]);

  const locate = useCallback(
    (p: number) => {
      const g = clamp01(p) * total;
      let i = starts.findLastIndex((s) => s <= g + 1e-6);
      if (i < 0) i = 0;
      return { i, local: clamp01((g - starts[i]!) / lengths[i]!) };
    },
    [starts, lengths, total],
  );

  /** Drives the world and the metro for a scroll position (no React state here). */
  const drive = useCallback(
    (i: number, local: number) => {
      const scene = scenes[i]!;
      const world = worldRef.current;
      const reduced = prefersReducedMotion();
      if (world && scene.environment === "monde" && scene.camera) {
        const state = scene.vehicle && legs ? flightState(scene.vehicle, reduced ? 1 : local, legs) : null;
        const camera = cameraAt(scene.camera, reduced ? 1 : local);
        if (!focusRef.current && performance.now() > returningUntil.current) {
          // The camera eases onto the vehicle it follows, from where the previous scene left it.
          const w = state && scene.vehicle?.follow ? (reduced ? 1 : smooth(clamp01(local / 0.12))) : 0;
          const center: LonLat = [camera.center[0] + ((state?.at[0] ?? 0) - camera.center[0]) * w, camera.center[1] + ((state?.at[1] ?? 0) - camera.center[1]) * w];
          world.setCamera(w > 0 ? { ...camera, center } : camera);
        }
        world.setVehicle(state && { ...state, kind: scene.vehicle?.kind });
        if (legs) world.setRoute(routeProgress(scenes, i, state, legs));
        world.setMarks(scene.marks ?? []);
        world.setLines(scene.lines ?? []);
        world.setHotspots(scene.spots ?? [], (id) => pickRef.current(id));
        if (state && scene.vehicle?.leg === "ist-svo" && state.t > 0.97 && !landed.current) {
          landed.current = true;
          track("route_completed");
        }
        world.setHighlights(scene.highlights ?? []);
        world.setOutlines(scene.outlines ?? []);
        const [n0, n1] = scene.night ?? [0, 0];
        world.setNight(n0 + (n1 - n0) * local);
        const [w0, w1] = scene.tone ?? [0, 0];
        world.setTone(w0 + (w1 - w0) * local);
        world.setTerrain(scene.terrain ?? null);
        world.setLabels(scene.labels ?? []);
        for (const id of world.objectIds) {
          const own = scene.objects?.find((o) => o.id === id);
          const from = appears.get(id);
          world.setRise(id, own ? (reduced ? 1 : smooth(phase(local, own.rise[0], own.rise[1]))) : from === undefined || i > from ? 1 : 0);
        }
      }
      const metro = metroRef.current;
      if (metro && scene.environment === "metro" && local >= ESCALATOR_END - 0.05) {
        metro.render(clamp01((local - ESCALATOR_END) / (1 - ESCALATOR_END)));
      }
    },
    [scenes, legs, appears],
  );

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  /** Leaves a hotspot: the camera glides back to the journey, then scroll drives it again. */
  const leaveFocus = useCallback(
    (glide: boolean) => {
      if (!focusRef.current) return;
      focusRef.current = null;
      setFocus(null);
      const world = worldRef.current;
      const { i, local } = locate(scrollYProgress.get());
      const cam = scenes[i]?.camera;
      if (world && cam && glide && !prefersReducedMotion()) {
        const ms = 700;
        returningUntil.current = performance.now() + ms;
        world.flyTo(cameraAt(cam, local), ms);
      }
    },
    [locate, scrollYProgress, scenes],
  );

  // Picking a hotspot: fly there and open its card.
  useEffect(() => {
    pickRef.current = (id: string) => {
      const { i } = locate(scrollYProgress.get());
      const spot = scenes[i]?.spots?.find((x) => x.id === id);
      const world = worldRef.current;
      if (!spot || !world) return;
      const next = { spot, y: window.scrollY };
      focusRef.current = next;
      setFocus(next);
      world.flyTo(spot.view, prefersReducedMotion() ? 0 : 1800);
    };
  }, [locate, scrollYProgress, scenes]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && leaveFocus(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, leaveFocus]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const { i, local } = locate(p);
    if (focusRef.current && Math.abs(window.scrollY - focusRef.current.y) > 60) leaveFocus(true);
    drive(i, local);
    const bucket = Math.round(local * 400) / 400;
    setView((v) => (v.i === i && v.local === bucket ? v : { i, local: bucket }));
  });

  // Load the world when the journey approaches.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: "120% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near || !mapBox.current) return;
    let cancelled = false;
    if (!supportsWebGL()) {
      queueMicrotask(() => setWorldFailed(true));
      return;
    }
    const first = scenes.find((s) => s.camera)!.camera![0]!;
    const ids = fortresses ? fortresses.split(",") : [];
    Promise.all([import("@/lib/voyage/world"), ids.length ? import("@/data/voyage/fortresses") : null])
      .then(([{ createWorld }, data]) =>
        createWorld(mapBox.current!, { highlights, outlines, start: first, objects, marks, lines, fortresses: ids.flatMap((id) => (data?.fortresses[id] ? [data.fortresses[id]] : [])) }),
      )
      .then((world) => {
        if (cancelled) return world.destroy();
        worldRef.current = world;
        setWorldReady(true);
        const { i, local } = locate(scrollYProgress.get());
        drive(i, local);
      })
      .catch((e: unknown) => {
        if (process.env.NODE_ENV !== "production") console.error("[voyage] world failed", e);
        setWorldFailed(true);
      });
    return () => {
      cancelled = true;
      worldRef.current?.destroy();
      worldRef.current = null;
    };
  }, [near, scenes, highlights, outlines, objects, fortresses, marks, lines, locate, drive, scrollYProgress]);

  // The metro is built when its scene is next door.
  const metroNear = metroIndex >= 0 && Math.abs(view.i - metroIndex) <= 1;
  useEffect(() => {
    if (!metroNear || metroRef.current || !metroCanvas.current || !supportsWebGL()) return;
    let cancelled = false;
    import("@/lib/voyage/metro").then(({ createMetro }) => {
      if (cancelled || !metroCanvas.current) return;
      metroRef.current = createMetro(metroCanvas.current, line?.stations.map((s) => s.ru) ?? []);
      const redraw = () => {
        const { i, local } = locate(scrollYProgress.get());
        drive(i, local);
      };
      redraw();
      // Once more on the next frame: textures are uploaded by then (deep links into the ride).
      requestAnimationFrame(redraw);
    });
    return () => {
      cancelled = true;
    };
  }, [metroNear, locate, drive, scrollYProgress, line]);

  useEffect(() => {
    const onResize = () => {
      worldRef.current?.resize();
      metroRef.current?.resize();
      const { i, local } = locate(scrollYProgress.get());
      drive(i, local);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      metroRef.current?.dispose();
      metroRef.current = null;
    };
  }, [locate, drive, scrollYProgress]);

  /** A portal: travel to another scene (or a point inside it). */
  const goTo = useCallback(
    (sceneId: string, at = 0.02) => {
      const el = section.current;
      const i = scenes.findIndex((s) => s.id === sceneId);
      if (!el || i < 0) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      scrollToY(top + ((starts[i]! + at * lengths[i]!) / total) * range + 1);
      window.history.replaceState(null, "", `#${sceneId}`);
    },
    [scenes, starts, lengths, total],
  );

  const scene = scenes[view.i]!;
  const env = scene.environment;
  const metroLocal = env === "metro" ? view.local : view.i < metroIndex ? 0 : 1;
  const metro3d = clamp01((metroLocal - ESCALATOR_END) / (1 - ESCALATOR_END));
  const veil = sceneVeil(scene, view.local);

  return (
    <section ref={section} id={id} aria-label={label} className="relative bg-night text-fg" style={{ height: `${total * 100}svh` }}>
      {/* Anchors: every scene can be linked, and the back button works. */}
      {scenes.map((s, i) => (
        <span key={s.id} id={s.id} aria-hidden="true" className="absolute left-0 w-px" style={{ top: `calc(${(starts[i]! / total) * (total - 1) * 100}svh + 2px)` }} />
      ))}

      <div data-surface="night" className="sticky top-0 h-svh overflow-hidden verste-scroll-map">
        {/* THE WORLD */}
        <div ref={mapBox} className={`absolute inset-0 size-full transition-opacity duration-slow ${env === "monde" ? "opacity-100" : "opacity-0"}`} />
        {(!worldReady || worldFailed) && env === "monde" && scene.resolved[0] && (
          <div className="absolute inset-0">
            <Image src={scene.resolved[0].src} alt="" fill sizes="100vw" placeholder="blur" blurDataURL={scene.resolved[0].blurDataURL} className="object-cover opacity-70" />
          </div>
        )}

        {/* THE METRO */}
        <canvas ref={metroCanvas} aria-hidden="true" className={`pointer-events-none absolute inset-0 size-full transition-opacity duration-slow ${env === "metro" && metroLocal >= ESCALATOR_END - 0.03 ? "opacity-100" : "opacity-0"}`} />
        {escalator && metroNear && (
          <EscalatorSequence
            {...escalator}
            progress={clamp01(metroLocal / ESCALATOR_END)}
            load={metroNear}
            className={`pointer-events-none absolute inset-0 size-full transition-opacity duration-base ${env === "metro" && metroLocal < ESCALATOR_END ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {env === "metro" && metro3d >= 0.94 && <div className="pointer-events-none absolute inset-0 bg-[#f4f6f9]" style={{ opacity: smooth((metro3d - 0.94) / 0.06) }} />}

        {/* THE TRAIN */}
        {env === "train" && train && <TrainStage path={train.path} stations={train.stations} progress={view.local} duration={train.duration} />}

        {/* Scene transitions: into the dark (underground), out into the daylight */}
        {veil.opacity > 0 && <div className="pointer-events-none absolute inset-0" style={{ background: veil.color, opacity: veil.opacity }} />}

        {/* Legibility veil */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(12_15_20/0.82)_0%,rgb(12_15_20/0.35)_38%,transparent_60%)] max-lg:bg-[linear-gradient(to_top,rgb(12_15_20/0.92)_0%,rgb(12_15_20/0.55)_38%,transparent_62%)]" />

        {env === "fin" ? (
          <FinalScene scene={scene} tripCount={trip.length} />
        ) : (
          <div className={focus ? "max-lg:invisible" : ""}>
            <SceneText key={scene.id} scene={scene} local={view.local} onPortal={goTo} />
          </div>
        )}

        {/* Exploring a hotspot */}
        {focus && (
          <SpotCard
            spot={focus.spot}
            onBack={() => leaveFocus(true)}
            onPortal={(sceneId, at) => {
              leaveFocus(false);
              goTo(sceneId, at);
            }}
          />
        )}

        {/* The relief is exaggerated and the models are stylised: say so. */}
        {env === "monde" && (scene.terrain || scene.modelNote) && worldReady && !worldFailed && (
          <p className={`label pointer-events-none absolute right-4 bottom-9 z-10 text-fg-2 max-lg:top-20 max-lg:bottom-auto max-lg:max-w-[46vw] md:max-lg:top-24 ${scene.gallery ? "max-lg:right-auto max-lg:left-4" : "max-lg:text-right"}`}>
            {scene.terrain ? `Relief exagéré ×${String(scene.terrain).replace(".", ",")}${scene.labels ? " · maquette stylisée" : ""}` : scene.modelNote}
          </p>
        )}

        {/* The flight (or the train): distance travelled, and how the line is drawn */}
        {env === "monde" && scene.vehicle && legs?.[scene.vehicle.leg] && (
          <FlightCounter state={flightState(scene.vehicle, view.local, legs)} basis={legs[scene.vehicle.leg]!.basis} kind={scene.vehicle.kind} />
        )}

        {/* A destination without field photos: its free images, one after the other (phones) */}
        {env === "monde" && scene.gallery && scene.resolved.length > 0 && !focus && <PhoneGallery media={scene.resolved} local={view.local} />}

        {scene.id === "poklonnaia" && <TimedPhotos scene={scene} local={view.local} />}
        {env === "metro" && line && <MetroUI line={line} local={metroLocal} p3d={metro3d} onBoard={() => goTo("metro", 0.56)} media={scene.resolved} />}

        <JourneyIndex scenes={scenes} current={view.i} onGo={goTo} light={env === "fin"} />
      </div>
    </section>
  );
}

function SpotCard({ spot, onBack, onPortal }: { spot: VoyageHotspot; onBack: () => void; onPortal: (id: string, at?: number) => void }) {
  return (
    <aside
      aria-label={spot.label}
      className="enter absolute inset-x-3 bottom-3 z-20 overflow-hidden rounded-[6px] border border-line bg-night/90 backdrop-blur-md lg:inset-x-auto lg:right-16 lg:bottom-10 lg:w-[380px]"
    >
      {spot.photo && (
        <div className="relative aspect-[16/10] max-lg:hidden">
          <Image src={spot.photo.src} alt={spot.photo.alt} fill sizes="380px" placeholder="blur" blurDataURL={spot.photo.blurDataURL} className="object-cover" />
        </div>
      )}
      <div className="p-5">
        <p className="label text-fg-2">Explorer</p>
        <h3 className="mt-2 font-display text-[1.9rem] leading-none">{spot.label}</h3>
        {spot.ru && (
          <p lang="ru" className="mt-1 font-display font-cond text-[1.05rem] text-fg-2">
            {spot.ru}
          </p>
        )}
        {spot.text && <p className="mt-3 text-[0.95rem] leading-snug text-fg">{spot.text}</p>}
        {spot.photo && (
          <p className="mt-3 text-[0.72rem] text-fg-2 max-lg:hidden">
            <span className="label mr-2">{spot.photo.kind === "verste" ? "Photographie VERSTE" : "Image libre"}</span>
            {spot.photo.caption}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {spot.portal && <PortalButton portal={spot.portal} primary onPortal={onPortal} />}
          {spot.href && (
            <Link href={spot.href} className="inline-flex min-h-11 items-center gap-2 rounded-xs border border-fg/35 px-4 text-[0.92rem] text-fg hover:border-fg">
              La fiche
            </Link>
          )}
          <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center px-3 text-[0.92rem] text-fg-2 underline decoration-fg/30 underline-offset-[6px] hover:text-fg">
            Revenir au voyage
          </button>
        </div>
      </div>
    </aside>
  );
}

function FlightCounter({ state, basis, kind }: { state: ReturnType<typeof flightState>; basis: string; kind: "avion" | "train" }) {
  if (!state) return null;
  const [long, short] = kind === "train" ? ["Depuis Moscou, sur le tracé", "sur le tracé"] : ["À vol d'oiseau depuis Paris", "à vol d'oiseau"];
  return (
    <div className="pointer-events-none absolute z-10 max-lg:top-[4.75rem] max-lg:left-4 max-lg:flex max-lg:items-baseline max-lg:gap-3 md:max-lg:top-24 lg:right-16 lg:bottom-10 lg:text-right">
      <p className="font-mono text-[clamp(1.15rem,3.4vw,3.2rem)] leading-none tabular text-fg">{formatKm(state.km)}</p>
      <p className="label text-fg-2 lg:mt-2">
        <span className="max-lg:hidden">{long}</span>
        <span className="lg:hidden">{short}</span>
      </p>
      <p className="label mt-1 text-fg-2/80 max-lg:hidden">{basis}</p>
    </div>
  );
}

/** Which photo of a gallery is shown at this point of the scene. */
const galleryIndex = (n: number, local: number) => Math.min(n - 1, Math.floor(clamp01(local * 1.02) * n));

function GalleryFrames({ media, k, sizes }: { media: VoyageMedia[]; k: number; sizes: string }) {
  return media.map((r, j) => (
    <Image key={r.src} src={r.src} alt={j === k ? r.alt : ""} fill sizes={sizes} placeholder="blur" blurDataURL={r.blurDataURL} className={`object-cover transition-opacity duration-slow ${j === k ? "opacity-100" : "opacity-0"}`} />
  ));
}

/** Large screens: the scene's free images, in the text column, credited. */
function Gallery({ media, local, small }: { media: VoyageMedia[]; local: number; small: boolean }) {
  const k = galleryIndex(media.length, local);
  const m = media[k]!;
  return (
    <figure className="mt-5 hidden w-full max-w-[380px] lg:block">
      <div className={`relative overflow-hidden rounded-[4px] border border-line ${small ? "h-[clamp(72px,12svh,150px)]" : "h-[clamp(96px,16svh,230px)]"}`}>
        <GalleryFrames media={media} k={k} sizes="380px" />
      </div>
      <figcaption className="mt-2 text-[0.74rem] leading-snug text-fg-2">
        <span className="label mr-2 text-fg">Image libre</span>
        {m.caption}
        {m.credit && <span className="block opacity-80">{m.credit}</span>}
      </figcaption>
    </figure>
  );
}

/** Phones: a small framed photo above the world, gone once the camera reaches the monument. */
function PhoneGallery({ media, local }: { media: VoyageMedia[]; local: number }) {
  const k = galleryIndex(media.length, local);
  const m = media[k]!;
  return (
    <figure className={`pointer-events-none absolute top-[4.5rem] right-3 z-10 w-[min(42vw,200px)] md:top-24 transition-opacity duration-base lg:hidden ${local < 0.5 ? "opacity-100" : "opacity-0"}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] border border-line">
        <GalleryFrames media={media} k={k} sizes="200px" />
      </div>
      {m.credit && <figcaption className="mt-1 text-right text-[0.6rem] leading-tight text-fg-2 [text-shadow:0_1px_8px_rgb(12_15_20)]">Image libre · {m.credit}</figcaption>}
    </figure>
  );
}

function PortalButton({ portal, primary, onPortal }: { portal: Portal; primary: boolean; onPortal: (id: string, at?: number) => void }) {
  const cls = primary
    ? "inline-flex min-h-11 items-center gap-2 rounded-xs bg-route px-4 text-[0.92rem] font-medium text-on-route hover:brightness-110"
    : "inline-flex min-h-11 items-center gap-2 rounded-xs border border-fg/35 px-4 text-[0.92rem] text-fg hover:border-fg";
  const inner = (
    <>
      <span className="label opacity-80">{portal.verb}</span>
      <span aria-hidden="true">·</span>
      {portal.label}
    </>
  );
  if ("href" in portal.to) {
    return (
      <Link href={portal.to.href} className={cls}>
        {inner}
      </Link>
    );
  }
  const to = portal.to;
  return (
    <button type="button" onClick={() => onPortal(to.scene, to.at)} className={cls}>
      {inner}
    </button>
  );
}

function SceneText({ scene, local, onPortal }: { scene: VoyageScene; local: number; onPortal: (id: string, at?: number) => void }) {
  const visible = scene.environment !== "metro" && scene.environment !== "train" ? true : local < 0.12;
  const photo = scene.id === "poklonnaia" || scene.gallery ? undefined : scene.resolved[0];
  const compact = Boolean(scene.figures || scene.gallery);
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(3.25rem,env(safe-area-inset-bottom))] transition-opacity duration-base lg:top-0 lg:right-auto lg:flex lg:w-[min(520px,44vw)] lg:flex-col lg:justify-center-safe lg:px-10 lg:pt-24 lg:pb-10 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <p className="label text-fg-2">{scene.kicker}</p>
      <h2 className={`enter mt-3 font-display leading-[0.95] ${compact ? "text-[clamp(2.2rem,4.6vw,4rem)]" : "text-[clamp(2.4rem,6vw,5rem)]"}`}>{scene.title}</h2>
      {scene.ru && (
        <p lang="ru" className="mt-2 font-display font-cond text-[clamp(1.05rem,2vw,1.5rem)] text-fg-2">
          {scene.ru}
        </p>
      )}
      <p className="mt-4 max-w-[46ch] text-[1.02rem] leading-relaxed text-fg lg:text-lead">{scene.text}</p>
      {scene.figures && (
        <dl className="mt-5 grid max-w-[46ch] grid-cols-3 gap-4 border-t border-line pt-4">
          {scene.figures.map((f) => (
            <div key={f.label}>
              <dt className="label text-fg-2">{f.label}</dt>
              <dd className="mt-1.5 font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-none">{f.value}</dd>
              <dd className="mt-1.5 text-[0.7rem] leading-snug text-fg-2">{f.note}</dd>
            </div>
          ))}
        </dl>
      )}
      {photo && scene.environment === "monde" && (
        <figure className={`mt-5 hidden max-w-[360px] items-start gap-3 lg:flex ${scene.figures ? "[@media(max-height:859px)]:hidden!" : ""}`}>
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[3px]">
            {photo.video ? (
              <video src={photo.video} poster={photo.src} muted loop playsInline autoPlay aria-label={photo.alt} className="size-full object-cover motion-reduce:hidden" />
            ) : (
              <Image src={photo.src} alt={photo.alt} fill sizes="80px" placeholder="blur" blurDataURL={photo.blurDataURL} className="object-cover" />
            )}
          </div>
          <figcaption className="text-[0.78rem] leading-snug text-fg-2">
            <span className="label block text-fg">{photo.kind === "verste" ? "Photographie VERSTE" : "Image libre"}</span>
            {photo.caption}
            {photo.credit && <span className="block opacity-80">{photo.credit}</span>}
          </figcaption>
        </figure>
      )}
      {scene.gallery && scene.environment === "monde" && scene.resolved.length > 0 && <Gallery media={scene.resolved} local={local} small={Boolean(scene.figures)} />}
      {scene.portals.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {scene.portals.map((p, i) => (
            <PortalButton key={p.label} portal={p} primary={i === 0} onPortal={onPortal} />
          ))}
        </div>
      )}
    </div>
  );
}

function TimedPhotos({ scene, local }: { scene: VoyageScene; local: number }) {
  const n = scene.resolved.length;
  const k = Math.min(n - 1, Math.floor(clamp01(local * 1.05) * n));
  const m = scene.resolved[k]!;
  return (
    <figure className="absolute top-20 right-4 z-10 w-[min(300px,42vw)] lg:top-1/2 lg:right-16 lg:w-[min(360px,28vw)] lg:-translate-y-1/2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-line">
        {scene.resolved.map((r, j) => (
          <Image key={r.src} src={r.src} alt={j === k ? r.alt : ""} fill sizes="360px" placeholder="blur" blurDataURL={r.blurDataURL} className={`object-cover transition-opacity duration-slow ${j === k ? "opacity-100" : "opacity-0"}`} />
        ))}
        <p className="absolute top-3 left-3 rounded-full bg-night/80 px-3 py-1 font-mono text-[1.1rem] text-fg backdrop-blur">{scene.mediaTimes?.[k]}</p>
      </div>
      <figcaption className="mt-2 text-[0.75rem] text-fg-2 max-lg:hidden">
        <span className="label mr-2 text-fg">Photographie VERSTE</span>
        {m.caption}
      </figcaption>
    </figure>
  );
}

function MetroUI({ line, local, p3d, onBoard, media }: { line: MetroLine; local: number; p3d: number; onBoard: () => void; media: VoyageMedia[] }) {
  const escalator = local < ESCALATOR_END;
  const hall = !escalator && p3d < 0.3;
  const choose = p3d >= 0.3 && p3d < 0.58;
  const ride = p3d >= 0.66 && p3d < 0.95;
  const rideT = clamp01((p3d - 0.66) / 0.28);
  const at = rideState(rideT, line.stations.length).station;
  const escalatorPhoto = media[0];
  const doorsClose = p3d >= 0.62 && p3d < 0.7 ? clamp01(1 - Math.abs(p3d - 0.66) / 0.04) : 0;
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {doorsClose > 0 && <div className="absolute inset-0 bg-night" style={{ opacity: doorsClose }} />}
      {ride && (
        <div aria-hidden="true" className="absolute inset-[9%_4%_12%] rounded-[36px] border-[18px] border-[#1a1d22] shadow-[0_0_0_100vmax_#101216,inset_0_0_80px_rgb(0_0_0/0.7)] lg:inset-[12%_14%_14%]" />
      )}
      {escalator && local > 0.03 && escalatorPhoto && (
        <p className="label absolute right-4 bottom-4 max-w-[46ch] text-right text-fg-2 lg:right-16">Photographie VERSTE · {escalatorPhoto.caption}</p>
      )}
      {hall && (
        <div className="absolute inset-x-5 bottom-8 lg:inset-x-auto lg:bottom-auto lg:left-10 lg:top-1/2 lg:w-[440px] lg:-translate-y-1/2">
          <p className="label text-fg-2">Sous Moscou</p>
          <p className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] leading-tight">La station s&apos;ouvre comme un palais.</p>
          <p className="mt-3 text-fg-2">Station stylisée VERSTE, inspirée des grandes stations des années 1930 à 1950 : voûte, arcades, lustres, granit.</p>
          <div className="mt-4 flex gap-2">
            {media.slice(1, 4).map((m) => (
              <div key={m.src} className="relative h-16 w-24 overflow-hidden rounded-[3px]" title={`${m.caption} ${m.credit ?? ""}`}>
                <Image src={m.src} alt={m.alt} fill sizes="96px" className="object-cover" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.72rem] text-fg-2">Les vraies stations : Maïakovskaïa, Komsomolskaïa, Novoslobodskaïa (images libres, Wikimedia Commons).</p>
        </div>
      )}
      {choose && (
        <div className="pointer-events-auto absolute inset-x-5 bottom-8 rounded-[6px] border border-line bg-night/85 p-5 backdrop-blur lg:inset-x-auto lg:bottom-auto lg:left-10 lg:top-1/2 lg:w-[400px] lg:-translate-y-1/2">
          <p className="label text-fg-2">Choisir sa ligne</p>
          <button type="button" onClick={onBoard} className="mt-3 flex w-full items-center gap-3 rounded-[4px] border border-fg/30 p-3 text-left hover:border-fg">
            <span className="grid size-8 shrink-0 place-items-center rounded-full font-mono text-[0.85rem] font-semibold text-white" style={{ background: line.color }}>
              {line.number}
            </span>
            <span>
              <span className="block text-fg">
                Ligne {line.number} · <span lang="ru">{line.ru}</span>
              </span>
              <span className="text-[0.82rem] text-fg-2">
                {line.stations[0]!.fr} → {line.stations[line.stations.length - 1]!.fr}
              </span>
            </span>
          </button>
          {["2", "5"].map((n) => (
            <p key={n} className="mt-2 flex items-center gap-3 p-3 text-fg-2 opacity-60">
              <span className="grid size-8 place-items-center rounded-full border border-fg/30 font-mono text-[0.85rem]">{n}</span>
              Bientôt : d&apos;autres lignes, d&apos;autres quartiers
            </p>
          ))}
        </div>
      )}
      {ride && (
        <div className="absolute top-20 left-5 lg:top-1/2 lg:left-10 lg:-translate-y-1/2">
          <p className="label flex items-center gap-2 text-fg-2">
            <span className="grid size-5 place-items-center rounded-full font-mono text-[0.65rem] text-white" style={{ background: line.color }}>
              {line.number}
            </span>
            Ligne {line.number}, vers le sud-ouest
          </p>
          <ol className="mt-4 space-y-2 border-l border-fg/25 pl-4">
            {line.stations.map((s, i) => (
              <li key={s.fr} className={`transition-colors duration-base ${i === at ? "text-fg" : i < at ? "text-fg-2/60" : "text-fg-2"}`}>
                <span lang="ru" className={`block font-display font-cond ${i === at ? "text-[1.6rem]" : "text-[1rem]"}`}>
                  {s.ru}
                </span>
                {i === at && <span className="label">{s.fr}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function FinalScene({ scene, tripCount }: { scene: VoyageScene; tripCount: number }) {
  return (
    <div data-surface="frost" className="absolute inset-0 z-10 grid place-items-center bg-surface px-5 text-fg">
      <div className="max-w-[760px] text-center">
        <p className="label text-fg-2">{scene.kicker}</p>
        <h2 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95]">{scene.title}</h2>
        <p className="mx-auto mt-6 max-w-[56ch] text-lead text-fg-2">{scene.text}</p>
        {tripCount > 0 && <p className="label mt-6 text-fg">Dans votre voyage : {tripCount} lieu{tripCount > 1 ? "x" : ""} mis de côté</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {scene.portals.map((p, i) =>
            "href" in p.to ? (
              <Link
                key={p.label}
                href={p.to.href}
                className={
                  i === 0
                    ? "inline-flex min-h-12 items-center rounded-xs bg-route px-6 text-[0.95rem] font-medium text-on-route hover:brightness-110"
                    : "inline-flex min-h-12 items-center rounded-xs border border-fg/35 px-6 text-[0.95rem] text-fg hover:border-fg"
                }
              >
                {p.label}
              </Link>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyIndex({ scenes, current, onGo, light }: { scenes: VoyageScene[]; current: number; onGo: (id: string) => void; light: boolean }) {
  return (
    <nav data-surface={light ? "frost" : undefined} aria-label="Étapes du voyage" className="absolute top-1/2 right-3 z-20 -translate-y-1/2 max-lg:hidden">
      <ol className="relative flex flex-col items-end gap-2.5">
        <span aria-hidden="true" className="absolute top-1 right-[4.5px] bottom-1 w-px bg-fg/20" />
        {scenes.map((s, i) => (
          <li key={s.id}>
            <button type="button" onClick={() => onGo(s.id)} className="group flex flex-row-reverse items-center gap-3" aria-current={i === current ? "step" : undefined}>
              <span className={`relative size-2.5 rounded-full border transition-colors ${i === current ? "border-route bg-route" : i < current ? "border-route bg-route/60" : "border-fg/50 bg-night"}`} />
              <span className={`label transition-opacity ${i === current ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
