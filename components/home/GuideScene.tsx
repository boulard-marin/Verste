import { SceneMarker } from "@/components/brand/SceneMarker";
import { LeadForm } from "@/components/forms/LeadForm";
import { guideGroups } from "@/data/carnet";

/** S12 · La Première Verste — the free guide, the first step for those not ready to buy. */
export function GuideScene() {
  const total = guideGroups.reduce((sum, group) => sum + group.count, 0);
  return (
    <section id="premiere-verste" data-surface="snow" aria-labelledby="guide-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pb-[clamp(6rem,14vh,11rem)]">
        <div className="grid gap-14 border-t border-line pt-[clamp(4rem,10vh,8rem)] md:grid-cols-12 md:gap-6">
          <div className="md:col-span-6">
            <SceneMarker index={12} label="Gratuit" />
            <h2 id="guide-title" className="mt-8 font-display font-cond text-display-l font-medium uppercase">
              La Première Verste
            </h2>
            <p className="mt-6 font-display-italic text-h3 italic">
              Les {total} choses à savoir avant de partir en Russie.
            </p>
            <p className="mt-6 max-w-[48ch] text-lead text-fg-2">
              Le guide qu&apos;on aimerait avoir lu avant son premier voyage. Gratuit, daté, mis à jour quand les règles
              changent.
            </p>
            <ul className="mt-10 grid border-t border-line">
              {guideGroups.map((group) => (
                <li key={group.title} className="flex items-baseline justify-between border-b border-line py-3">
                  <span className="text-[0.98rem]">{group.title}</span>
                  <span className="label text-fg-2 tabular">{group.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5 md:col-start-8 md:self-end">
            <div className="border border-line bg-white/70 p-6 md:p-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
