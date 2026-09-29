import { SceneMarker } from "@/components/brand/SceneMarker";
import { VerstPost } from "@/components/brand/VerstPost";
import { Wordmark } from "@/components/brand/Wordmark";
import { frictions } from "@/data/logistics";
import { site } from "@/data/site";
import { formatDate } from "@/lib/format";

/**
 * S06 · Ce qui arrête la plupart des gens. The complexity is introduced one
 * question at a time along the verste line, without dramatising it.
 */
export function ProblemScene() {
  return (
    <section id="probleme" data-surface="russian" aria-labelledby="probleme-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] py-[clamp(6rem,16vh,12rem)]">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <SceneMarker index={5} label="Ce qui arrête la plupart des gens" />
            <h2 id="probleme-title" className="mt-8 max-w-[16ch] font-display font-semicond text-h1 font-medium">
              Le pays n&apos;est pas si compliqué. Y entrer, si.
            </h2>
          </div>
        </div>

        <ol className="relative mt-16 md:mt-24">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[3px] w-[2px] bg-route/70 md:left-[4px]" />
          {frictions.map((friction) => (
            <li
              key={friction.id}
              className="scroll-reveal relative grid gap-3 border-b border-line py-8 pl-10 md:grid-cols-12 md:gap-6 md:py-10 md:pl-16"
            >
              <span aria-hidden="true" className="absolute top-9 left-0 md:top-11">
                <VerstPost size="sm" />
              </span>
              <p className="label text-fg-2 md:col-span-3 md:pt-3 lg:col-span-2">{friction.keyword}</p>
              <p className="font-display text-h2 md:col-span-5 md:text-h3 lg:col-span-5 lg:text-h2">{friction.question}</p>
              <p className="max-w-[46ch] text-[1.02rem] leading-relaxed text-fg-2 md:col-span-4 md:pt-2 lg:col-span-5">
                {friction.detail}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-col gap-6 md:mt-24 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[20ch] font-display-italic text-h1 italic">
            C&apos;est précisément là que{" "}
            <span className="not-italic">
              <Wordmark post={false} />
            </span>{" "}
            intervient.
          </p>
          <p className="label text-fg-2">Informations vérifiées le {formatDate(site.verifiedAt)}</p>
        </div>
      </div>
    </section>
  );
}
