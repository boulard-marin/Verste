import { VerstPost } from "@/components/brand/VerstPost";
import { Wordmark } from "@/components/brand/Wordmark";
import { site } from "@/data/site";

const seenOn = ["Sur Instagram.", "Dans les films.", "Dans les livres.", "À la télévision."];

/** S03 · Manifeste — Acte II, minuit. Reveals are CSS scroll-driven (progressive enhancement). */
export function ManifestoScene() {
  return (
    <section id="manifeste" data-surface="midnight" aria-labelledby="manifeste-title" className="bg-surface text-fg">
      <div className="gutter mx-auto grid max-w-[1440px] gap-y-14 py-[clamp(6rem,16vh,12rem)] md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-3">
          <div className="flex items-center gap-4 md:sticky md:top-32">
            <VerstPost />
            <p className="label text-fg-2">
              <span lang="ru" className="text-route">
                Верста 02
              </span>{" "}
              · Manifeste
            </p>
          </div>
        </div>

        <div className="md:col-span-9 lg:col-span-8">
          <h2 id="manifeste-title" className="font-display font-semicond text-h1 font-medium">
            {site.manifestoTitle}
          </h2>

          <p className="mt-14 font-display text-h3 md:mt-20">Vous avez peut-être déjà vu Moscou.</p>
          <ul className="mt-5 grid gap-1">
            {seenOn.map((line) => (
              <li key={line} className="scroll-reveal font-display-italic text-h2 text-fg-2 italic">
                {line}
              </li>
            ))}
          </ul>

          <p className="scroll-reveal mt-14 max-w-[18ch] font-display text-h1 md:mt-20">
            Mais voir un pays n&apos;est pas encore le découvrir.
          </p>

          <div className="mt-14 grid max-w-[62ch] gap-6 text-lead text-fg-2 md:mt-20">
            <p>
              La Russie se découvre dans un wagon de nuit, un verre de thé serré dans son porte-gobelet en métal. Dans
              une station de métro à sept heures du matin, au milieu de ceux qui partent travailler. Dans une cuisine où
              l&apos;on vous ressert sans vous demander votre avis.
            </p>
            <p>
              C&apos;est un pays immense et contradictoire, souvent mal raconté. On le croit connu par les nouvelles ;
              on le connaît rarement par ses rues. Il faut aussi le regarder tel qu&apos;il est aujourd&apos;hui, avec
              ses règles, ses contraintes et un contexte que nous exposons sans détour.
            </p>
            <p className="text-fg">
              Verste est né de cette distance, entre ce que l&apos;on voit d&apos;un pays et ce que l&apos;on y vit.
              Nous préparons votre voyage pour que vous puissiez la parcourir par vous-même, les yeux ouverts.
            </p>
          </div>

          <p className="mt-14 text-[1.4rem] text-fg md:mt-20">
            <Wordmark />
          </p>
        </div>
      </div>
    </section>
  );
}
