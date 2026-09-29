import { BilingualName } from "@/components/brand/BilingualName";
import { VerstPost } from "@/components/brand/VerstPost";
import type { Destination } from "@/data/cities";
import { formatCoords } from "@/lib/format";

/** One stop on the verste line: a post on the line, the name in both alphabets, the essentials. */
export function DestinationCard({ destination, kmLabel }: { destination: Destination; kmLabel: string }) {
  return (
    <li className="relative flex w-[82vw] max-w-[26rem] shrink-0 snap-start flex-col pt-12 sm:w-[22rem] md:w-[25rem]">
      <div className="absolute top-0 left-0 flex items-center gap-3">
        <VerstPost size="sm" className="-translate-y-[45%]" />
        <span className="label -translate-y-[45%] text-route">{kmLabel}</span>
      </div>

      <BilingualName ru={destination.ru} fr={destination.fr} size="compact" as="h3" />
      <p className="label mt-2 text-fg-2">{formatCoords(destination.coords)}</p>
      <p className="mt-6 text-[1.02rem] leading-relaxed text-fg">{destination.line}</p>

      <dl className="mt-auto grid gap-3 border-t border-line pt-5 text-[0.92rem]">
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="label pt-0.5 text-fg-2">Séjour</dt>
          <dd>{destination.stay}</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="label pt-0.5 text-fg-2">Depuis Moscou</dt>
          <dd>{destination.access}</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="label pt-0.5 text-fg-2">Pour</dt>
          <dd>{destination.idealFor.join(" · ")}</dd>
        </div>
      </dl>
      <p className="label mt-5 self-start border border-line px-2.5 py-1.5 text-fg">{destination.from}</p>
    </li>
  );
}
