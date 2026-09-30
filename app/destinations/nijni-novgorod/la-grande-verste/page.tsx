import type { Metadata } from "next";
import Link from "next/link";

import { GrandeVerste, type WalkStopView } from "@/components/walk/GrandeVerste";
import { grandeVersteNijni } from "@/data/travel/grande-verste";
import { findPlace, getPlace } from "@/data/travel/index";
import { nijniHighlights, nijniOutlines } from "@/data/voyage/nijni";
import { photoOf } from "@/lib/map/data";
import { formatDate } from "@/lib/format";
import { formatDistance } from "@/lib/travel/geo";
import { formatDuration, walkSchedule } from "@/lib/travel/walk";

export const metadata: Metadata = {
  title: "La Grande Verste · Nijni Novgorod, du kremlin à la Volga",
  description:
    "La Grande Verste de Nijni Novgorod : une traversée à pied du kremlin à la Volga, en huit étapes, avec distances mesurées sur l'itinéraire réel, horaires, photos de terrain, restaurant et conseils.",
};

export default function GrandeVerstePage() {
  const walk = grandeVersteNijni;
  const schedule = walkSchedule(walk);
  const stops: WalkStopView[] = walk.stops.map((s) => {
    const place = getPlace(s.placeId);
    const photo = photoOf(s.media?.[0] ?? place.media[0]);
    return {
      label: s.label,
      title: s.title,
      placeId: place.id,
      placeFr: place.fr,
      placeRu: place.ru,
      story: s.story,
      tip: s.tip,
      ...(photo ? { photo: { src: photo.src, alt: photo.alt, caption: photo.caption, blurDataURL: photo.blurDataURL, kind: photo.kind, ...(photo.credit ? { credit: photo.credit } : {}) } } : {}),
    };
  });
  const restaurant = findPlace(walk.restaurantId)!;

  return (
    <div className="pt-16 md:pt-20">
      <section data-surface="night" aria-labelledby="gv-title" className="gutter bg-surface py-16 text-fg md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <nav aria-label="Fil d'Ariane" className="label text-fg-2">
            <Link href="/destinations/nijni-novgorod" className="hover:text-fg">
              Nijni Novgorod
            </Link>{" "}
            / La Grande Verste
          </nav>
          <h1 id="gv-title" className="mt-6 font-display font-cond text-[clamp(3.4rem,11vw,9rem)] leading-[0.86] uppercase">
            La Grande Verste
          </h1>
          <p className="mt-4 font-display-italic text-quote text-fg-2 italic">Nijni Novgorod · {walk.subtitle}</p>
          <dl className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="label text-fg-2">Distance</dt>
              <dd className="mt-2 font-mono text-[1.8rem] leading-none">{formatDistance(schedule.totalKm)}</dd>
              <dd className="mt-1 text-[0.82rem] text-fg-2">mesurée sur l&apos;itinéraire piéton réel</dd>
            </div>
            <div>
              <dt className="label text-fg-2">Durée</dt>
              <dd className="mt-2 font-mono text-[1.8rem] leading-none">{formatDuration(schedule.totalMin)}</dd>
              <dd className="mt-1 text-[0.82rem] text-fg-2">dont {formatDuration(schedule.walkMin)} de marche, rythme normal</dd>
            </div>
            <div>
              <dt className="label text-fg-2">Difficulté</dt>
              <dd className="mt-2 text-fg">{walk.difficulty}</dd>
            </div>
            <div>
              <dt className="label text-fg-2">Départ conseillé</dt>
              <dd className="mt-2 text-fg">{walk.bestStart}</dd>
            </div>
          </dl>
        </div>
      </section>

      <GrandeVerste walk={walk} stops={stops} highlights={nijniHighlights.filter((h) => ["kremlin-nijni", "sirotkine"].includes(h.id))} outlines={nijniOutlines} />

      <section data-surface="midnight" aria-label="Préparer La Grande Verste" className="gutter bg-surface py-16 text-fg md:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-3">
          <div>
            <h2 className="label text-fg-2">Transport</h2>
            <p className="mt-3 text-fg">{walk.transport}</p>
          </div>
          <div>
            <h2 className="label text-fg-2">Pauses</h2>
            <ul className="mt-3 space-y-1 text-fg">
              {walk.pauses.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="label text-fg-2">Restaurant</h2>
            <p className="mt-3 text-fg">
              <Link href={`/lieux/${restaurant.id}`} className="underline underline-offset-4">
                {restaurant.fr}
              </Link>
              , {restaurant.address}. {restaurant.summary}
            </p>
          </div>
          <div>
            <h2 className="label text-fg-2">Option sport</h2>
            <p className="mt-3 text-fg">{walk.sportOption}</p>
          </div>
          <div>
            <h2 className="label text-fg-2">Option culture</h2>
            <p className="mt-3 text-fg">{walk.cultureOption}</p>
          </div>
          <div>
            <h2 className="label text-fg-2">Vérifications</h2>
            <p className="mt-3 text-fg-2">
              Tracé {walk.geometrySource.toLowerCase()}. Horaires et tarifs relevés le {formatDate(walk.checkedAt)} sur les sites officiels quand ils existent ; chaque fiche de lieu dit ce qui reste à confirmer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
