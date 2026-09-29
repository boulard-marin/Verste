import { VerstPost } from "./VerstPost";

/**
 * Scene marker: a verst post and the scene's place in the journey
 * ("Верста 04 · Destinations"). The numbering follows the page order.
 */
export function SceneMarker({ index, label, className = "" }: { index: number; label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <VerstPost />
      <p className="label text-fg-2">
        <span lang="ru" className="text-route">
          Верста {String(index).padStart(2, "0")}
        </span>{" "}
        · {label}
      </p>
    </div>
  );
}
