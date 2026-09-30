import type { Metadata } from "next";

import { Composer } from "@/components/configurator/Composer";
import { configuratorCities } from "@/lib/configurator/cities";
import { parseAnswers } from "@/lib/configurator/params.ts";
import { getComposerAtlas } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Construire votre Russie",
  description: "Une durée, quelques envies : les villes, les jours et les trajets de votre voyage en Russie se composent sous vos yeux, sans engagement.",
  robots: { index: false, follow: true },
};

/** Too far east for the atlas: pointed at from its edge. */
const BEYOND = ["baikal"] as const;

/**
 * Phase D, V3 · the configurator as a visual intelligence. The composition
 * runs in the browser (lib/configurator/compose.ts); the page stays a real
 * GET form, answers carried in the URL (shareable, back button, no JS).
 */
export default async function ConfigurateurPage({ searchParams }: PageProps<"/configurateur">) {
  const answers = parseAnswers(await searchParams);
  const cities = Object.entries(configuratorCities).map(([id, c]) => ({ id, coords: c.coords }));
  const atlas = getComposerAtlas(
    cities.filter((c) => !BEYOND.includes(c.id as (typeof BEYOND)[number])),
    cities.filter((c) => BEYOND.includes(c.id as (typeof BEYOND)[number])),
    configuratorCities.moscou.coords,
  );

  return (
    <section data-surface="frost" className="min-h-[100svh] bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1440px] pt-28 pb-24 md:pt-36">
        <p className="label text-fg-2">
          <span lang="ru" className="text-route">
            Верста
          </span>{" "}
          · Construire
        </p>
        <h1 className="mt-4 max-w-[16ch] font-display text-h1">Votre Russie se compose.</h1>
        <p className="mt-4 max-w-[46ch] text-lead text-fg-2">Une durée, quelques envies : les villes, les jours et les trajets se placent d&apos;eux-mêmes.</p>
        <div className="mt-12 md:mt-16">
          <Composer atlas={atlas} initial={answers} />
        </div>
      </div>
    </section>
  );
}
