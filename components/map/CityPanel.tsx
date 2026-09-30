"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProofTag } from "@/components/brand/ProofTag";
import type { MapCityView, MapGroup, MapJourney, MapPlace } from "@/lib/map/data";
import { formatKm } from "@/lib/format";
import { OPEN_METEO_ATTRIBUTION, weatherLabel, type CityWeather } from "@/lib/weather";

const statusLabel = { terrain: "Expérience terrain", destination: "Destination VERSTE", "a-venir": "À venir" } as const;

const groupLabel: Record<MapGroup, string> = { culture: "Culture", sport: "Sport", nature: "Nature", table: "Tables", trajet: "Gares" };

/**
 * A city on the Russia Travel Map, in a few words: status, train, distance,
 * the weather right now, the places. Image first, then micro-text.
 */
export function CityPanel({
  city,
  journey,
  places,
  weather,
  clock,
  onBack,
  onPlace,
}: {
  city: MapCityView;
  journey?: MapJourney;
  places: MapPlace[];
  weather?: CityWeather;
  clock?: string;
  onBack: () => void;
  onPlace: (p: MapPlace) => void;
}) {
  const groups = [...new Set(places.map((p) => p.group))];
  return (
    <div className="pointer-events-auto flex max-h-full flex-col overflow-hidden rounded-[6px] border border-line bg-night/88 backdrop-blur-md">
      {city.photo && (
        <div className="relative aspect-[16/9] shrink-0 max-md:hidden">
          <Image src={city.photo.src} alt={city.photo.alt} fill sizes="440px" placeholder="blur" blurDataURL={city.photo.blurDataURL} className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-3 pt-10">
            <p className="text-[0.7rem] text-fg-2">
              <span className="label mr-2">{city.photo.kind === "verste" ? "Photographie VERSTE" : "Image libre"}</span>
              {city.photo.credit ?? city.photo.caption}
            </p>
          </div>
        </div>
      )}
      <div data-lenis-prevent className="min-h-0 overflow-y-auto overscroll-contain p-4 md:p-5">
        <button type="button" onClick={onBack} className="label inline-flex items-center gap-2 text-fg-2 hover:text-fg">
          <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
          Toute la Russie
        </button>
        <p className="label mt-4 flex items-center gap-2 text-fg-2">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${city.status === "terrain" ? "bg-fg" : "border-2 border-fg"}`} />
          {statusLabel[city.status]}
        </p>
        <h2 className="mt-2 font-display font-cond text-[clamp(2.2rem,4vw,3.2rem)] leading-none font-bold tracking-[0.03em] uppercase">{city.fr}</h2>
        <p lang="ru" className="mt-1 font-display font-semicond text-[1.15rem] text-fg-2">
          {city.ru}
        </p>
        <p className="mt-3 text-[0.95rem] text-fg">{city.line}</p>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line text-[0.85rem]">
          {journey && (
            <div className="col-span-2 bg-night p-3">
              <dt className="label text-fg-2">
                Depuis Moscou · {journey.service ?? "train"}
              </dt>
              <dd className="mt-1.5 text-fg">{journey.duration?.text}</dd>
              {journey.duration && <ProofTag status={journey.duration.status} checkedAt={journey.duration.checkedAt} className="mt-2" />}
            </div>
          )}
          {city.fromMoscowKm !== undefined && (
            <div className="bg-night p-3">
              <dt className="label text-fg-2">Distance</dt>
              <dd className="mt-1.5 font-mono text-[1.1rem] text-fg">{formatKm(city.fromMoscowKm)}</dd>
              <dd className="text-[0.72rem] text-fg-2">à vol d&apos;oiseau depuis Moscou, calculé</dd>
            </div>
          )}
          {weather && (
            <div className={`bg-night p-3 ${city.fromMoscowKm === undefined ? "col-span-2" : ""}`}>
              <dt className="label text-fg-2">Maintenant{clock ? ` · ${clock}` : ""}</dt>
              <dd className="mt-1.5 font-mono text-[1.1rem] text-fg">{Math.round(weather.temperature)} °C</dd>
              <dd className="text-[0.72rem] text-fg-2">
                {weatherLabel(weather.code)} · heure de Moscou
              </dd>
            </div>
          )}
        </dl>

        {places.length > 0 && (
          <div className="mt-5">
            <p className="label text-fg-2">Explorer</p>
            {groups.map((g) => (
              <div key={g} className="mt-3">
                <p className="text-[0.72rem] text-fg-2">{groupLabel[g]}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {places
                    .filter((p) => p.group === g)
                    .map((p) => (
                      <li key={p.id}>
                        <button type="button" onClick={() => onPlace(p)} className="rounded-full border border-line px-3 py-1.5 text-[0.82rem] text-fg hover:border-fg/60">
                          {p.fr}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/configurateur" className="inline-flex min-h-11 items-center gap-2 rounded-xs bg-route px-4 text-[0.9rem] font-medium text-on-route hover:brightness-110">
            Construire mon voyage
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </Link>
          {city.href && (
            <Link href={city.href} className="inline-flex min-h-11 items-center rounded-xs border border-fg/35 px-4 text-[0.9rem] text-fg hover:border-fg">
              {city.id === "moscou" ? "Revivre le voyage" : "La destination"}
            </Link>
          )}
        </div>
        {journey && <p className="mt-4 text-[0.72rem] text-fg-2">Trajet : {journey.basis}.</p>}
        {weather && <p className="mt-1 text-[0.72rem] text-fg-2">{OPEN_METEO_ATTRIBUTION}</p>}
      </div>
    </div>
  );
}
