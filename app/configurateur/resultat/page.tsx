import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SourceTag } from "@/components/brand/SourceTag";
import { VerstPost } from "@/components/brand/VerstPost";
import { ItineraryMap } from "@/components/itinerary/ItineraryMap";
import { buttonClass, ButtonLink } from "@/components/ui/Button";
import { Pending, showPending } from "@/components/ui/Pending";
import { TrackOnMount } from "@/components/ui/TrackOnMount";
import { offers } from "@/data/offers";
import { site } from "@/data/site";
import { configuratorCities } from "@/lib/configurator/cities";
import { buildProfile, COMFORTS, RUSSIAN_LEVELS } from "@/lib/configurator/engine.ts";
import { firstMissingStep, isComplete, parseAnswers, toQuery } from "@/lib/configurator/params.ts";

export const metadata: Metadata = {
  title: "Votre Russie",
  robots: { index: false, follow: false },
};

/**
 * Configurator result, rendered on the server from the URL: shareable and
 * reproducible. No price first: the profile, then the matching format.
 */
export default async function ResultPage({ searchParams }: PageProps<"/configurateur/resultat">) {
  const answers = parseAnswers(await searchParams);
  if (!isComplete(answers)) redirect(`/configurateur?${toQuery(answers, firstMissingStep(answers))}`);

  const profile = buildProfile(answers);
  const stops = profile.stops.map((stop) => ({ ...configuratorCities[stop.city], days: stop.days }));
  const offer = offers.find((o) => o.id === profile.offer)!;
  const concierge = offers.find((o) => o.id === "conciergerie")!;
  const russian = RUSSIAN_LEVELS.find((l) => l.id === answers.russian)!.label;
  const comfort = COMFORTS.find((c) => c.id === answers.comfort)!.label;

  const summary: { label: string; value: ReactNode }[] = [
    { label: "Durée", value: `${profile.days} jours sur place` },
    { label: "Profil", value: profile.title },
    { label: "Villes suggérées", value: stops.map((s) => s.fr).join(" · ") },
    { label: "Rythme", value: `${profile.rhythm.label}. ${profile.rhythm.detail}` },
    { label: "Niveau logistique", value: profile.logistics.label },
    { label: "Russe · confort", value: `${russian} · ${comfort}` },
  ];

  return (
    <>
      <TrackOnMount
        event="configurator_completed"
        props={{ duree: profile.days, profils: answers.interests.join(","), logistique: profile.logistics.id }}
      />

      <section data-surface="snow" aria-labelledby="resultat-title" className="bg-surface text-fg">
        <div className="gutter mx-auto max-w-[1440px] pt-28 pb-16 md:pt-36">
          <div className="flex items-center gap-4">
            <VerstPost />
            <p className="label text-fg-2">
              <span lang="ru" className="text-route">
                Верста 5
              </span>{" "}
              · Votre profil de voyage
            </p>
          </div>
          <h1 id="resultat-title" className="mt-8 font-display font-cond text-display-l font-medium uppercase">
            Votre Russie
          </h1>
          <p className="mt-4 font-display-italic text-h2 italic">{profile.title}</p>

          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <dl className="grid content-start border-t border-line lg:col-span-5">
              {summary.map((item) => (
                <div key={item.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="label pt-1 text-fg-2">{item.label}</dt>
                  <dd className="text-[1rem]">{item.value}</dd>
                </div>
              ))}
              <div className="grid gap-1 border-b border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="label pt-1 text-fg-2">Budget indicatif</dt>
                <dd className="text-[1rem]">
                  {showPending ? (
                    <Pending>fourchettes par niveau de confort</Pending>
                  ) : (
                    "Nous calibrons nos fourchettes sur le terrain. Nous vous donnons la vôtre lors de l'appel de cadrage."
                  )}
                </dd>
              </div>
            </dl>

            <div className="lg:col-span-7">
              <ItineraryMap stops={stops} />
            </div>
          </div>
        </div>
      </section>

      <section data-surface="snow" aria-labelledby="ligne-title" className="bg-surface text-fg">
        <div className="gutter mx-auto max-w-[1440px] pb-16">
          <h2 id="ligne-title" className="label text-fg-2">
            Votre ligne, étape par étape
          </h2>
          <ol className="relative mt-8 grid gap-8 md:flex md:gap-0">
            <span aria-hidden="true" className="absolute top-0 bottom-0 left-[3px] w-[2px] bg-route md:top-[3px] md:right-0 md:bottom-auto md:left-0 md:h-[2px] md:w-auto" />
            {stops.map((stop, i) => (
              <li key={stop.fr} className="relative pl-8 md:flex-1 md:pt-8 md:pl-0">
                <span aria-hidden="true" className="absolute top-0 left-0 md:-top-2">
                  <VerstPost size="sm" />
                </span>
                <p className="label text-fg-2">
                  Étape {i + 1} · {stop.days} jours
                </p>
                <p lang="ru" className="mt-2 font-display font-cond text-[clamp(1.4rem,2.4vw,2rem)] leading-none uppercase">
                  {stop.ru}
                </p>
                <p className="mt-1 text-[0.95rem] text-fg-2">{stop.fr}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[0.85rem] text-fg-2">
            Suggestion construite à partir de vos quatre réponses. L&apos;ordre et les durées s&apos;ajustent lors de la
            préparation.
          </p>
        </div>
      </section>

      <section data-surface="snow" aria-label="Détails du profil" className="bg-surface text-fg">
        <div className="gutter mx-auto grid max-w-[1440px] gap-12 border-t border-line pt-14 pb-16 md:grid-cols-2 md:gap-6">
          <div>
            <h2 className="font-display text-h3">Ce que vous pourriez vivre</h2>
            <ul className="mt-6 grid border-t border-line">
              {profile.experiences.map((experience) => (
                <li key={experience.text} className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:gap-4">
                  <span className="label w-40 shrink-0 pt-1 text-fg-2">{configuratorCities[experience.city].fr}</span>
                  <span>{experience.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-h3">
              Préparation : <span className="font-display-italic italic">{profile.logistics.label.toLowerCase()}</span>
            </h2>
            <ul className="mt-6 grid border-t border-line">
              {profile.logistics.reasons.map((reason) => (
                <li key={reason} className="border-b border-line py-3">
                  {reason}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-2 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
              <SourceTag kind="officiel" className="pt-0.5" />
              <p className="text-[0.95rem] text-fg-2">{profile.visaNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section data-surface="frost" aria-labelledby="suite-title" className="bg-surface text-fg">
        <div className="gutter mx-auto grid max-w-[1440px] gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24">
          <div className="md:col-span-6">
            <h2 id="suite-title" className="font-display font-semicond text-h1 font-medium">
              Le format qui vous correspond
            </h2>
            <p className="mt-6 max-w-[48ch] text-lead text-fg-2">
              {offer.name}, {offer.duration.toLowerCase()} : {offer.summary.charAt(0).toLowerCase()}
              {offer.summary.slice(1)} {profile.concierge && `Vu votre profil, la ${concierge.name.toLowerCase()} peut vous faire gagner du temps sur place.`}
            </p>
          </div>
          <div className="grid content-end gap-4 md:col-span-5 md:col-start-8">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <span className="font-display text-h3">{offer.name}</span>
              <span className="font-display font-cond text-[2.5rem] leading-none tabular">{offer.price}&nbsp;€</span>
            </div>
            {profile.concierge && (
              <div className="flex items-baseline justify-between border-b border-line pb-4 text-fg-2">
                <span>+ {concierge.name} (option)</span>
                <span className="tabular">+&nbsp;{concierge.price}&nbsp;€</span>
              </div>
            )}
            <p className="text-[0.85rem] text-fg-2">
              {site.legalPromise} Prix de la préparation uniquement ; vous réservez et payez vos prestations directement.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              {/* checkout_started is recorded in phase G, when the checkout exists */}
              <ButtonLink href={`/contact?${toQuery(answers)}&offre=${offer.id}`}>
                Construire cet itinéraire
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </ButtonLink>
              <ButtonLink href={`/contact?${toQuery(answers)}`} variant="secondary">
                Parler de mon voyage
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="gutter mx-auto max-w-[1440px] pb-16">
          <Link href={`/configurateur?${toQuery(answers, 1)}`} className={buttonClass({ variant: "quiet" })}>
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
            Modifier mes réponses
          </Link>
        </div>
      </section>
    </>
  );
}
