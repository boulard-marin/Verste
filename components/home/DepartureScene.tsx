import { ArrowRight } from "lucide-react";

import { VerstPost } from "@/components/brand/VerstPost";
import { ButtonLink } from "@/components/ui/Button";
import { Track } from "@/components/ui/Track";
import { ctas, site } from "@/data/site";

/** S13 · Le départ — Acte V, the brightest point of the page. The verste line comes back one last time. */
export function DepartureScene() {
  return (
    <section id="depart" data-surface="snow" aria-labelledby="depart-title" className="overflow-hidden bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pt-8 pb-[clamp(6rem,16vh,12rem)]">
        <div aria-hidden="true" className="relative flex items-center">
          <span className="h-[2px] flex-1 bg-route" />
          <VerstPost size="lg" className="ml-[-2px]" />
        </div>

        <p className="label mt-12 text-fg-2">55°45′20″ N · 37°37′04″ E · Kilomètre zéro</p>
        <h2
          id="depart-title"
          className="mt-6 max-w-[14ch] font-display font-semicond text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.98] font-medium"
        >
          {site.signature}
        </h2>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Track event="hero_cta_click" props={{ cta: "build", from: "depart" }}>
            <ButtonLink href={ctas.build.href}>
              Construire mon voyage en Russie
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
            </ButtonLink>
          </Track>
          <ButtonLink href="/#premiere-verste" variant="secondary">
            Recevoir La Première Verste
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
