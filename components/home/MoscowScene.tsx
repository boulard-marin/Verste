import { BilingualName } from "@/components/brand/BilingualName";
import { SceneMarker } from "@/components/brand/SceneMarker";
import { MetroMotif } from "@/components/destinations/MetroMotif";
import { Pending, showPending } from "@/components/ui/Pending";
import { moscow } from "@/data/cities";
import { formatCoords } from "@/lib/format";

/**
 * S04 · Moscou — the city where the journey starts. The metro motif stands in
 * for a VERSTE photograph until one exists; the facts sit in a data strip
 * below, never over the drawing.
 */
export function MoscowScene() {
  const facts = moscow.facts.filter((fact) => fact.value !== null || showPending);
  return (
    <section
      id="moscou"
      data-surface="midnight"
      aria-labelledby="moscou-title"
      className="relative overflow-hidden bg-[linear-gradient(to_bottom,var(--color-midnight)_0%,var(--color-midnight)_30%,var(--color-russian)_100%)] text-fg"
    >
      <div className="gutter mx-auto max-w-[1440px] py-[clamp(6rem,16vh,12rem)]">
        <div className="grid items-center gap-y-12 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-7">
            <SceneMarker index={3} label="La première ville" />
            <h2 id="moscou-title" className="mt-10">
              <BilingualName ru={moscow.ru} fr={moscow.fr} size="display" as="span" />
            </h2>
            <p className="label mt-4 text-fg-2">{formatCoords(moscow.coords)} · kilomètre zéro</p>
            <p className="mt-10 max-w-[18ch] font-display-italic text-h2 italic">{moscow.tagline}</p>
            <p className="mt-8 max-w-[52ch] text-lead text-fg-2">{moscow.intro}</p>
          </div>
          <div className="relative md:col-span-5">
            <MetroMotif className="mx-auto w-full max-w-[32rem] text-fg-2" />
          </div>
        </div>

        <dl className="mt-16 grid border-t border-line sm:grid-cols-2 md:mt-24 lg:grid-cols-5">
          {facts.map((fact) => (
            <div key={fact.label} className="grid content-start gap-2 border-b border-line py-5 pr-6 lg:border-b-0 lg:py-6">
              <dt className="label text-fg-2">{fact.label}</dt>
              <dd className="text-[0.98rem] leading-snug text-fg">
                {fact.value ?? <Pending>vos fourchettes de terrain</Pending>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
