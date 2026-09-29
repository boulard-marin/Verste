import { Check } from "lucide-react";

import { SceneMarker } from "@/components/brand/SceneMarker";
import { weDo, youKeep } from "@/data/logistics";
import { site } from "@/data/site";

/**
 * S06 bis · Nous préparons. Vous voyagez. The value proposition and, in the
 * same breath, the legal line: Verste prepares, the traveller books.
 */
export function PositioningScene() {
  return (
    <section id="positionnement" data-surface="russian" aria-labelledby="positionnement-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pb-[clamp(6rem,16vh,12rem)]">
        <div className="border-t border-line pt-[clamp(4rem,10vh,8rem)]">
          <SceneMarker index={6} label="Notre rôle" />
          <h2 id="positionnement-title" className="mt-10 font-display font-cond text-display-l font-medium uppercase">
            <span className="block">Nous préparons.</span>
            <span className="block text-fg-2">Vous voyagez.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-2 md:gap-6">
          <div>
            <h3 className="label text-fg-2">Ce que nous faisons</h3>
            <ul className="mt-6 grid border-t border-line">
              {weDo.map((item) => (
                <li key={item} className="flex gap-4 border-b border-line py-4 text-[1.02rem]">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-fg" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label text-fg-2">Ce que vous gardez en main</h3>
            <ul className="mt-6 grid border-t border-line">
              {youKeep.map((item) => (
                <li key={item} className="flex gap-4 border-b border-line py-4 text-[1.02rem]">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-fg-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 max-w-[62ch] border-l-2 border-route pl-6 md:mt-20">
          <p className="font-display text-h3">{site.legalPromise}</p>
          <p className="mt-3 text-[0.95rem] text-fg-2">
            Verste est un service de préparation de voyage et de conseil. Ce n&apos;est pas une agence de voyages : nous
            ne vendons pas de forfait et n&apos;encaissons aucun paiement destiné à un prestataire.
          </p>
        </div>
      </div>
    </section>
  );
}
