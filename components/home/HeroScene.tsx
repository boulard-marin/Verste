import { ArrowDown } from "lucide-react";
import type { CSSProperties } from "react";

import { MorphWord } from "@/components/brand/MorphWord";
import { PhotoBadge } from "@/components/brand/PhotoBadge";
import { MoscowLights } from "@/components/media/MoscowLights";
import { ButtonLink } from "@/components/ui/Button";
import { Track } from "@/components/ui/Track";
import { heroMedia } from "@/data/media";
import { ctas, site } from "@/data/site";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** S01 · Ouverture — Acte I, nuit. */
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
        <p className="label enter text-fg-2" style={delay(200)}>
          <span lang="ru">Верста</span> · 1&#8239;067&nbsp;m · l&apos;ancienne mesure des routes russes
        </p>

        <h1
          id="hero-title"
          aria-label={`${site.name}, ${site.descriptor.charAt(0).toLowerCase()}${site.descriptor.slice(1)}`}
          className="mt-5 -ml-[0.04em] font-display font-cond text-[clamp(5rem,24vw,15.5rem)] leading-[0.82] font-medium tracking-[0.06em]"
        >
          <MorphWord ru="ВЕРСТА" fr="VERSTE" />
        </h1>

        <p className="enter mt-6 font-display-italic text-quote italic md:mt-8" style={delay(1500)}>
          {site.heroLines.map((part) => (
            <span key={part} className="block">
              {part}
            </span>
          ))}
        </p>

        <div className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" style={delay(1800)}>
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

      {/* The verste line starts here and leads into the route scene */}
      <div aria-hidden="true" className="gutter pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1440px]">
        <div className="line-grow h-[9vh] w-px bg-route" />
      </div>

      <PhotoBadge
        kind={heroMedia.kind}
        caption={heroMedia.caption}
        className="absolute right-4 bottom-5 hidden max-w-[34rem] md:right-6 md:flex xl:right-12"
      />
    </section>
  );
}
