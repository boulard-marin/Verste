import { ArrowUpRight } from "lucide-react";

import { SceneMarker } from "@/components/brand/SceneMarker";
import { SourceTag } from "@/components/brand/SourceTag";
import { officialAdvice } from "@/data/site";
import { russiaToday } from "@/data/russia-today";
import { formatDate } from "@/lib/format";

/**
 * S07 · Russie aujourd'hui. Transparency: the official position, what is
 * observed on the ground and what we conclude, each labelled and dated.
 * No dramatisation, no minimisation.
 */
export function TodayScene() {
  return (
    <section
      id="russie-aujourdhui"
      data-surface="midnight"
      aria-labelledby="aujourdhui-title"
      className="bg-surface text-fg"
    >
      <div className="gutter mx-auto max-w-[1440px] py-[clamp(6rem,16vh,12rem)]">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <SceneMarker index={7} label="Russie aujourd'hui" />
            <h2 id="aujourdhui-title" className="mt-8 font-display font-semicond text-h1 font-medium">
              Le contexte, sans détour.
            </h2>
          </div>
          <div className="grid content-end gap-6 md:col-span-5 md:col-start-8">
            <p className="text-lead text-fg-2">
              Voyager en Russie en 2026 n&apos;a rien d&apos;anodin. Voici ce que disent les autorités, ce que l&apos;on
              constate sur place et ce que nous en concluons.
            </p>
            <ul aria-label="Types d'information" className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <SourceTag kind="officiel" />
              </li>
              <li>
                <SourceTag kind="terrain" />
              </li>
              <li>
                <SourceTag kind="conseil" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border border-line md:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-night/60 px-5 py-3 md:px-8">
            <p className="label text-fg-2">Tableau de bord · Russie</p>
            <p className="label text-fg">Vérifié le {formatDate(russiaToday.checkedAt)}</p>
          </div>
          <dl>
            {russiaToday.topics.map((topic) => (
              <div
                key={topic.id}
                className="grid gap-4 border-b border-line px-5 py-7 last:border-b-0 md:grid-cols-12 md:gap-6 md:px-8"
              >
                <dt className="label pt-1 text-fg md:col-span-3">{topic.topic}</dt>
                <dd className="grid gap-5 md:col-span-9">
                  {topic.items.map((item) => (
                    <div key={item.text} className="grid gap-2 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
                      <SourceTag kind={item.kind} className="pt-1" />
                      <div>
                        <p className={`text-[1rem] leading-relaxed ${item.kind === "conseil" ? "text-fg-2" : "text-fg"}`}>
                          {item.text}
                        </p>
                        {item.source && (
                          <a
                            href={item.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label mt-2 inline-flex items-center gap-1 text-fg-2 underline decoration-fg-2/40 underline-offset-4 hover:text-fg"
                          >
                            {item.source.label}
                            <ArrowUpRight aria-hidden="true" className="size-3" />
                            <span className="sr-only">(nouvel onglet)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-8 max-w-[70ch] text-[0.9rem] text-fg-2">
          Ces informations ne remplacent pas les sources officielles. Avant toute décision, lisez la{" "}
          <a
            href={officialAdvice.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg underline decoration-fg/40 underline-offset-4 hover:decoration-route"
          >
            fiche {officialAdvice.source}
          </a>{" "}
          et vérifiez les conditions d&apos;entrée auprès des autorités compétentes.
        </p>
      </div>
    </section>
  );
}
