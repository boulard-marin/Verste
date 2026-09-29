/**
 * Every visual on the site declares where it comes from. The badge shown next
 * to it is derived from `kind`, so an illustration can never pass for a field
 * photograph. Goal: the share of `verste` media grows with every release.
 */
export type MediaKind = "verste" | "illustrative";

export type Media = {
  kind: MediaKind;
  caption: string;
  alt: string;
  src?: string;
  poster?: string;
  credit?: string;
};

export const heroMedia: Media = {
  kind: "illustrative",
  caption: "Moscou vue du ciel, la nuit. Anneaux routiers réels, rendu génératif.",
  alt: "",
};
