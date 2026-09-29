import { Wordmark } from "@/components/brand/Wordmark";
import { officialAdvice, site } from "@/data/site";
import { formatDate } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer data-surface="snow" className="bg-surface text-fg">
      <div className="gutter mx-auto grid max-w-[1440px] gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-6">
          <span className="text-[1.75rem]">
            <Wordmark />
          </span>
          <p className="mt-8 max-w-[22ch] font-display-italic text-quote italic">{site.signature}</p>
          <p className="label mt-6 text-fg-2">{site.descriptor}</p>
        </div>

        <div className="grid content-start gap-5 text-[0.9375rem] text-fg-2 md:col-span-5 md:col-start-8">
          <p className="text-fg">{site.legalStatus}</p>
          <p>
            {officialAdvice.summary}{" "}
            <a
              href={officialAdvice.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-route"
            >
              Lire la fiche {officialAdvice.source}
            </a>{" "}
            <span className="whitespace-nowrap">(consultée le {formatDate(officialAdvice.checkedAt)})</span>.
          </p>
          <p>
            Les informations administratives évoluent souvent. Vérifiez-les toujours auprès des autorités compétentes avant
            de partir.
          </p>
        </div>
      </div>

      <div className="gutter mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 border-t border-line py-6">
        <span className="label text-fg-2">© 2026 Verste</span>
        <span className="label text-fg-2" lang="ru">
          Верста · 1&#8239;067&nbsp;м
        </span>
      </div>
    </footer>
  );
}
