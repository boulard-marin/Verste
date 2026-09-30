import Image from "next/image";

import { SceneMarker } from "@/components/brand/SceneMarker";
import { KM_ZERO } from "@/data/cities";
import { founder } from "@/data/founder";
import { getItineraryMap } from "@/lib/geo";
import { getMediaList } from "@/lib/travel/media";

/** Terrain first (lived in 2026), then the destinations VERSTE prepares from sources. */
const CITIES = [
  { name: "Moscou", coords: KM_ZERO, lived: true },
  { name: "Nijni Novgorod", coords: [44.002, 56.3269] as const, lived: true },
  { name: "Saint-Pétersbourg", coords: [30.3159, 59.9391] as const, lived: false },
  { name: "Kazan", coords: [49.1221, 55.7887] as const, lived: false },
];

/**
 * S11 · Le fondateur. Image first, then a map that says what was lived and
 * what is prepared, then a few words. No portrait, no name: facts only.
 */
export function FounderScene() {
  const photos = getMediaList(founder.photos);
  const map = getItineraryMap(CITIES.map((c) => c.coords));
  const [moscou, nijni] = map.points;

  return (
    <section id="fondateur" data-surface="snow" aria-labelledby="fondateur-title" className="bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pb-[clamp(6rem,14vh,11rem)]">
        <div className="border-t border-line pt-[clamp(4rem,10vh,8rem)]">
          <SceneMarker index={11} label={founder.kicker} />
          <h2 id="fondateur-title" className="mt-8 max-w-[16ch] font-display font-semicond text-h1 font-medium">
            {founder.title}
          </h2>

          {/* Image: four moments of the 2026 stay */}
          <ul className="mt-12 grid grid-cols-2 gap-2 sm:gap-3 md:mt-16 lg:grid-cols-4">
            {photos.map((p) => (
              <li key={p.slug} className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-fg/5">
                <Image
                  src={p.poster ?? p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  placeholder="blur"
                  blurDataURL={p.blurDataURL}
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-baseline gap-2 text-fg-2">
            <span aria-hidden="true" className="inline-block size-[7px] shrink-0 translate-y-[-1px] rounded-full border border-current bg-current" />
            <span className="label">Photographie VERSTE</span>
            <span className="text-[0.8rem]">Moscou et Nijni Novgorod, septembre 2026.</span>
          </p>

          <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-8">
            {/* Lived vs prepared, on the map */}
            <figure className="lg:col-span-6">
              <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-labelledby="fondateur-carte" className="w-full">
                <title id="fondateur-carte">
                  Moscou et Nijni Novgorod, vécues sur le terrain ; Saint-Pétersbourg et Kazan, destinations préparées.
                </title>
                <path d={map.land} className="fill-fg/[0.05]" />
                <path d={map.russia} className="fill-fg/[0.07] stroke-fg/25" strokeWidth={0.8} />
                {/* Prepared routes: dotted, from Moscow */}
                {moscou &&
                  map.points.slice(2).map((q, i) => (
                    <line key={i} x1={moscou.x} y1={moscou.y} x2={q.x} y2={q.y} className="stroke-fg/45" strokeWidth={1.4} strokeDasharray="2 6" strokeLinecap="round" />
                  ))}
                {/* The route lived: the red line */}
                {moscou && nijni && <line x1={moscou.x} y1={moscou.y} x2={nijni.x} y2={nijni.y} style={{ stroke: "var(--route)" }} strokeWidth={3} strokeLinecap="round" />}
                {map.points.map((q, i) => {
                  const city = CITIES[i]!;
                  const dy = city.name === "Nijni Novgorod" ? 30 : city.name === "Moscou" || city.name === "Saint-Pétersbourg" ? -14 : 6;
                  return (
                    <g key={city.name}>
                      <circle cx={q.x} cy={q.y} r={city.lived ? 8 : 7} className={city.lived ? "fill-fg" : "fill-surface stroke-fg"} strokeWidth={2} />
                      <text
                        x={q.x + 16}
                        y={q.y + dy}
                        className={`font-display ${city.lived ? "fill-fg" : "fill-fg-2"}`}
                        style={{ fontSize: 32, fontStretch: "78%" }}
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem] text-fg-2">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-fg" /> Vécu sur le terrain
                </span>
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full border-2 border-fg" /> Préparé sur sources
                </span>
              </figcaption>
            </figure>

            {/* A few words */}
            <dl className="grid content-start gap-px self-start overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-2 lg:col-span-6">
              <div className="bg-surface p-5 md:p-6">
                <dt className="label text-fg-2">
                  {founder.field.label} · {founder.field.year}
                </dt>
                <dd className="mt-3 font-display font-semicond text-h3 leading-tight">
                  {founder.field.cities.map((c) => (
                    <span key={c} className="block">
                      {c}
                    </span>
                  ))}
                </dd>
                <dd className="mt-3 text-[0.88rem] leading-snug text-fg-2">{founder.field.detail}</dd>
              </div>
              <div className="bg-surface p-5 md:p-6">
                <dt className="label text-fg-2">{founder.destinations.label}</dt>
                <dd className="mt-3 font-display font-semicond text-h3 leading-tight text-fg-2">
                  {founder.destinations.cities.map((c) => (
                    <span key={c} className="block">
                      {c}
                    </span>
                  ))}
                </dd>
                <dd className="mt-3 text-[0.88rem] leading-snug text-fg-2">{founder.destinations.detail}</dd>
              </div>
              <div className="bg-surface p-5 md:p-6">
                <dt className="label text-fg-2">{founder.russian.label}</dt>
                <dd className="mt-3 flex items-baseline gap-3">
                  <span className="font-display text-[clamp(2.6rem,5vw,3.6rem)] leading-none font-medium">{founder.russian.level}</span>
                  <span className="text-fg-2">{founder.russian.name}</span>
                </dd>
                <dd className="mt-3 text-[0.88rem] leading-snug text-fg-2">{founder.russian.detail}</dd>
              </div>
              <div className="bg-surface p-5 md:p-6">
                <dt className="label text-fg-2">{founder.sport.label}</dt>
                <dd className="mt-3 font-display font-semicond text-h3 leading-tight">{founder.sport.disciplines.join(" · ")}</dd>
                <dd className="mt-3 text-[0.88rem] leading-snug text-fg-2">
                  {founder.sport.focus} {founder.sport.detail}
                </dd>
              </div>
            </dl>
          </div>

          {/* Why */}
          <div className="mt-20 grid gap-8 border-t border-line pt-12 md:mt-28 lg:grid-cols-12">
            <p className="label text-fg-2 lg:col-span-3">{founder.why.label}</p>
            <div className="lg:col-span-8">
              <p className="max-w-[24ch] font-display text-h2">{founder.why.lead}</p>
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-fg-2">
                {founder.why.not.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </p>
              <p className="mt-6 max-w-[58ch] text-lead">{founder.why.body}</p>
              <p className="mt-10 flex items-center gap-4 font-display-italic text-quote italic">
                <span aria-hidden="true" className="h-px w-10 shrink-0 bg-route" />
                {founder.why.signature}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
