"use client";

import { Check, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { ProofTag } from "@/components/brand/ProofTag";
import type { MapPlace } from "@/lib/map/data";
import { formatLonLat } from "@/lib/travel/geo";
import { toggleTripPlace, useTrip } from "@/lib/trip";

/**
 * The place card of the Russia Travel Map: a side panel on large screens, a
 * bottom sheet on phones. Everything a visitor needs to decide: where it is,
 * what it is, what we checked, and a way to keep it.
 */
export function PlaceSheet({ place, distanceLabel, onClose }: { place: MapPlace; distanceLabel?: string; onClose: () => void }) {
  const trip = useTrip();
  const added = trip.includes(place.id);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place.id, onClose]);

  return (
    <aside
      aria-label={place.fr}
      data-surface="night"
      data-lenis-prevent
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 max-h-[62svh] overflow-y-auto overscroll-contain rounded-t-[10px] border-t border-line bg-night/95 text-fg shadow-[0_-20px_60px_rgb(0_0_0/0.5)] backdrop-blur-md md:inset-x-auto md:top-4 md:right-4 md:bottom-4 md:max-h-none md:w-[400px] md:rounded-[6px] md:border"
    >
      <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-night/95 to-transparent pt-2 md:hidden">
        <span aria-hidden="true" className="h-1 w-10 rounded-full bg-fg/30" />
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-20 inline-flex size-10 items-center justify-center rounded-full bg-night/70 text-fg backdrop-blur hover:bg-night"
      >
        <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
        <span className="sr-only">Fermer la fiche</span>
      </button>

      {place.photo && (
        <figure className="relative">
          <div className="relative aspect-[16/9] overflow-hidden md:aspect-[4/3] md:rounded-t-[6px]">
            <Image
              src={place.photo.src}
              alt={place.photo.alt}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              placeholder="blur"
              blurDataURL={place.photo.blurDataURL}
              className="object-cover object-[50%_30%]"
            />
          </div>
          <figcaption className="flex items-baseline gap-2 px-5 pt-3 text-fg-2">
            <span
              aria-hidden="true"
              className={`inline-block size-[7px] shrink-0 translate-y-[-1px] rounded-full border border-current ${place.photo.kind === "verste" ? "bg-current" : ""}`}
            />
            <span className="text-[0.8rem] leading-snug">
              {place.photo.kind === "verste" ? "Photographie VERSTE · " : "Image libre · "}
              {place.photo.caption}
              {place.photo.credit && <span className="block opacity-80">{place.photo.credit}</span>}
            </span>
          </figcaption>
        </figure>
      )}

      <div className="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="label text-fg-2">{place.categoryLabel}</p>
        <h2 className="mt-2 font-display text-h3 text-fg">{place.fr}</h2>
        <p lang="ru" className="mt-1 font-display font-cond text-[1.15rem] text-fg-2">
          {place.ru}
        </p>
        <p className="mt-4 text-[0.98rem] leading-relaxed text-fg">{place.summary}</p>

        <dl className="mt-5 space-y-4 border-t border-line pt-5 text-[0.92rem]">
          <div>
            <dt className="label text-fg-2">Où</dt>
            <dd className="mt-1 font-mono text-[0.82rem] text-fg">
              {formatLonLat(place.coords)}
              {distanceLabel && <span className="block font-sans text-[0.85rem] text-fg-2">{distanceLabel}</span>}
            </dd>
          </div>
          {place.hours && (
            <div>
              <dt className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="label text-fg-2">Horaires</span>
                <ProofTag status={place.hours.status} checkedAt={place.hours.checkedAt} />
              </dt>
              <dd className="mt-1 text-fg">{place.hours.text}</dd>
              {place.hours.note && <dd className="mt-1 text-[0.82rem] text-fg-2">{place.hours.note}</dd>}
            </div>
          )}
          {place.price && (
            <div>
              <dt className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="label text-fg-2">Tarif</span>
                <ProofTag status={place.price.status} checkedAt={place.price.checkedAt} />
              </dt>
              <dd className="mt-1 text-fg">{place.price.text}</dd>
            </div>
          )}
          {place.fieldNote && (
            <div>
              <dt>
                <ProofTag status="observe" checkedAt="2026-09-26" />
              </dt>
              <dd className="mt-1 text-fg">{place.fieldNote}</dd>
            </div>
          )}
          {place.tip && (
            <div>
              <dt className="label text-fg-2">Conseil Verste</dt>
              <dd className="mt-1 text-fg">{place.tip}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toggleTripPlace(place.id)}
            aria-pressed={added}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xs px-4 text-[0.9rem] font-medium transition-colors duration-fast ${
              added ? "border border-fg/40 text-fg" : "bg-route text-on-route hover:brightness-110"
            }`}
          >
            {added ? <Check aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}
            {added ? "Dans mon voyage" : "Ajouter à mon voyage"}
          </button>
          <Link
            href={place.href}
            className="inline-flex min-h-11 items-center rounded-xs border border-fg/35 px-4 text-[0.9rem] text-fg hover:border-fg"
          >
            Ouvrir la fiche
          </Link>
        </div>
      </div>
    </aside>
  );
}
