import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SceneMarker } from "@/components/brand/SceneMarker";
import { buttonClass } from "@/components/ui/Button";
import { offers } from "@/data/offers";
import { configuratorCities } from "@/lib/configurator/cities";
import { buildProfile } from "@/lib/configurator/engine.ts";
import { isComplete, parseAnswers, toQuery } from "@/lib/configurator/params.ts";

export const metadata: Metadata = {
  title: "Parler de mon voyage",
  robots: { index: false, follow: false },
};

/**
 * Appel de cadrage. Holding page until the booking tool and the checkout
 * (phase G) exist: it keeps the visitor's profile and says plainly what
 * happens next.
 */
export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const answers = parseAnswers(params);
  const profile = isComplete(answers) ? buildProfile(answers) : null;
  const offerId = Array.isArray(params.offre) ? params.offre[0] : params.offre;
  const offer = offers.find((o) => o.id === offerId);

  return (
    <section data-surface="frost" className="min-h-[100svh] bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1100px] pt-28 pb-24 md:pt-36">
        <SceneMarker index={6} label="Appel de cadrage" />
        <h1 className="mt-8 max-w-[18ch] font-display font-semicond text-h1 font-medium">Parlons de votre voyage.</h1>
        <p className="mt-6 max-w-[56ch] text-lead text-fg-2">
          Un appel de vingt minutes, gratuit et sans engagement, pour vérifier que Verste correspond à votre projet. La
          prise de rendez-vous en ligne arrive dans la prochaine étape de construction.
        </p>

        {profile && (
          <div className="mt-12 border border-line bg-snow/70 p-6 md:p-8">
            <p className="label text-fg-2">Votre profil sera repris lors de l&apos;appel</p>
            <p className="mt-3 font-display text-h3">
              {profile.days} jours · {profile.title}
            </p>
            <p className="mt-2 text-fg-2">
              {profile.stops.map((s) => configuratorCities[s.city].fr).join(" · ")}
              {offer && ` · format ${offer.name}`}
            </p>
          </div>
        )}

        <div className="mt-10">
          <Link
            href={profile ? `/configurateur/resultat?${toQuery(answers)}` : "/"}
            className={buttonClass({ variant: "quiet" })}
          >
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
            {profile ? "Revenir à votre profil" : "Retour à l'accueil"}
          </Link>
        </div>
      </div>
    </section>
  );
}
