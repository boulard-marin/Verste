import { SceneMarker } from "@/components/brand/SceneMarker";
import { PricingCard } from "@/components/pricing/PricingCard";
import { Pending } from "@/components/ui/Pending";
import { ViewTracker } from "@/components/ui/ViewTracker";
import { offers, offersMeta } from "@/data/offers";
import { site } from "@/data/site";

/** S10 · Offres — fixed prices, shown before any conversation. */
export function OffersScene() {
  return (
    <section id="offres" data-surface="snow" aria-labelledby="offres-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] py-[clamp(6rem,14vh,11rem)]">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <SceneMarker index={10} label="Offres" />
            <h2 id="offres-title" className="mt-8 max-w-[18ch] font-display font-semicond text-h1 font-medium">
              Quatre façons de préparer le voyage.
            </h2>
          </div>
          <div className="grid content-end gap-4 md:col-span-4 md:col-start-9">
            <p className="text-lead text-fg-2">Des prix fixes, affichés avant tout échange. Vous savez ce que vous payez, et pour quoi.</p>
            {!offersMeta.validated && <Pending>prix et quantités à valider</Pending>}
          </div>
        </div>

        <ViewTracker event="pricing_viewed">
          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 md:mt-20">
            {offers.map((offer) => (
              <PricingCard key={offer.id} offer={offer} />
            ))}
          </div>
        </ViewTracker>

        <div className="mt-10 grid gap-4 text-[0.9rem] text-fg-2 md:grid-cols-2 md:gap-10">
          <p>
            <strong className="font-medium text-fg">{site.legalPromise}</strong> {offersMeta.note}
          </p>
          <p>
            Aucun avis inventé ici : les témoignages de nos premiers voyageurs seront publiés à leur retour, avec leur
            accord.
          </p>
        </div>
      </div>
    </section>
  );
}
