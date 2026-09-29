import type { MediaKind } from "@/data/media";

/**
 * States where a visual comes from. Filled dot: field photograph by Verste.
 * Hollow dot: illustration. Never omitted.
 */
export function PhotoBadge({ kind, caption, className = "" }: { kind: MediaKind; caption: string; className?: string }) {
  return (
    <p className={`flex items-baseline gap-2 text-fg-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block size-[7px] shrink-0 translate-y-[-1px] rounded-full border border-current ${kind === "verste" ? "bg-current" : ""}`}
      />
      <span className="label shrink-0">{kind === "verste" ? "Photographie VERSTE" : "Image illustrative"}</span>
      <span className="text-[0.8rem] leading-snug">{caption}</span>
    </p>
  );
}
