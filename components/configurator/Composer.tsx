"use client";

import { ArrowRight } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { compose, type Composition } from "@/lib/configurator/compose";
import { COMFORTS, DURATIONS, INTERESTS, RUSSIAN_LEVELS, type Comfort, type Duration, type InterestId, type RussianLevel } from "@/lib/configurator/engine";
import type { Partial4 } from "@/lib/configurator/params";
import { formatKm } from "@/lib/format";
import type { ComposerAtlas } from "@/lib/geo";

/**
 * THE CONFIGURATOR. Not a form, a trip composing itself: pick a length and
 * a few interests, and the map lays out the cities, draws the line, offers
 * the other branch, sizes the days and lines up what each day holds. Still a
 * real GET form underneath: without JavaScript, it submits all the same.
 */
export function Composer({ atlas, initial }: { atlas: ComposerAtlas; initial: Partial4 }) {
  const [days, setDays] = useState<Duration>(initial.days ?? 14);
  const [interests, setInterests] = useState<InterestId[]>(initial.interests.length ? initial.interests : ["culture"]);
  const [russian, setRussian] = useState<RussianLevel>(initial.russian ?? "quelques-mots");
  const [comfort, setComfort] = useState<Comfort>(initial.comfort ?? "confort");
  const c = useMemo(() => compose({ days, interests, russian, comfort }), [days, interests, russian, comfort]);

  const toggle = (id: InterestId) => setInterests((list) => (list.includes(id) ? (list.length > 1 ? list.filter((x) => x !== id) : list) : [...list, id]));

  return (
    <form action="/configurateur/resultat" method="get" className="grid gap-10 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,7.5fr)] lg:gap-14">
      {/* The choices */}
      <div className="lg:pt-4">
        <fieldset>
          <legend className="label text-fg-2">Durée sur place</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <label key={d} className="group cursor-pointer">
                <input type="radio" name="duree" value={d} checked={days === d} onChange={() => setDays(d)} className="peer sr-only" />
                <span className="flex flex-col items-center rounded-[4px] border border-line py-3 transition-colors peer-checked:border-fg peer-checked:bg-fg peer-checked:text-surface peer-focus-visible:outline-2 peer-focus-visible:outline-route">
                  <span className="font-display text-[2rem] leading-none">{d}</span>
                  <span className="label mt-1 opacity-70">jours</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="label text-fg-2">Envies</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <label key={i.id} className="cursor-pointer">
                <input type="checkbox" name="profils" value={i.id} checked={interests.includes(i.id)} onChange={() => toggle(i.id)} className="peer sr-only" />
                <span className="inline-flex items-baseline gap-2 rounded-full border border-line px-4 py-2 transition-colors peer-checked:border-fg peer-checked:bg-fg peer-checked:text-surface peer-focus-visible:outline-2 peer-focus-visible:outline-route">
                  {i.label}
                  <span lang="ru" className="text-[0.78rem] opacity-60">
                    {i.ru}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <details className="group mt-8 border-t border-line pt-5">
          <summary className="label cursor-pointer list-none text-fg-2 hover:text-fg">
            Affiner · russe et confort <span className="ml-1 inline-block transition-transform group-open:rotate-90">›</span>
          </summary>
          <fieldset className="mt-4">
            <legend className="label text-fg-2">Votre russe</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {RUSSIAN_LEVELS.map((l) => (
                <label key={l.id} className="cursor-pointer">
                  <input type="radio" name="russe" value={l.id} checked={russian === l.id} onChange={() => setRussian(l.id)} className="peer sr-only" />
                  <span className="inline-flex rounded-full border border-line px-3 py-1.5 text-[0.85rem] peer-checked:border-fg peer-checked:bg-fg peer-checked:text-surface">{l.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="label text-fg-2">Confort</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMFORTS.map((x) => (
                <label key={x.id} className="cursor-pointer">
                  <input type="radio" name="confort" value={x.id} checked={comfort === x.id} onChange={() => setComfort(x.id)} className="peer sr-only" />
                  <span className="inline-flex rounded-full border border-line px-3 py-1.5 text-[0.85rem] peer-checked:border-fg peer-checked:bg-fg peer-checked:text-surface">{x.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </details>

        <button type="submit" className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xs bg-route px-6 font-medium text-on-route hover:brightness-110 sm:w-auto">
          Voir mon itinéraire, jour par jour
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </button>
        <p className="mt-4 text-[0.82rem] text-fg-2">Rien n&apos;est enregistré : vos choix restent dans l&apos;adresse de la page.</p>
      </div>

      {/* The trip composing itself */}
      <div aria-live="polite" className="self-start lg:sticky lg:top-24">
        <Atlas c={c} atlas={atlas} />
        <Bars c={c} />
        <Chain c={c} />
      </div>
    </form>
  );
}

/** Where each city's name goes, so close cities never overlap (Anneau d'or, Nizhny). */
const LABEL: Record<string, "right" | "left" | "above" | "below"> = {
  moscou: "left",
  "anneau-d-or": "above",
  "nijni-novgorod": "below",
  kazan: "right",
  "saint-petersbourg": "right",
  baikal: "left",
};

function labelAt(city: string, x: number, y: number) {
  const side = LABEL[city] ?? "right";
  if (side === "left") return { x: x - 16, y: y - 6, anchor: "end" as const };
  if (side === "above") return { x: x - 10, y: y - 40, anchor: "start" as const };
  if (side === "below") return { x: x + 14, y: y + 32, anchor: "start" as const };
  return { x: x + 16, y: y - 6, anchor: "start" as const };
}

function Atlas({ c, atlas }: { c: Composition; atlas: ComposerAtlas }) {
  const reduced = useReducedMotion();
  const pts = c.stops.map((s) => ({ ...s, ...(atlas.cities[s.city] ?? atlas.beyond[s.city] ?? { x: 0, y: 0 }) }));
  const branchFrom = c.branch ? atlas.cities[c.branch.from] : undefined;
  const branchTo = c.branch ? atlas.cities[c.branch.city] : undefined;
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    return `M${a.x} ${a.y} Q${mx - dy * 0.18} ${my + dx * 0.18} ${b.x} ${b.y}`;
  };
  const step = reduced ? 0 : 0.28;
  return (
    <figure>
      <svg viewBox={`0 0 ${atlas.width} ${atlas.height}`} role="img" aria-label={`Itinéraire : ${c.stops.map((s) => `${s.fr}, ${s.days} jours`).join(" ; ")}`} className="w-full">
        <path d={atlas.land} className="fill-fg/[0.04]" />
        <path d={atlas.russia} className="fill-fg/[0.07] stroke-fg/20" strokeWidth={0.8} />
        {/* The line, city after city */}
        {pts.slice(1).map((b, i) => (
          <m.path
            key={`${c.key}-${i}`}
            d={curve(pts[i]!, b)}
            fill="none"
            style={{ stroke: "var(--route)" }}
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: (i + 1) * step, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        {/* The other branch */}
        {c.branch && branchFrom && branchTo && (
          <m.g key={`${c.key}-branch`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (pts.length + 0.5) * step, duration: reduced ? 0 : 0.5 }}>
            <path d={curve(branchFrom, branchTo)} fill="none" className="stroke-fg/60" strokeWidth={1.6} strokeDasharray="3 7" strokeLinecap="round" />
            <circle cx={branchTo.x} cy={branchTo.y} r={7} className="fill-surface stroke-fg/60" strokeWidth={1.6} strokeDasharray="2 3" />
            {(() => {
              const l = labelAt(c.branch.city, branchTo.x, branchTo.y);
              return (
                <>
                  <text x={l.x} y={l.y} textAnchor={l.anchor} className="fill-fg-2 font-display" style={{ fontSize: 26, fontStretch: "78%" }}>
                    {c.branch.fr} ?
                  </text>
                  <text x={l.x} y={l.y + 22} textAnchor={l.anchor} className="fill-fg-2 font-mono" style={{ fontSize: 13, letterSpacing: "0.1em" }}>
                    AUTRE BRANCHE
                  </text>
                </>
              );
            })()}
          </m.g>
        )}
        {/* The cities */}
        {pts.map((p, i) => {
          const far = atlas.beyond[p.city];
          const l = labelAt(p.city, p.x, p.y);
          return (
            <m.g key={`${c.key}-${p.city}`} initial={{ opacity: 0, scale: reduced ? 1 : 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * step, duration: reduced ? 0 : 0.45 }} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
              <circle cx={p.x} cy={p.y} r={p.lived ? 9 : 8} className={p.lived ? "fill-fg" : "fill-surface stroke-fg"} strokeWidth={2.4} />
              <text x={l.x} y={l.y} textAnchor={l.anchor} className="fill-fg font-display" style={{ fontSize: 30, fontWeight: 700, fontStretch: "62.5%", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {p.fr}
              </text>
              <text x={l.x} y={l.y + 22} textAnchor={l.anchor} className="fill-fg-2 font-mono" style={{ fontSize: 14, letterSpacing: "0.12em" }}>
                {p.days} JOURS{far ? ` · ${formatKm(far.km)} DE MOSCOU` : ""}
              </text>
            </m.g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-fg-2">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-fg" /> Vécu sur le terrain
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full border-2 border-fg" /> Préparé sur sources
        </span>
        <span>
          {c.rhythm.label} · {c.logistics.label}
        </span>
      </figcaption>
    </figure>
  );
}

function Bars({ c }: { c: Composition }) {
  const reduced = useReducedMotion();
  const max = Math.max(...c.stops.map((s) => s.days));
  return (
    <ul className="mt-8 grid gap-2.5">
      {c.stops.map((s, i) => (
        <li key={s.city} className="grid grid-cols-[minmax(7rem,9.5rem)_1fr_2.8rem] items-center gap-3">
          <span className="font-display font-cond text-[1.15rem] leading-none font-bold tracking-[0.04em] uppercase">{s.fr}</span>
          <span className="h-3 overflow-hidden rounded-[2px] bg-fg/[0.07]">
            <m.span
              className={`block h-full ${s.lived ? "bg-fg" : "bg-fg/45"}`}
              initial={false}
              animate={{ width: `${(s.days / max) * 100}%` }}
              transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className="font-mono text-[0.9rem] tabular text-fg-2">{s.days} j</span>
        </li>
      ))}
    </ul>
  );
}

function Chain({ c }: { c: Composition }) {
  const reduced = useReducedMotion();
  const cityName = (id: string) => c.stops.find((s) => s.city === id)?.fr ?? id;
  return (
    <ol className="mt-8 grid gap-0 border-l border-line pl-5">
      {c.chain.map((d, i) => (
        <m.li
          key={`${c.key}-${d.index}`}
          initial={{ opacity: 0, x: reduced ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.4 + i * 0.05, duration: reduced ? 0 : 0.35 }}
          className="relative py-1.5"
        >
          <span aria-hidden="true" className={`absolute top-3 -left-[25px] size-2 rounded-full ${d.kind === "a-construire" ? "border border-dashed border-fg-2 bg-surface" : "bg-fg"}`} />
          <span className="label mr-3 text-fg-2">J{d.index}</span>
          <span className="font-mono text-[0.72rem] tracking-[0.12em] text-fg-2 uppercase">{cityName(d.city)}</span>
          <span className="ml-3 text-[0.95rem] text-fg">
            {d.keys.length > 0 ? d.keys.join(" · ") : d.title}
          </span>
        </m.li>
      ))}
    </ol>
  );
}
