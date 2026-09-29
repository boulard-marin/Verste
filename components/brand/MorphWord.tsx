import type { CSSProperties } from "react";

/**
 * ВЕРСТА → VERSTE. Six letters in each alphabet: the Cyrillic word fades
 * letter by letter into its Latin transliteration (CSS only, see
 * .morph-ru / .morph-fr in globals.css). Shared letters (Е, Т) barely move,
 * which is the point. Resting state: the Latin word.
 */
export function MorphWord({ ru, fr }: { ru: string; fr: string }) {
  const letters = Array.from(fr);
  const cyrillic = Array.from(ru);
  return (
    <span aria-hidden="true" className="inline-flex">
      {letters.map((ch, i) => (
        <span key={i} className="grid justify-items-center" style={{ "--i": i } as CSSProperties}>
          <span className="morph-fr [grid-area:1/1]">{ch}</span>
          <span lang="ru" className="morph-ru pointer-events-none [grid-area:1/1]">
            {cyrillic[i] ?? ""}
          </span>
        </span>
      ))}
    </span>
  );
}
