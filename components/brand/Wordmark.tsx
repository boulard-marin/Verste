/**
 * VERSTE logo system — « La borne ».
 *
 * The verst post (the striped milepost of old Russian roads) carries a red
 * cap: the direction. The word is set tighter and heavier than before so the
 * brand reads in the first second, on dark and light surfaces alike. Sized in
 * em: set the font size on the parent and everything scales together.
 *
 * - `post`: the milepost symbol (default on)
 * - `route`: the red line leaving the post — distance and direction (lockups)
 * - `coords`: the kilometre-zero coordinates (large lockups, video)
 * - `animate`: the cap drops and the line draws once, on load
 */
export function Wordmark({
  className = "",
  post = true,
  route = false,
  coords = false,
  animate = false,
}: {
  className?: string;
  post?: boolean;
  route?: boolean;
  coords?: boolean;
  animate?: boolean;
}) {
  return (
    <span className={`inline-flex flex-col leading-none ${animate ? "logo-animate" : ""} ${className}`}>
      <span className="inline-flex items-center gap-[0.42em]">
        {post && <VerstPostMark className="h-[1.18em] w-auto shrink-0" />}
        <span className="logo-word font-display font-cond font-semibold tracking-[0.12em] text-fg">VERSTE</span>
      </span>
      {route && (
        <span aria-hidden="true" className="logo-route relative mt-[0.3em] block h-[0.06em] min-h-[2px] origin-left bg-route">
          <span className="absolute top-1/2 right-0 h-[0.34em] w-[0.06em] min-w-[2px] -translate-y-1/2 bg-route" />
        </span>
      )}
      {coords && (
        <span className="mt-[0.45em] font-mono text-[0.2em] tracking-[0.2em] whitespace-nowrap text-fg-2 uppercase">
          55°45′ N · 37°37′ E · km 0
        </span>
      )}
    </span>
  );
}

/** The milepost alone: favicon, avatar, loading mark. */
export function VerstPostMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 34" aria-hidden="true" className={className} fill="none">
      <rect className="logo-cap" x="1" y="0" width="10" height="4.2" fill="var(--route)" />
      <rect x="2" y="6.2" width="8" height="27" stroke="currentColor" strokeWidth="1.6" className="text-fg" />
      <rect x="2" y="6.2" width="8" height="5.4" fill="currentColor" className="text-fg" />
      <rect x="2" y="17" width="8" height="5.4" fill="currentColor" className="text-fg" />
      <rect x="2" y="27.8" width="8" height="5.4" fill="currentColor" className="text-fg" />
    </svg>
  );
}
