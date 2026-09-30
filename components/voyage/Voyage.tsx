"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CameraView } from "@/lib/map/views";
import { prefersReducedMotion, supportsWebGL } from "@/lib/map/views";
import { scrollToY } from "@/lib/scroll";
import type { LonLat } from "@/lib/travel/types";
import { useTrip } from "@/lib/trip";
import type { Metro } from "@/lib/voyage/metro";
import type { Highlight, MetroLine, Outline, Portal, Scene } from "@/lib/voyage/types";
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

export type VoyageScene = Scene & { resolved: VoyageMedia[] };

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
};

// Metro scene: the real escalator first, then the stylised station.
const ESCALATOR_END = 0.24;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const phase = (p: number, a: number, b: number) => (b <= a ? 1 : clamp01((p - a) / (b - a)));

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
export function Voyage({ id = "voyage", label = "Le voyage, de Moscou à Nijni Novgorod", scenes, highlights, outlines, line, train, escalator, objects = true }: Props) {
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

  const lengths = useMemo(() => scenes.map((s) => s.length), [scenes]);
  const total = useMemo(() => lengths.reduce((a, b) => a + b, 0), [lengths]);
  const starts = useMemo(() => lengths.reduce<number[]>((acc, l, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + lengths[i - 1]!], []), [lengths]);
  const metroIndex = scenes.findIndex((s) => s.environment === "metro");

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
        world.setCamera(cameraAt(scene.camera, reduced ? 1 : local));
        world.setHighlights(scene.highlights ?? []);
        world.setOutlines(scene.outlines ?? []);
        const [n0, n1] = scene.night ?? [0, 0];
        world.setNight(n0 + (n1 - n0) * local);
        const basil = scene.objects?.find((o) => o.id === "saint-basile");
        world.setRise("saint-basile", basil ? (reduced ? 1 : smooth(phase(local, basil.rise[0], basil.rise[1]))) : 0);
      }
      const metro = metroRef.current;
      if (metro && scene.environment === "metro" && local >= ESCALATOR_END - 0.05) {
        metro.render(clamp01((local - ESCALATOR_END) / (1 - ESCALATOR_END)));
      }
    },
    [scenes],
  );

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const { i, local } = locate(p);
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
    import("@/lib/voyage/world")
      .then(({ createWorld }) => createWorld(mapBox.current!, { highlights, outlines, start: first, objects }))
      .then((world) => {
        if (cancelled) return world.destroy();
        worldRef.current = world;
        setWorldReady(true);
        const { i, local } = locate(scrollYProgress.get());
        drive(i, local);
      })
      .catch(() => setWorldFailed(true));
    return () => {
      cancelled = true;
      worldRef.current?.destroy();
      worldRef.current = null;
    };
  }, [near, scenes, highlights, outlines, objects, locate, drive, scrollYProgress]);

  // The metro is built when its scene is next door.
  const metroNear = metroIndex >= 0 && Math.abs(view.i - metroIndex) <= 1;
  useEffect(() => {
    if (!metroNear || metroRef.current || !metroCanvas.current || !supportsWebGL()) return;
    let cancelled = false;
    import("@/lib/voyage/metro").then(({ createMetro }) => {
      if (cancelled || !metroCanvas.current) return;
      metroRef.current = createMetro(metroCanvas.current);
      const { i, local } = locate(scrollYProgress.get());
      drive(i, local);
    });
    return () => {
      cancelled = true;
    };
  }, [metroNear, locate, drive, scrollYProgress]);

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
  const fromWhite = (scene.id === "vorobiovy-gory" || scene.id === "nijni") && view.local < 0.12 ? 1 - view.local / 0.12 : 0;

  return (
    <section ref={section} id={id} aria-label={label} className="relative bg-night text-fg" style={{ height: `${total * 100}svh` }}>
      {/* Anchors: every scene can be linked, and the back button works. */}
      {scenes.map((s, i) => (
        <span key={s.id} id={s.id} aria-hidden="true" className="absolute left-0 w-px" style={{ top: `calc(${(starts[i]! / total) * (total - 1) * 100}svh + 2px)` }} />
      ))}

      <div data-surface="night" className="sticky top-0 h-svh overflow-hidden verste-scroll-map">
        {/* THE WORLD */}
        <div ref={mapBox} className={`absolute inset-0 transition-opacity duration-slow ${env === "monde" ? "opacity-100" : "opacity-0"}`} />
        {(!worldReady || worldFailed) && env === "monde" && scene.resolved[0] && (
          <Image src={scene.resolved[0].src} alt="" fill sizes="100vw" placeholder="blur" blurDataURL={scene.resolved[0].blurDataURL} className="object-cover opacity-70" />
        )}

        {/* THE METRO */}
        <canvas ref={metroCanvas} aria-hidden="true" className={`absolute inset-0 size-full transition-opacity duration-slow ${env === "metro" && metroLocal >= ESCALATOR_END - 0.03 ? "opacity-100" : "opacity-0"}`} />
        {escalator && metroNear && (
          <EscalatorSequence
            {...escalator}
            progress={clamp01(metroLocal / ESCALATOR_END)}
            load={metroNear}
            className={`absolute inset-0 size-full transition-opacity duration-base ${env === "metro" && metroLocal < ESCALATOR_END ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {env === "metro" && metro3d >= 0.94 && <div className="pointer-events-none absolute inset-0 bg-[#f4f6f9]" style={{ opacity: smooth((metro3d - 0.94) / 0.06) }} />}

        {/* THE TRAIN */}
        {env === "train" && train && <TrainStage path={train.path} stations={train.stations} progress={view.local} duration={train.duration} />}

        {/* Out of the metro / the train: daylight */}
        {fromWhite > 0 && <div className="pointer-events-none absolute inset-0 bg-[#f4f6f9]" style={{ opacity: fromWhite }} />}

        {/* Legibility veil */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(12_15_20/0.82)_0%,rgb(12_15_20/0.35)_38%,transparent_60%)] max-lg:bg-[linear-gradient(to_top,rgb(12_15_20/0.92)_0%,rgb(12_15_20/0.55)_38%,transparent_62%)]" />

        {env === "fin" ? (
          <FinalScene scene={scene} tripCount={trip.length} />
        ) : (
          <SceneText key={scene.id} scene={scene} local={view.local} onPortal={goTo} />
        )}

        {scene.id === "poklonnaia" && <TimedPhotos scene={scene} local={view.local} />}
        {env === "metro" && line && <MetroUI line={line} local={metroLocal} p3d={metro3d} onBoard={() => goTo("metro", 0.56)} media={scene.resolved} />}

        <JourneyIndex scenes={scenes} current={view.i} onGo={goTo} light={env === "fin"} />
      </div>
    </section>
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
  const photo = scene.id === "poklonnaia" ? undefined : scene.resolved[0];
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity duration-base lg:top-0 lg:right-auto lg:flex lg:w-[min(520px,44vw)] lg:flex-col lg:justify-center lg:px-10 lg:pt-24 lg:pb-10 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <p className="label text-fg-2">{scene.kicker}</p>
      <h2 className="enter mt-3 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95]">{scene.title}</h2>
      {scene.ru && (
        <p lang="ru" className="mt-2 font-display font-cond text-[clamp(1.05rem,2vw,1.5rem)] text-fg-2">
          {scene.ru}
        </p>
      )}
      <p className="mt-4 max-w-[46ch] text-[1.02rem] leading-relaxed text-fg lg:text-lead">{scene.text}</p>
      {photo && scene.environment === "monde" && (
        <figure className="mt-5 hidden max-w-[360px] items-start gap-3 lg:flex">
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
  const at = Math.min(line.stations.length - 1, Math.floor(rideT * (line.stations.length - 1) + 0.15));
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
