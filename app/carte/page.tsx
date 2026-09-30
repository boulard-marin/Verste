import type { Metadata } from "next";
import Link from "next/link";

import { RussiaTravelMap } from "@/components/map/RussiaTravelMap";
import { getMapData } from "@/lib/map/data";

export const metadata: Metadata = {
  title: "Russia Travel Map · Moscou, Saint-Pétersbourg, Nijni Novgorod, Kazan",
  description:
    "La carte du voyage VERSTE : Moscou et Nijni Novgorod vécues sur le terrain, Saint-Pétersbourg et Kazan préparées sur sources, les trains depuis Moscou, la météo du moment et chaque lieu vérifié.",
};

const statusLabel = { terrain: "Expérience terrain", destination: "Destination VERSTE", "a-venir": "À venir" } as const;

export default function CartePage() {
  const data = getMapData();
  const byCity = data.cities
    .filter((c) => c.status !== "a-venir")
    .map((c) => ({ id: c.id, name: c.fr, status: c.status, places: data.places.filter((p) => p.cityId === c.id) }));

  return (
    <>
      <section aria-label="Russia Travel Map" className="h-svh pt-16 md:pt-20">
        <RussiaTravelMap data={data} />
      </section>

      <section data-surface="midnight" className="bg-surface py-20 text-fg md:py-28" aria-labelledby="tous-les-lieux">
        <div className="gutter mx-auto max-w-[1440px]">
          <p className="label text-fg-2">La carte, en liste</p>
          <h2 id="tous-les-lieux" className="mt-3 font-display text-h2">
            Tous les lieux de la carte
          </h2>
          <p className="mt-4 max-w-[60ch] text-lead text-fg-2">
            Chaque lieu a sa fiche : ce qu&apos;il est, où il se trouve, ce que nous avons vérifié et quand.
          </p>
          <div className="mt-14 grid gap-14 lg:grid-cols-2">
            {byCity.map((city) => (
              <div key={city.id}>
                <p className="label text-fg-2">{statusLabel[city.status]}</p>
                <h3 className="mt-2 font-display font-semicond text-h3">{city.name}</h3>
                <ul className="mt-6 border-t border-line">
                  {city.places.map((p) => (
                    <li key={p.id} className="border-b border-line">
                      <Link href={p.href} className="group flex items-baseline justify-between gap-6 py-4">
                        <span>
                          <span className="block text-fg group-hover:underline group-hover:decoration-route group-hover:underline-offset-4">{p.fr}</span>
                          <span lang="ru" className="text-[0.85rem] text-fg-2">
                            {p.ru}
                          </span>
                        </span>
                        <span className="label shrink-0 text-fg-2">{p.categoryLabel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="label mt-14 text-fg-2">
            Fond de carte © contributeurs OpenStreetMap (ODbL) · tuiles OpenFreeMap · relief Terrain Tiles (Mapzen, AWS) · coordonnées Wikipédia et OpenStreetMap · météo Open-Meteo.com (CC BY 4.0)
          </p>
        </div>
      </section>
    </>
  );
}
