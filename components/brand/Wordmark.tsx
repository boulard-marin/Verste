/**
 * VERSTE wordmark with its post glyph. Sized in em: set the font size on the
 * parent (or via className) and everything scales together.
 */
export function Wordmark({ className = "", post = true }: { className?: string; post?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[0.55em] leading-none ${className}`}>
      {post && (
        <span
          aria-hidden="true"
          className="relative inline-block h-[1.05em] w-[0.22em] shrink-0 border-[0.06em] border-current"
          style={{ background: "repeating-linear-gradient(to bottom, currentColor 0 20%, transparent 20% 40%)" }}
        >
          <span className="absolute -inset-x-[0.06em] -top-[0.2em] h-[0.1em] bg-route" />
        </span>
      )}
      <span className="font-display font-cond font-medium tracking-[0.18em]">VERSTE</span>
    </span>
  );
}
