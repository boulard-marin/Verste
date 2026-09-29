import type { SourceKind } from "@/data/russia-today";

const labels: Record<SourceKind, string> = {
  officiel: "Officiel",
  terrain: "Terrain",
  conseil: "Conseil Verste",
};

/**
 * Says what kind of information follows. Three distinct shapes, so the
 * distinction does not rely on colour: filled square (official source),
 * hollow circle (observed on the ground), striped post (our advice).
 */
export function SourceTag({ kind, className = "" }: { kind: SourceKind; className?: string }) {
  return (
    <span className={`label inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-fg-2 ${className}`}>
      {kind === "officiel" && <span aria-hidden="true" className="size-2 bg-current" />}
      {kind === "terrain" && <span aria-hidden="true" className="size-2 rounded-full border border-current" />}
      {kind === "conseil" && (
        <span
          aria-hidden="true"
          className="h-3 w-[5px] border border-current"
          style={{ background: "repeating-linear-gradient(to bottom, currentColor 0 25%, transparent 25% 50%)" }}
        />
      )}
      {labels[kind]}
    </span>
  );
}
