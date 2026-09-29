import { Check } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Track } from "@/components/ui/Track";
import type { Offer } from "@/data/offers";

/** One offer. No badge, no countdown, no crossed-out price. */
export function PricingCard({ offer }: { offer: Offer }) {
  return (
    <article
      aria-labelledby={`offre-${offer.id}`}
      className={`flex h-full flex-col border bg-white/70 p-6 md:p-7 ${
        offer.option ? "border-dashed border-fg/30" : "border-line shadow-[0_16px_40px_-24px_rgb(11_26_51/0.28)]"
      }`}
    >
      <p className="label text-fg-2">{offer.duration}</p>
      <h3 id={`offre-${offer.id}`} className="mt-2 font-display text-h3">
        {offer.name}
      </h3>
      <p className="mt-6 font-display font-cond text-[3.25rem] leading-none font-medium tabular">
        {offer.option && <span className="text-[0.6em] text-fg-2">+&nbsp;</span>}
        {offer.price}&nbsp;€
      </p>
      <p className="mt-3 text-[0.98rem] text-fg-2">{offer.summary}</p>

      <ul className="mt-6 grid gap-3 border-t border-line pt-5 text-[0.93rem] leading-snug">
        {offer.includes.map((item) => (
          <li key={item} className="flex gap-3">
            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg" strokeWidth={2} />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Track event="configurator_started" props={{ from: "offre", offre: offer.id }}>
          <ButtonLink href={offer.cta.href} variant="secondary" className="w-full">
            {offer.cta.label}
          </ButtonLink>
        </Track>
      </div>
    </article>
  );
}
