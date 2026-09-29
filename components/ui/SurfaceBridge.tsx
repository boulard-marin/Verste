type Surface = "night" | "midnight" | "russian" | "frost" | "snow";

const colors: Record<Surface, string> = {
  night: "#0c0f14",
  midnight: "#0b1a33",
  russian: "#1d3b6e",
  frost: "#d5dfea",
  snow: "#f4f6f9",
};

/**
 * Decorative gradient between two scenes: the page changes colour
 * continuously, from night to snow. Dark-to-light bridges pass through steel,
 * which is why they carry no text.
 */
export function SurfaceBridge({ from, to, size = "md" }: { from: Surface; to: Surface; size?: "sm" | "md" | "lg" }) {
  const height = { sm: "h-[clamp(3rem,8vh,6rem)]", md: "h-[clamp(5rem,16vh,10rem)]", lg: "h-[clamp(8rem,32vh,18rem)]" }[size];
  const darkToLight = (from === "night" || from === "midnight") && (to === "frost" || to === "snow");
  const via = darkToLight ? ", #1d3b6e 35%, #5e7c9c 62%" : "";
  return (
    <div
      aria-hidden="true"
      className={height}
      style={{ background: `linear-gradient(to bottom, ${colors[from]}${via}, ${colors[to]})` }}
    />
  );
}
