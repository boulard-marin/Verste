import { ArrowRight } from "lucide-react";

import { SceneMarker } from "@/components/brand/SceneMarker";
import { VerstPost } from "@/components/brand/VerstPost";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationsRail } from "@/components/destinations/DestinationsRail";
import { ButtonLink } from "@/components/ui/Button";
import { Track } from "@/components/ui/Track";
import { destinations, destinationsNote, KM_ZERO } from "@/data/cities";
import { formatKm } from "@/lib/format";
import { distanceKm } from "@/lib/geo";

/** S05 · La ligne continue — stops ordered from the nearest to the farthest (computed). */
export function DestinationsScene() {
  const stops = destinations
    .map((destination) => ({ destination, km: distanceKm(KM_ZERO, destination.coords) }))
    .sort((a, b) => a.km - b.km);

  return (
    <DestinationsRail
      header={
        <div className="gutter mx-auto grid w-full max-w-[1440px] gap-6 md:grid-cols-12">
          <div className="md:col-span-6">
            <SceneMarker index={4} label="Destinations" />
            <h2 id="destinations-title" className="mt-8 font-display font-semicond text-h1 font-medium">
              La ligne continue.
            </h2>
          </div>
          <p className="max-w-[46ch] self-end text-lead text-fg-2 md:col-span-5 md:col-start-8">
            Depuis Moscou, elle peut partir dans toutes les directions. Cinq étapes pour commencer, de la plus proche
            à la plus lointaine.
          </p>
        </div>
      }
      footer={
        <div className="gutter mx-auto flex w-full max-w-[1440px] flex-col gap-2 text-[0.8rem] text-fg-2 md:flex-row md:justify-between">
          <p>{destinationsNote}</p>
          <p className="label md:hidden">Faites glisser pour voir la suite</p>
        </div>
      }
    >
      <li className="relative flex w-[60vw] max-w-[16rem] shrink-0 snap-start flex-col pt-12 sm:w-[14rem]">
        <div className="absolute top-0 left-0 flex items-center gap-3">
          <VerstPost size="sm" className="-translate-y-[45%]" />
          <span className="label -translate-y-[45%] text-route">KM 0</span>
        </div>
        <p lang="ru" className="font-display font-cond text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[0.95] font-medium">
          МОСКВА
        </p>
        <p className="label mt-3 text-fg-2">Point de départ</p>
      </li>

      {stops.map(({ destination, km }) => (
        <DestinationCard key={destination.id} destination={destination} kmLabel={formatKm(km)} />
      ))}

      <li className="flex w-[70vw] max-w-[20rem] shrink-0 snap-start flex-col justify-end gap-6 pt-12 sm:w-[18rem]">
        <p className="font-display-italic text-h3 italic">Et votre ligne à vous&#8239;?</p>
        <Track event="configurator_started" props={{ from: "destinations" }}>
          <ButtonLink href="/configurateur" variant="secondary" className="self-start">
            Dessiner mon itinéraire
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
          </ButtonLink>
        </Track>
      </li>
    </DestinationsRail>
  );
}
