import { PhotoBadge } from "@/components/brand/PhotoBadge";
import { SceneMarker } from "@/components/brand/SceneMarker";
import { Pending, showPending } from "@/components/ui/Pending";
import { founder } from "@/data/founder";

/**
 * S11 · Qui se cache derrière Verste ? Answers "why should I trust this
 * person?" with verifiable facts only. Hidden in production until the founder
 * has provided the content (data/founder.ts).
 */
export function FounderScene() {
  if (!founder.ready && !showPending) return null;
  const facts = founder.facts.filter((fact) => fact.value !== null || showPending);

  return (
    <section id="fondateur" data-surface="snow" aria-labelledby="fondateur-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pb-[clamp(6rem,14vh,11rem)]">
        <div className="grid gap-12 border-t border-line pt-[clamp(4rem,10vh,8rem)] md:grid-cols-12 md:gap-6">
          <figure className="md:col-span-4">
            {founder.portrait?.src ? (
              // eslint-disable-next-line @next/next/no-img-element -- replaced by next/image once the portrait exists
              <img src={founder.portrait.src} alt={founder.portrait.alt} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center border border-dashed border-fg/30 p-6">
                <Pending>portrait (Photographie VERSTE)</Pending>
              </div>
            )}
            {founder.portrait && <PhotoBadge kind={founder.portrait.kind} caption={founder.portrait.caption} className="mt-3" />}
          </figure>

          <div className="md:col-span-7 md:col-start-6">
            <SceneMarker index={11} label="Le fondateur" />
            <h2 id="fondateur-title" className="mt-8 font-display font-semicond text-h1 font-medium">
              Qui se cache derrière Verste&#8239;?
            </h2>
            <p className="mt-6 text-lead text-fg-2">Des faits vérifiables, pas des promesses.</p>
            <div className="mt-8 max-w-[58ch] text-[1.05rem] leading-relaxed">
              {founder.story ?? <Pending>votre histoire, en quelques paragraphes</Pending>}
            </div>
            <dl className="mt-10 grid border-t border-line">
              {facts.map((fact) => (
                <div key={fact.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="label pt-1 text-fg-2">{fact.label}</dt>
                  <dd>{fact.value ?? <Pending>à fournir</Pending>}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
