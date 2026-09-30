/**
 * VERSTE logo system — « La borne », V3.
 *
 * Read in the first second: the word is extra-bold, condensed and tightly
 * set; the verst post (the striped milepost of old Russian roads) stands
 * beside it with its red cap, the only red of the logo. The full lockup adds
 * the red verste line and the RUSSIA TRAVEL signature under the word.
 * Sized in em: set the font size on the parent and everything scales. Colours
 * come from the surface (text-fg), so the same component is the light and
 * the dark version.
 *
 * - `post`: the milepost symbol (default on)
 * - `tagline`: red line + RUSSIA TRAVEL under the word (lockups, hero, footer)
 * - `coords`: the kilometre-zero coordinates (large lockups, video)
 * - `animate`: the cap drops, the word settles and the line draws, once
 */
export function Wordmark({
  className = "",
  post = true,
  tagline = false,
  coords = false,
  animate = false,
}: {
  className?: string;
  post?: boolean;
  tagline?: boolean;
  coords?: boolean;
  animate?: boolean;
}) {
  return (
    <span
      className={`inline-grid grid-cols-[auto_auto] items-center gap-x-[0.34em] leading-none ${animate ? "logo-animate" : ""} ${className}`}
    >
      {post && (
        <VerstPostMark className={`w-auto shrink-0 ${tagline || coords ? "row-span-2 h-[1.7em] self-stretch" : "h-[1.24em]"}`} />
      )}
      <span className={`logo-word font-display font-cond font-extrabold tracking-[0.06em] text-fg ${post ? "" : "col-span-2"}`}>
        VERSTE
      </span>
      {(tagline || coords) && (
        <span className={`mt-[0.28em] flex items-center gap-[0.55em] self-start ${post ? "" : "col-span-2"}`}>
          <span aria-hidden="true" className="logo-route block h-[0.075em] min-h-[2px] w-[1.25em] origin-left bg-route" />
          <span className="font-mono text-[0.22em] font-medium tracking-[0.32em] whitespace-nowrap text-fg-2 uppercase">
            {coords ? "55°45′ N · 37°37′ E · km 0" : "Russia Travel"}
          </span>
        </span>
      )}
    </span>
  );
}

/** The milepost alone: favicon, avatar, loading mark. */
export function VerstPostMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 34" aria-hidden="true" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <rect className="logo-cap" x="0.5" y="0" width="11" height="5" fill="var(--route)" />
      <rect x="1.9" y="7.1" width="8.2" height="25.9" stroke="currentColor" strokeWidth="1.9" className="text-fg" />
      <rect x="1.9" y="7.1" width="8.2" height="6.5" fill="currentColor" className="text-fg" />
      <rect x="1.9" y="20" width="8.2" height="6.5" fill="currentColor" className="text-fg" />
    </svg>
  );
}
