type Props = {
  ru: string;
  fr: string;
  as?: "h2" | "h3" | "p" | "span";
  size?: "display" | "title" | "compact";
  align?: "start" | "end";
  className?: string;
};

const ruSizes = {
  display: "text-display-l",
  title: "text-h1",
  compact: "text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[0.95]",
};

/**
 * The two-alphabet signature: Cyrillic name in condensed capitals, French
 * name underneath in mono. The Cyrillic is always the real place name and is
 * tagged lang="ru" so screen readers pronounce it.
 */
export function BilingualName({ ru, fr, as: Tag = "p", size = "title", align = "start", className = "" }: Props) {
  return (
    <Tag className={`flex flex-col ${align === "end" ? "items-end text-right" : "items-start"} ${className}`}>
      <span lang="ru" className={`font-display font-cond font-medium uppercase ${ruSizes[size]}`}>
        {ru}
      </span>
      <span className="label mt-[0.9em] text-fg-2">{fr}</span>
    </Tag>
  );
}
