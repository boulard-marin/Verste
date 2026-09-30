import type { Metadata } from "next";

import { VerstPostMark, Wordmark } from "@/components/brand/Wordmark";

export const metadata: Metadata = {
  title: "Marque · le logo VERSTE",
  robots: { index: false, follow: false },
};

const pistes = [
  { id: "A", name: "Typographie seule", text: "Le mot seul, extra-gras et serré. Lisible partout, mais sans signe propre.", node: <Wordmark post={false} /> },
  { id: "B", name: "Mot + signature", text: "La ligne rouge et RUSSIA TRAVEL sous le mot : le lieu et le mouvement.", node: <Wordmark post={false} tagline /> },
  { id: "C", name: "Borne + mot", text: "Le poteau verste des routes russes, coiffé de rouge. Un symbole qui tient seul (icône, favicon).", node: <Wordmark /> },
  { id: "D", name: "Borne + coordonnées", text: "Le kilomètre zéro de Moscou sous le mot. Pour la vidéo et les grands formats.", node: <Wordmark coords /> },
];

/** Internal brand sheet: the four explored directions and the chosen lockup. Not indexed. */
export default function MarquePage() {
  return (
    <div className="pt-16 md:pt-20">
      <section data-surface="night" className="gutter bg-surface py-16 text-fg md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <p className="label text-fg-2">Marque · V3 · 30/09/2026</p>
          <h1 className="mt-4 font-display text-h1">Le logo VERSTE : « La borne », V3</h1>
          <p className="mt-6 max-w-[60ch] text-lead text-fg-2">
            Plus visible : le mot passe en extra-gras, serré, et gagne en taille dans la navigation. La borne garde le seul rouge du logo. Le verrouillage complet ajoute la ligne rouge et la signature RUSSIA TRAVEL. Le lieu, le mouvement, la Russie ; pas une agence de voyages.
          </p>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <div className="grid min-h-[260px] place-items-center rounded-[6px] border border-line p-10">
              <span className="text-[clamp(3rem,7vw,5.5rem)]">
                <Wordmark tagline animate />
              </span>
            </div>
            <div data-surface="snow" className="grid min-h-[260px] place-items-center rounded-[6px] bg-surface p-10 text-fg">
              <span className="text-[clamp(3rem,7vw,5.5rem)]">
                <Wordmark tagline />
              </span>
            </div>
          </div>
        </div>
      </section>

      {(["night", "snow"] as const).map((surface) => (
        <section key={surface} data-surface={surface} className="gutter bg-surface py-16 text-fg md:py-20">
          <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-2 xl:grid-cols-4">
            {pistes.map((p) => (
              <article key={p.id} className="rounded-[6px] border border-line p-6">
                <p className="label text-fg-2">
                  Piste {p.id} · {p.name}
                </p>
                <div className="grid min-h-[140px] place-items-center text-[2.4rem]">{p.node}</div>
                <p className="text-[0.9rem] text-fg-2">{p.text}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section data-surface="midnight" className="gutter bg-surface py-16 text-fg">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end gap-12">
          {[16, 24, 32, 64].map((px) => (
            <div key={px} className="flex flex-col items-center gap-3">
              <span style={{ height: px, width: px * 0.35 }} className="inline-flex text-fg">
                <VerstPostMark className="h-full w-full" />
              </span>
              <span className="label text-fg-2">{px} px</span>
            </div>
          ))}
          <p className="max-w-[40ch] text-fg-2">La borne seule : favicon, avatar, repère de chargement. Le chapeau rouge reste visible jusqu&apos;à 16 px.</p>
        </div>
      </section>
    </div>
  );
}
