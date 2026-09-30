import { ArrowDown } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { MorphWord } from "@/components/brand/MorphWord";
import { PhotoBadge } from "@/components/brand/PhotoBadge";
import { MoscowLights } from "@/components/media/MoscowLights";
import { ButtonLink } from "@/components/ui/Button";
import { Track } from "@/components/ui/Track";
import { heroMedia } from "@/data/media";
import { ctas, site } from "@/data/site";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** Three verbs, three doors: the journey, the map, the configurator. */
const doors = [
  { verb: "Entrez", href: ctas.explore.href },
  { verb: "Explorez", href: "/carte" },
  { verb: "Construisez votre Russie", href: ctas.build.href },
];

/**
 * S01 · Ouverture. The hierarchy of the first screen, in this order:
 * 1. VERSTE  2. la Russie  3. l'expérience  4. l'action.
 */
export function HeroScene() {
  return (
    <section
      id="ouverture"
      data-surface="night"
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-surface"
    >
      {/* Media layer. Swapped for a VERSTE video when available (data/media.ts). */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <MoscowLights className="lights-drift absolute inset-0 size-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-night)_0%,transparent_28%,transparent_62%,var(--color-night)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-night)_0%,rgb(12_15_20/0.55)_38%,transparent_62%)] max-md:bg-[linear-gradient(to_bottom,transparent_45%,rgb(12_15_20/0.5)_70%,var(--color-night)_100%)]" />
      </div>

      <div className="gutter mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end pt-28 pb-[max(4.5rem,11vh)]">
        {/* 1 · VERSTE */}
        <h1
          id="hero-title"
          aria-label={`${site.name}, Russia Travel : ${site.descriptor.charAt(0).toLowerCase()}${site.descriptor.slice(1)}`}
          className="-ml-[0.04em] font-display font-cond text-[clamp(5.2rem,25vw,16rem)] leading-[0.8] font-extrabold tracking-[0.05em]"
        >
          <MorphWord ru="ВЕРСТА" fr="VERSTE" />
        </h1>
        <p aria-hidden="true" className="enter mt-5 flex items-center gap-4 md:mt-7" style={delay(350)}>
          <span className="h-[3px] w-12 bg-route md:w-16" />
          <span className="font-mono text-[clamp(0.78rem,1.3vw,1.05rem)] font-medium tracking-[0.42em] text-fg uppercase">Russia Travel</span>
        </p>

        {/* 2 · La Russie */}
        <p className="enter mt-8 max-w-[20ch] font-display-italic text-quote italic md:mt-10" style={delay(600)}>
          {site.manifestoTitle}
        </p>

        {/* 3 · L'expérience */}
        <p className="enter mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2" style={delay(750)}>
          {doors.map((d, i) => (
            <Link
              key={d.verb}
              href={d.href}
              className="label text-fg-2 underline decoration-transparent underline-offset-[6px] transition-colors duration-fast hover:text-fg hover:decoration-route"
            >
              <span className="mr-2 text-fg/40">{String(i + 1).padStart(2, "0")}</span>
              {d.verb}
            </Link>
          ))}
        </p>

        {/* 4 · L'action */}
        <div className="enter mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" style={delay(900)}>
          <Track event="hero_cta_click" props={{ cta: "build", from: "hero" }}>
            <ButtonLink href={ctas.build.href}>{ctas.build.label}</ButtonLink>
          </Track>
          <Track event="hero_cta_click" props={{ cta: "explore", from: "hero" }}>
            <ButtonLink href={ctas.explore.href} variant="secondary">
              {ctas.explore.label}
              <ArrowDown aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </ButtonLink>
          </Track>
        </div>
      </div>

      {/* The verste line starts here and leads into the journey */}
      <div aria-hidden="true" className="gutter pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1440px]">
        <div className="line-grow h-[9vh] w-px bg-route" />
      </div>

      <PhotoBadge
        kind={heroMedia.kind}
        caption={heroMedia.caption}
        className="absolute top-20 right-4 left-4 max-w-[34rem] md:top-auto md:right-6 md:bottom-5 md:left-auto xl:right-12"
      />
    </section>
  );
}
