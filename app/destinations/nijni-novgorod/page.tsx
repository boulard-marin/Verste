import type { Metadata } from "next";
import Link from "next/link";

import { ProofTag } from "@/components/brand/ProofTag";
import { DayView } from "@/components/destination/DayView";
import { AddToTripButton } from "@/components/place/AddToTripButton";
import { MediaFigure } from "@/components/place/MediaFigure";
import { Voyage, type VoyageMedia, type VoyageScene } from "@/components/voyage/Voyage";
import { grandeVersteNijni } from "@/data/travel/grande-verste";
import { findPlace, placesOf } from "@/data/travel/index";
import { getJourney } from "@/data/travel/journeys";
import { nijniRestaurants, nijniSportVenues } from "@/data/travel/places-nijni";
import { nijniNature, nijniTroisJours, torpedoAnnounced } from "@/data/travel/products-nijni";
import { nijniHighlights, nijniOutlines, nijniScenes } from "@/data/voyage/nijni";
import { photoOf } from "@/lib/map/data";
import { formatDate } from "@/lib/format";
import { formatDistance, haversineKm } from "@/lib/travel/geo";
import { getMedia } from "@/lib/travel/media";
import type { Verified } from "@/lib/travel/types";
import { formatDuration, walkSchedule } from "@/lib/travel/walk";

export const metadata: Metadata = {
  title: "Nijni Novgorod · la ville où l'Oka rejoint la Volga",
  description:
    "Nijni Novgorod préparé par VERSTE : le kremlin, la Strelka, La Grande Verste, le hockey à la VOLGA Arena, la lutte et le sambo, les lacs, les tables. Trois jours testés sur le terrain, vérifiés sur les sources officielles.",
};

const KM_ZERO = [37.6177, 55.7557] as const;

function media(slug: string): VoyageMedia | null {
  const photo = photoOf(slug);
  const m = getMedia(slug);
  if (!photo || !m) return null;
  return { ...photo, ...(m.type === "video" ? { video: m.src } : {}) };
}

function Proof({ v }: { v?: Verified<string> }) {
  if (!v) return null;
  return (
    <span className="mt-1 block">
      <span className="text-fg">{v.value}</span>
      <span className="ml-2 inline-block align-middle">
        <ProofTag status={v.verification.status} checkedAt={v.verification.checkedAt} />
      </span>
    </span>
  );
}

export default function NijniPage() {
  const nijni = findPlace("kremlin-nijni")!;
  const fromMoscow = formatDistance(haversineKm(KM_ZERO, nijni.coords));
  const toForest = formatDistance(haversineKm(nijni.coords, findPlace("chtcholokovski")!.coords));
  const scenes: VoyageScene[] = nijniScenes.map((s) => ({
    ...s,
    kicker: s.kicker.replace("401 km", fromMoscow),
    text: s.text.replace("Six kilomètres", `À ${toForest}`),
    resolved: (s.media ?? []).map(media).filter((x): x is VoyageMedia => x !== null),
  }));
  const walk = walkSchedule(grandeVersteNijni);
  const train = getJourney("train-moscou-nijni");
  const hockey = nijniSportVenues.find((v) => v.id === "volga-arena")!;
  const clubs = nijniSportVenues.filter((v) => v.id !== "volga-arena");
  const hero = getMedia("nijni-kremlin-mur-volga");

  return (
    <>
      <h1 className="sr-only">Nijni Novgorod</h1>
      <Voyage id="nijni" label="Nijni Novgorod, vue d'en haut" scenes={scenes} highlights={nijniHighlights} outlines={nijniOutlines} objects={false} fortresses="kremlin-nijni" />

      {/* ── Trois jours ─────────────────────────────────────────────────── */}
      <section data-surface="frost" id="trois-jours" aria-labelledby="trois-jours-title" className="bg-surface py-20 text-fg md:py-28">
        <div className="gutter mx-auto max-w-[1440px]">
          <p className="label text-fg-2">Premier produit Nijni · testé du 22 au 25/09/2026</p>
          <h2 id="trois-jours-title" className="mt-3 font-display text-h1">
            {nijniTroisJours.title}
          </h2>
          <p className="mt-4 max-w-[60ch] text-lead text-fg-2">{nijniTroisJours.subtitle}. Un jour pour récupérer du trajet, un jour à pied, un jour sur la Strelka.</p>
          <div className="mt-12">
            {nijniTroisJours.days.map((d, i) => (
              <DayView key={d.id} day={d} index={i + 1} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/configurateur" className="inline-flex min-h-12 items-center rounded-xs bg-route px-6 text-[0.95rem] font-medium text-on-route hover:brightness-110">
              Adapter ce voyage au mien
            </Link>
          </div>
        </div>
      </section>

      {/* ── La Grande Verste ─────────────────────────────────────────────── */}
      <section data-surface="night" aria-labelledby="gv-title" className="relative overflow-hidden bg-surface py-20 text-fg md:py-28">
        <div className="gutter mx-auto grid max-w-[1440px] items-center gap-12 md:grid-cols-2">
          <div>
            <p className="label text-fg-2">Le produit à pied</p>
            <h2 id="gv-title" className="mt-3 font-display font-cond text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] uppercase">
              La Grande Verste
            </h2>
            <p className="mt-4 font-display-italic text-quote text-fg-2 italic">{grandeVersteNijni.subtitle}</p>
            <p className="mt-8 font-mono text-[clamp(2rem,5vw,3.4rem)] leading-none">
              {formatDistance(walk.totalKm)} <span className="text-fg-2">· {formatDuration(walk.walkMin)} de marche</span>
            </p>
            <p className="label mt-3 text-fg-2">Itinéraire piéton calculé sur OpenStreetMap · {grandeVersteNijni.stops.length} étapes, du kremlin à la Volga</p>
            <Link href="/destinations/nijni-novgorod/la-grande-verste" className="mt-8 inline-flex min-h-12 items-center rounded-xs bg-route px-6 text-[0.95rem] font-medium text-on-route hover:brightness-110">
              Suivre La Grande Verste
            </Link>
          </div>
          {hero && <MediaFigure media={hero} sizes="(min-width: 768px) 45vw, 100vw" frameClassName="aspect-[4/5] rounded-[4px]" />}
        </div>
      </section>

      {/* ── VERSTE Sport ─────────────────────────────────────────────────── */}
      <section data-surface="midnight" id="sport" aria-labelledby="sport-title" className="bg-surface py-20 text-fg md:py-28">
        <div className="gutter mx-auto max-w-[1440px]">
          <p className="label text-fg-2">VERSTE Sport</p>
          <h2 id="sport-title" className="mt-3 font-display text-h1">
            Un soir de KHL, un matin sur le tapis
          </h2>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <article>
              <MediaFigure media={getMedia("nijni-hockey-mise-en-jeu")!} sizes="(min-width: 1024px) 50vw, 100vw" frameClassName="aspect-video rounded-[4px]" />
              <h3 className="mt-6 font-display font-semicond text-h3">{hockey.fr} · hockey sur glace</h3>
              <p className="mt-2 text-fg-2">{hockey.summary}</p>
              <dl className="mt-4 space-y-3 text-[0.94rem]">
                <div>
                  <dt className="label text-fg-2">Adresse et accès</dt>
                  <dd className="mt-1 text-fg">
                    {hockey.address} · {hockey.access}
                  </dd>
                </div>
                <div>
                  <dt className="label text-fg-2">Billets</dt>
                  <dd>
                    <Proof v={hockey.visitorAccess} />
                  </dd>
                </div>
                <div>
                  <dt className="label text-fg-2">Matchs à domicile annoncés en octobre 2026</dt>
                  <dd className="mt-1 text-fg">
                    {torpedoAnnounced.map((e) => `${formatDate(e.date)} · ${e.title}`).join(" — ")}
                    <span className="mt-1 block">
                      <ProofTag status="a-verifier" /> <span className="text-[0.85rem] text-fg-2">Annoncés par la presse locale, non confirmés sur hctorpedo.ru au 30/09/2026. VERSTE ne propose un match qu&apos;une fois confirmé.</span>
                    </span>
                  </dd>
                </div>
              </dl>
            </article>
            <div className="space-y-6">
              {clubs.map((c) => (
                <article key={c.id} className="rounded-[6px] border border-line p-5">
                  <p className="label text-fg-2">{c.disciplines.join(" · ")}</p>
                  <h3 className="mt-2 font-display font-semicond text-[1.4rem]">{c.fr}</h3>
                  <p lang="ru" className="text-[0.9rem] text-fg-2">
                    {c.ru}
                  </p>
                  <dl className="mt-3 space-y-2 text-[0.9rem]">
                    <div>
                      <dt className="label text-fg-2">Où</dt>
                      <dd className="text-fg">
                        {c.address}
                        {c.access ? ` · ${c.access}` : ""}
                      </dd>
                    </div>
                    {c.level && (
                      <div>
                        <dt className="label text-fg-2">Niveau</dt>
                        <dd className="text-fg">{c.level}</dd>
                      </div>
                    )}
                    {c.hours && (
                      <div>
                        <dt className="label text-fg-2">Horaires</dt>
                        <dd>
                          <Proof v={c.hours} />
                        </dd>
                      </div>
                    )}
                    {c.price && (
                      <div>
                        <dt className="label text-fg-2">Prix</dt>
                        <dd>
                          <Proof v={c.price} />
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="label text-fg-2">Accès visiteur</dt>
                      <dd>
                        <Proof v={c.visitorAccess} />
                      </dd>
                    </div>
                    {c.equipment && (
                      <div>
                        <dt className="label text-fg-2">Équipement</dt>
                        <dd className="text-fg">{c.equipment}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="label text-fg-2">Langue · réservation</dt>
                      <dd className="text-fg">
                        {c.language}
                        {c.booking ? ` · ${c.booking}` : ""}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
              <p className="text-[0.9rem] text-fg-2">Ce que VERSTE prépare : la demande écrite au club, en russe, la confirmation avant votre départ, le trajet depuis votre hôtel. Aucune séance n&apos;est annoncée comme acquise avant la réponse du club.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tables et souvenirs ─────────────────────────────────────────── */}
      <section data-surface="snow" id="tables" aria-labelledby="tables-title" className="bg-surface py-20 text-fg md:py-28">
        <div className="gutter mx-auto max-w-[1440px]">
          <p className="label text-fg-2">Tables et souvenirs</p>
          <h2 id="tables-title" className="mt-3 font-display text-h1">
            Où s&apos;asseoir, quoi rapporter
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {nijniRestaurants.map((r) => (
              <article key={r.id} className="border-t border-line pt-5">
                <h3 className="font-display font-semicond text-[1.5rem]">{r.fr}</h3>
                <p className="label mt-1 text-fg-2">
                  {r.address} · {r.cuisine}
                </p>
                <p className="mt-3 text-fg">{r.why}</p>
                <p className="mt-3 text-[0.9rem]">
                  <Proof v={r.hours} />
                </p>
                <div className="mt-4">
                  <AddToTripButton placeId={r.id} />
                </div>
              </article>
            ))}
          </div>
          {(() => {
            const shop = findPlace("boutique-promysly")!;
            return (
              <article className="mt-14 grid gap-6 border-t border-line pt-8 md:grid-cols-2">
                <div>
                  <h3 className="font-display font-semicond text-h3">Souvenirs</h3>
                  <p className="mt-3 max-w-[52ch] text-fg">{shop.summary}</p>
                  <p className="mt-3 text-fg-2">{shop.tip}</p>
                </div>
                <p className="label self-end text-fg-2">
                  {shop.address} · <Link href={`/lieux/${shop.id}`} className="underline underline-offset-4">fiche</Link>
                </p>
              </article>
            );
          })()}
        </div>
      </section>

      {/* ── Nature ───────────────────────────────────────────────────────── */}
      <section data-surface="frost" id="nature" aria-labelledby="nature-title" className="bg-surface py-20 text-fg md:py-28">
        <div className="gutter mx-auto max-w-[1440px]">
          <p className="label text-fg-2">Variante</p>
          <h2 id="nature-title" className="mt-3 font-display text-h1">
            {nijniNature.title}
          </h2>
          <p className="mt-4 max-w-[60ch] text-lead text-fg-2">{nijniNature.subtitle}.</p>
          {nijniNature.days.map((d) => (
            <DayView key={d.id} day={d} index={4} />
          ))}
        </div>
      </section>

      {/* ── Pratique ─────────────────────────────────────────────────────── */}
      <section data-surface="midnight" id="pratique" aria-labelledby="pratique-title" className="bg-surface py-20 text-fg md:py-28">
        <div className="gutter mx-auto grid max-w-[1440px] gap-12 md:grid-cols-2">
          <div>
            <p className="label text-fg-2">Pratique</p>
            <h2 id="pratique-title" className="mt-3 font-display text-h2">
              Venir, circuler
            </h2>
            <dl className="mt-8 space-y-5">
              <div>
                <dt className="label text-fg-2">Depuis Moscou</dt>
                <dd className="mt-1">
                  Lastochka · <Proof v={train.duration} />
                  <span className="mt-1 block text-[0.88rem] text-fg-2">{train.notes.join(" ")}</span>
                </dd>
              </div>
              <div>
                <dt className="label text-fg-2">Arrivée</dt>
                <dd className="mt-1 text-fg">Gare Moskovski, rive gauche de l&apos;Oka (métro Moskovskaïa), à {formatDistance(haversineKm(findPlace("gare-moskovski")!.coords, nijni.coords))} du kremlin à vol d&apos;oiseau (calculé).</dd>
              </div>
              <div>
                <dt className="label text-fg-2">Sur place</dt>
                <dd className="mt-1 text-fg">Le centre haut et la ville basse se font à pied ; métro jusqu&apos;à Strelka pour la VOLGA Arena ; taxi pour les lacs.</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-display font-semicond text-h3">Tous les lieux de Nijni</h3>
            <ul className="mt-6 grid gap-x-8 border-t border-line sm:grid-cols-2">
              {placesOf("nijni-novgorod")
                .filter((p) => p.category !== "gare")
                .map((p) => (
                  <li key={p.id} className="border-b border-line">
                    <Link href={`/lieux/${p.id}`} className="block py-3 text-fg hover:underline hover:decoration-route hover:underline-offset-4">
                      {p.fr}
                    </Link>
                  </li>
                ))}
            </ul>
            <Link href="/carte?ville=nijni-novgorod" className="label mt-6 inline-block text-fg underline underline-offset-4">
              Voir sur la Russia Travel Map
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
