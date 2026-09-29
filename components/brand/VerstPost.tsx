type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-6 w-[5px]",
  md: "h-10 w-[7px]",
  lg: "h-16 w-[10px]",
};

/**
 * The striped verst post that lined imperial Russian roads, one per verste.
 * Five segments in the current text colour, capped with the route colour.
 * It is `relative` itself: position it through a wrapper, not className.
 */
export function VerstPost({ size = "md", className = "" }: { size?: Size; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block shrink-0 border-[1.5px] border-current ${sizes[size]} ${className}`}
      style={{ background: "repeating-linear-gradient(to bottom, currentColor 0 20%, transparent 20% 40%)" }}
    >
      <span className="absolute -inset-x-[1.5px] -top-[5px] h-[3px] bg-route" />
    </span>
  );
}
