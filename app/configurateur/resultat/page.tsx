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
import { DayView } from "@/components/destination/DayView";
import { buildProfile, COMFORTS, RUSSIAN_LEVELS } from "@/lib/configurator/engine.ts";
import { formatDate } from "@/lib/format";
import { buildItinerary, cityName, weekdayName } from "@/lib/itinerary/engine.ts";
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
  const params = await searchParams;
  const answers = parseAnswers(params);
  const depart = Array.isArray(params.depart) ? params.depart[0] : params.depart;
  const start = depart && /^20\d\d-\d\d-\d\d$/.test(depart) && !Number.isNaN(Date.parse(depart)) ? depart : undefined;
  if (!isComplete(answers)) redirect(`/configurateur?${toQuery(answers, firstMissingStep(answers))}`);

  const profile = buildProfile(answers);
  const itinerary = buildItinerary(answers, profile, start ? { start } : {});
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
              <ol className="grid gap-3 border-t border-line pt-4">
                {itinerary.days.map((d) => (
                  <li key={d.index} className="flex items-baseline gap-4">
                    <a href={`#jour-${d.index}`} className="label w-16 shrink-0 text-fg-2 hover:text-fg">
                      Jour {d.index}
                    </a>
                    <span className="text-fg">{d.day?.title ?? `À ${cityName(d.city)}`}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section data-surface="snow" id="itineraire" aria-labelledby="itineraire-title" className="bg-surface text-fg">
        <div className="gutter mx-auto max-w-[1440px] pb-16">
          <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-12">
            <div>
              <p className="label text-fg-2">Votre itinéraire</p>
              <h2 id="itineraire-title" className="mt-3 font-display text-h1">
                {profile.days} jours, jour par jour
              </h2>
              <p className="mt-3 max-w-[60ch] text-fg-2">
                Des journées réelles, testées sur le terrain et vérifiées sur les sources officielles, choisies selon vos réponses et ordonnées pour ne jamais enchaîner deux journées lourdes.
              </p>
            </div>
            <form action="/configurateur/resultat" className="flex flex-wrap items-end gap-3">
              {Object.entries({ duree: String(answers.days), russe: answers.russian, confort: answers.comfort }).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              {answers.interests.map((i) => (
                <input key={i} type="hidden" name="profils" value={i} />
              ))}
              <label className="grid gap-1">
                <span className="label text-fg-2">Date de départ (facultatif)</span>
                <input type="date" name="depart" defaultValue={start ?? ""} className="min-h-11 rounded-xs border border-fg/30 bg-transparent px-3 text-fg" />
              </label>
              <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
                Voir les jours
              </button>
            </form>
          </div>
          {start && (
            <p className="mt-4 text-[0.9rem] text-fg-2">
              Avec une date, VERSTE déplace les journées de musée hors des jours de fermeture quand c&apos;est possible et calcule le coucher du soleil de chaque soir.
            </p>
          )}
          {itinerary.warnings.length > 0 && (
            <ul className="mt-6 space-y-2 border-l-2 border-route pl-4 text-[0.95rem]">
              {itinerary.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <div className="mt-10">
            {itinerary.days.map((d, i) => {
              const header = i === 0 || itinerary.days[i - 1]!.city !== d.city;
              const dateLabel = d.date ? `${weekdayName(d.weekday!)} ${formatDate(d.date)}` : undefined;
              return (
                <div key={d.index}>
                  {header && (
                    <p lang="ru" className="mt-10 font-display font-cond text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-fg-2 uppercase first:mt-0">
                      {configuratorCities[d.city].ru} <span lang="fr" className="label align-middle normal-case">· {cityName(d.city)}</span>
                    </p>
                  )}
                  {d.day ? (
                    <DayView day={d.day} index={d.index} dateLabel={dateLabel} notes={d.notes} />
                  ) : (
                    <article className="grid gap-4 border-t border-line py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
                      <div>
                        <p className="label text-fg-2">
                          Jour {d.index}
                          {dateLabel ? ` · ${dateLabel}` : ""}
                        </p>
                        <h3 className="mt-3 font-display text-h3">
                          {d.kind === "a-construire" && i > 0 && itinerary.days[i - 1]!.city !== d.city ? `Trajet vers ${cityName(d.city)}` : `À ${cityName(d.city)}`}
                        </h3>
                      </div>
                      <p className="text-fg-2">
                        Pas encore de journée vérifiée VERSTE pour {cityName(d.city)} : nous la construisons avec vous, avec la même méthode (horaires officiels, trajets, jours de fermeture).
                        {d.notes.length > 0 && <span className="mt-2 block">{d.notes.join(" ")}</span>}
                      </p>
                    </article>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-10 grid gap-6 border-t border-line pt-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ItineraryMap stops={stops} />
            </div>
            <p className="text-[0.9rem] text-fg-2 lg:col-span-5">
              L&apos;ordre et les durées s&apos;ajustent lors de la préparation, avec vous. Ce que vous réservez vous-même (vols, hôtels, trains, billets) reste entre vos mains : nous vous disons quoi, quand et comment.
            </p>
          </div>
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
            <div className="mt-2 flex flex-wrap gap-3">
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
