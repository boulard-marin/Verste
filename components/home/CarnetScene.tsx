import { WifiOff } from "lucide-react";

import { BilingualName } from "@/components/brand/BilingualName";
import { SceneMarker } from "@/components/brand/SceneMarker";
import { carnetContents, supportModel } from "@/data/carnet";

/** S09 · Le Carnet Verste — the product itself, and how support works when the network does not. */
export function CarnetScene() {
  return (
    <section id="carnet" data-surface="frost" aria-labelledby="carnet-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pb-[clamp(6rem,14vh,11rem)]">
        <div className="grid items-center gap-16 border-t border-line pt-[clamp(4rem,10vh,8rem)] md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7">
            <SceneMarker index={9} label="Le Carnet Verste" />
            <h2 id="carnet-title" className="mt-8 max-w-[18ch] font-display font-semicond text-h1 font-medium">
              Tout votre voyage, dans votre poche. Même sans réseau.
            </h2>
            <p className="mt-8 max-w-[52ch] text-lead text-fg-2">
              Après l&apos;achat, vous recevez le Carnet Verste : votre itinéraire et tout ce qu&apos;il faut pour le
              vivre, rangé jour par jour. Il est pensé pour un pays où la connexion peut tomber à tout moment.
            </p>
            <ul className="mt-10 grid gap-x-8 border-t border-line sm:grid-cols-2">
              {carnetContents.map((item) => (
                <li key={item} className="border-b border-line py-3 text-[0.98rem]">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <figure className="md:col-span-4 md:col-start-9">
            <div
              data-surface="snow"
              className="mx-auto w-full max-w-[min(18rem,80vw)] rounded-[2.4rem] border-[10px] border-ink bg-surface p-5 pt-6 text-fg shadow-[0_24px_60px_-28px_rgb(11_26_51/0.55)]"
            >
              <div className="flex items-center justify-between">
                <span className="label text-fg-2">Carnet Verste</span>
                <span className="label flex items-center gap-1.5 text-fg-2">
                  <WifiOff aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                  Hors ligne
                </span>
              </div>
              <p className="label mt-6 text-route">
                <span lang="ru">Верста 03</span> · Jour 6
              </p>
              <div className="mt-3">
                <BilingualName ru="Нижний Новгород" fr="Nijni Novgorod" size="compact" />
              </div>
              <dl className="mt-6 grid gap-4 border-t border-line pt-4 text-[0.85rem] leading-snug">
                <div>
                  <dt className="label text-fg-2">Matin</dt>
                  <dd>Train depuis Moscou, environ 4 h</dd>
                </div>
                <div>
                  <dt className="label text-fg-2">À montrer au chauffeur</dt>
                  <dd lang="ru" className="font-display text-[1.05rem]">
                    Нижне-Волжская набережная
                  </dd>
                </div>
                <div>
                  <dt className="label text-fg-2">Phrase du jour</dt>
                  <dd>
                    <span lang="ru" className="font-display text-[1.05rem]">
                      Где метро?
                    </span>{" "}
                    gdié mietro · où est le métro ?
                  </dd>
                </div>
              </dl>
              <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-fg/20" />
            </div>
            <figcaption className="label mt-5 text-center text-fg-2">Aperçu d&apos;une page · exemple</figcaption>
          </figure>
        </div>

        <div className="mt-20 md:mt-28">
          <h3 className="label text-fg-2">Comment nous restons joignables</h3>
          <ul className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {supportModel.map((step) => (
              <li key={step.id} className="bg-frost p-6">
                <p className="font-display text-h3">{step.title}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-2">{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
