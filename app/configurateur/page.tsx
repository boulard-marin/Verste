import type { Metadata } from "next";

import { VerstPost } from "@/components/brand/VerstPost";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Votre Russie",
  robots: { index: false, follow: false },
};

/** Holding page until phase D (configurator) ships. */
export default function ConfigurateurPage() {
  return (
    <section data-surface="frost" className="flex min-h-[100svh] items-center bg-surface text-fg">
      <div className="gutter mx-auto w-full max-w-[1440px] py-32">
        <div className="flex items-center gap-4">
          <VerstPost />
          <p className="label text-fg-2">Verste 1 / 4 · Votre Russie</p>
        </div>
        <h1 className="mt-8 max-w-[16ch] font-display font-semicond text-h1 font-medium">
          Combien de temps vous donnez-vous&#8239;?
        </h1>
        <p className="mt-6 max-w-[52ch] text-lead text-fg-2">
          Le configurateur arrive dans la prochaine étape de construction : quatre questions pour obtenir un premier
          profil de voyage, sans engagement.
        </p>
        <div className="mt-10">
          <ButtonLink href="/#trajet" variant="secondary">
            Revenir au trajet
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
