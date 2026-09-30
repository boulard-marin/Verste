import Image from "next/image";
import Link from "next/link";

import { findPlace } from "@/data/travel/index";
import { getMediaList } from "@/lib/travel/media";
import type { Activity, ItineraryDay } from "@/lib/travel/types";

const moments: { key: "morning" | "afternoon" | "evening"; label: string }[] = [
  { key: "morning", label: "Matin" },
  { key: "afternoon", label: "Après-midi" },
  { key: "evening", label: "Soir" },
];

const weekdayName = { lun: "lundi", mar: "mardi", mer: "mercredi", jeu: "jeudi", ven: "vendredi", sam: "samedi", dim: "dimanche" } as const;

function ActivityLine({ a }: { a: Activity }) {
  const place = a.placeId ? findPlace(a.placeId) : undefined;
  return (
    <li className="border-t border-line py-3">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-medium text-fg">{a.title}</span>
        {a.optional && <span className="label text-fg-2">option</span>}
      </p>
      <p className="mt-1 text-[0.92rem] text-fg-2">{a.text}</p>
      {place && (
        <Link href={`/lieux/${place.id}`} className="label mt-1 inline-block text-fg-2 underline decoration-fg/25 underline-offset-4 hover:text-fg">
          {place.fr}
        </Link>
      )}
    </li>
  );
}

/**
 * One day of a VERSTE itinerary: morning, afternoon, evening, transport,
 * meals, options, and the days to avoid (closures) stated plainly.
 */
export function DayView({ day, index, dateLabel }: { day: ItineraryDay; index: number; dateLabel?: string }) {
  const photo = getMediaList(day.media)[0];
  return (
    <article id={`jour-${index}`} className="grid gap-8 border-t border-line py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
      <div>
        <p className="label text-fg-2">
          Jour {index}
          {dateLabel ? ` · ${dateLabel}` : ""}
        </p>
        <h3 className="mt-3 font-display text-h2">{day.title}</h3>
        <p className="mt-2 font-display-italic text-[1.15rem] text-fg-2 italic">{day.theme}</p>
        <p className="mt-5 max-w-[48ch] text-fg">{day.intro}</p>
        {photo && (
          <figure className="mt-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-night">
              <Image src={photo.type === "video" ? photo.poster! : photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 38vw, 100vw" placeholder="blur" blurDataURL={photo.blurDataURL} className="object-cover" />
            </div>
            <figcaption className="mt-2 text-[0.78rem] text-fg-2">
              <span className="label mr-2">{photo.kind === "verste" ? "Photographie VERSTE" : "Image libre"}</span>
              {photo.caption}
              {photo.credit && <span className="block opacity-80">{`${photo.credit.author}, ${photo.credit.license}, Wikimedia Commons`}</span>}
            </figcaption>
          </figure>
        )}
      </div>
      <div>
        {moments.map(({ key, label }) =>
          day[key].length ? (
            <section key={key} className="mb-6">
              <h4 className="label text-fg">{label}</h4>
              <ul className="mt-2">
                {day[key].map((a) => (
                  <ActivityLine key={a.title} a={a} />
                ))}
              </ul>
            </section>
          ) : null,
        )}
        <dl className="grid gap-4 border-t border-line pt-5 text-[0.92rem] sm:grid-cols-2">
          <div>
            <dt className="label text-fg-2">Déplacements</dt>
            <dd className="mt-1 space-y-1 text-fg">
              {day.transport.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </dd>
          </div>
          <div>
            <dt className="label text-fg-2">Repas</dt>
            <dd className="mt-1 space-y-1 text-fg">
              {day.meals.map((m) => (
                <p key={m}>{m}</p>
              ))}
            </dd>
          </div>
          {day.optionalExperiences.length > 0 && (
            <div>
              <dt className="label text-fg-2">En option</dt>
              <dd className="mt-1 space-y-1 text-fg">
                {day.optionalExperiences.map((o) => (
                  <p key={o}>{o}</p>
                ))}
              </dd>
            </div>
          )}
          {day.avoid && (
            <div>
              <dt className="label text-fg-2">À éviter</dt>
              <dd className="mt-1 text-fg">
                Le {day.avoid.weekdays.map((d) => weekdayName[d]).join(" et le ")} : {day.avoid.reason}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
