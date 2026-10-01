import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProofTag } from "@/components/brand/ProofTag";
import { AddToTripButton } from "@/components/place/AddToTripButton";
import { MediaFigure } from "@/components/place/MediaFigure";
import { allPlaces, findPlace, mapCities } from "@/data/travel/index";
import { formatDistance, formatLonLat, haversineKm } from "@/lib/travel/geo";
import { getMediaList } from "@/lib/travel/media";
import type { CityId, Source, Verified } from "@/lib/travel/types";

const cityName = (id: CityId) => mapCities.find((c) => c.id === id)?.fr ?? id;
/** Nizhny has its destination page; the other cities open on the map. */
const cityHref = (id: CityId) => (id === "nijni-novgorod" ? "/destinations/nijni-novgorod" : `/carte?ville=${id}`);

export function generateStaticParams() {
  return allPlaces.map((p) => ({ id: p.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/lieux/[id]">): Promise<Metadata> {
  const { id } = await params;
  const place = findPlace(id);
  if (!place) return {};
  return { title: `${place.fr} · ${cityName(place.cityId)}`, description: place.summary };
}

function Sources({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <span className="mt-1 block text-[0.8rem] text-fg-2">
      Source :{" "}
      {sources.map((s, i) => (
        <span key={s.label}>
          {i > 0 && " · "}
          {s.url ? (
            <a href={s.url} rel="noreferrer" className="underline decoration-fg/30 underline-offset-2 hover:decoration-fg">
              {s.label}
            </a>
          ) : (
            s.label
          )}
        </span>
      ))}
    </span>
  );
}

function Fact({ label, v }: { label?: string; v: Verified<string> }) {
  return (
    <div className="border-b border-line py-5">
      <dt className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {label && <span className="label text-fg-2">{label}</span>}
        <ProofTag status={v.verification.status} checkedAt={v.verification.checkedAt} />
      </dt>
      <dd className="mt-2 text-fg">
        {v.value}
        {v.verification.note && <span className="mt-1 block text-[0.85rem] text-fg-2">{v.verification.note}</span>}
        <Sources sources={v.verification.sources} />
      </dd>
    </div>
  );
}

export default async function PlacePage({ params }: PageProps<"/lieux/[id]">) {
  const { id } = await params;
  const place = findPlace(id);
  if (!place) notFound();

  const media = getMediaList(place.media);
  const [hero, ...gallery] = media;
  const nearby = allPlaces
    .filter((p) => p.cityId === place.cityId && p.id !== place.id && p.category !== "gare")
    .map((p) => ({ p, km: haversineKm(place.coords, p.coords) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": place.category === "restaurant" ? "Restaurant" : "TouristAttraction",
    name: place.fr,
    alternateName: place.ru,
    description: place.summary,
    geo: { "@type": "GeoCoordinates", latitude: place.coords[1], longitude: place.coords[0] },
    ...(place.address ? { address: place.address } : {}),
  };

  return (
    <article data-surface="night" className="bg-surface pt-16 text-fg md:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="gutter mx-auto grid max-w-[1440px] gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <nav aria-label="Fil d'Ariane" className="label text-fg-2">
            <Link href="/carte" className="hover:text-fg">
              Russia Travel Map
            </Link>{" "}
            /{" "}
            <Link href={cityHref(place.cityId)} className="hover:text-fg">
              {cityName(place.cityId)}
            </Link>
          </nav>
          <h1 className="mt-6 font-display text-h1">{place.fr}</h1>
          <p lang="ru" className="mt-3 font-display font-cond text-[clamp(1.25rem,2.4vw,1.8rem)] text-fg-2">
            {place.ru}
          </p>
          <p className="mt-8 max-w-[52ch] text-lead text-fg">{place.summary}</p>
          {mapCities.find((c) => c.id === place.cityId)?.status === "destination" && (
            <p className="label mt-4 flex items-center gap-2 text-fg-2">
              <span aria-hidden="true" className="size-2.5 rounded-full border-2 border-current" />
              Destination VERSTE · préparée sur sources, pas encore vécue sur le terrain
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <AddToTripButton placeId={place.id} />
            <Link href={`/carte?lieu=${place.id}`} className="inline-flex min-h-12 items-center rounded-xs border border-fg/35 px-5 text-[0.95rem] text-fg hover:border-fg">
              Voir sur la carte
            </Link>
          </div>

          <dl className="mt-10 border-t border-line">
            <div className="border-b border-line py-5">
              <dt className="label text-fg-2">Où</dt>
              <dd className="mt-2">
                <span className="font-mono text-[0.9rem]">{formatLonLat(place.coords)}</span>
                {place.address && <span className="mt-1 block">{place.address}</span>}
                {place.access && <span className="mt-1 block text-fg-2">{place.access}</span>}
                <span className="mt-1 block text-[0.8rem] text-fg-2">Coordonnées : {place.coordsSource}</span>
              </dd>
            </div>
            {place.hours && <Fact label="Horaires" v={place.hours} />}
            {place.price && <Fact label="Tarif" v={place.price} />}
            {place.website && (
              <div className="border-b border-line py-5">
                <dt className="label text-fg-2">Site officiel</dt>
                <dd className="mt-2">
                  <a href={place.website} rel="noreferrer" className="underline decoration-fg/30 underline-offset-4 hover:decoration-route">
                    {place.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </dd>
              </div>
            )}
            {place.fieldNote && (
              <div className="border-b border-line py-5">
                <dt>
                  <ProofTag status="observe" checkedAt="2026-09-26" />
                </dt>
                <dd className="mt-2">{place.fieldNote}</dd>
              </div>
            )}
            {place.tip && (
              <div className="border-b border-line py-5">
                <dt className="label text-fg-2">Conseil Verste</dt>
                <dd className="mt-2">{place.tip}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {hero ? (
            <MediaFigure media={hero} sizes="(min-width: 1024px) 45vw, 100vw" priority frameClassName="aspect-[4/5] rounded-[4px]" />
          ) : (
            <div className="grid aspect-[4/5] place-items-center rounded-[4px] border border-dashed border-line p-8 text-center">
              <p className="label text-fg-2">Image à venir · aucune photographie libre satisfaisante pour l&apos;instant</p>
            </div>
          )}
        </div>
      </div>

      {(place.facts?.length || place.interpretations?.length) && (
        <section data-surface="midnight" className="bg-surface py-16 md:py-24" aria-labelledby="faits">
          <div className="gutter mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2">
            {place.facts && place.facts.length > 0 && (
              <div>
                <h2 id="faits" className="font-display font-semicond text-h3">
                  Les faits
                </h2>
                <dl className="mt-6 border-t border-line">
                  {place.facts.map((f) => (
                    <Fact key={f.value} v={f} />
                  ))}
                </dl>
              </div>
            )}
            {place.interpretations && place.interpretations.length > 0 && (
              <div>
                <h2 className="font-display font-semicond text-h3">Comment le lieu est présenté</h2>
                <p className="mt-3 max-w-[52ch] text-fg-2">Ce que disent les institutions du lieu, attribué à qui le dit. Ce n&apos;est pas la voix de VERSTE.</p>
                <ul className="mt-6 border-t border-line">
                  {place.interpretations.map((i) => (
                    <li key={i.text} className="border-b border-line py-5">
                      <p>{i.text}</p>
                      <p className="label mt-2 text-fg-2">— {i.attributedTo}</p>
                      {i.source && <Sources sources={[i.source]} />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="py-16 md:py-24" aria-label="Photographies">
          <div className="gutter mx-auto grid max-w-[1440px] gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((m) => (
              <MediaFigure key={m.slug} media={m} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" frameClassName="aspect-[4/5] rounded-[4px]" />
            ))}
          </div>
        </section>
      )}

      <section data-surface="midnight" className="bg-surface py-16 md:py-20" aria-labelledby="autour">
        <div className="gutter mx-auto max-w-[1440px]">
          <h2 id="autour" className="font-display font-semicond text-h3">
            Tout près
          </h2>
          <ul className="mt-6 grid gap-x-10 border-t border-line sm:grid-cols-2">
            {nearby.map(({ p, km }) => (
              <li key={p.id} className="border-b border-line">
                <Link href={`/lieux/${p.id}`} className="flex items-baseline justify-between gap-6 py-4 hover:text-fg">
                  <span>{p.fr}</span>
                  <span className="label shrink-0 text-fg-2">{formatDistance(km)} · à vol d&apos;oiseau</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
