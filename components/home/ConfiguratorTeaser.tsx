import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SceneMarker } from "@/components/brand/SceneMarker";
import { Track } from "@/components/ui/Track";

const durations = [
  { days: 7, line: "L'essentiel : Moscou et Saint-Pétersbourg.", stops: 2 },
  { days: 14, line: "Le temps de sortir des capitales.", stops: 4 },
  { days: 21, line: "Le pays commence à se révéler.", stops: 5 },
  { days: 28, line: "Le grand voyage, dans la limite des 30 jours de l'eVisa.", stops: 6 },
];

/** S08 · Votre Russie — the configurator's first question, answerable right here. */
export function ConfiguratorTeaser() {
  return (
    <section id="votre-russie" data-surface="frost" aria-labelledby="votre-russie-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] py-[clamp(6rem,14vh,11rem)]">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <SceneMarker index={8} label="Votre Russie" />
            <h2 id="votre-russie-title" className="mt-8 max-w-[16ch] font-display font-semicond text-h1 font-medium">
              Combien de temps vous donnez-vous&#8239;?
            </h2>
          </div>
          <p className="max-w-[40ch] self-end text-lead text-fg-2 md:col-span-4 md:col-start-9">
            Quatre questions, deux minutes, sans engagement. Vous obtenez un premier profil de voyage : villes, rythme,
            expériences, budget indicatif.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
          {durations.map(({ days, line, stops }) => (
            <li key={days}>
              <Track event="configurator_started" props={{ duree: days, from: "accueil" }}>
                <Link
                  href={`/configurateur?duree=${days}`}
                  className="group flex h-full min-h-[11rem] sm:min-h-[15rem] flex-col border border-line bg-snow/70 p-6 transition-[border-color,background-color] duration-base ease-verste hover:border-route hover:bg-snow"
                >
                  <span className="flex items-baseline gap-2">
                    <span className="font-display font-cond text-[4.5rem] leading-none font-medium tabular">{days}</span>
                    <span className="label text-fg-2">jours</span>
                  </span>
                  <span className="mt-4 text-[1rem] leading-snug">{line}</span>

                  <span aria-hidden="true" className="mt-auto flex items-center pt-8">
                    <span className="relative flex h-px flex-1 items-center bg-route">
                      {Array.from({ length: stops }, (_, i) => (
                        <span
                          key={i}
                          className="absolute h-3 w-[4px] -translate-x-1/2 border border-fg bg-snow"
                          style={{ left: `${(i / (stops - 1)) * 100}%` }}
                        />
                      ))}
                    </span>
                    <ArrowRight
                      className="ml-4 size-4 text-fg-2 transition-transform duration-base ease-verste group-hover:translate-x-1 group-hover:text-route"
                      strokeWidth={1.5}
                    />
                  </span>
                  <span className="sr-only">, commencer avec {days} jours</span>
                </Link>
              </Track>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
