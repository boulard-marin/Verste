import type { Media } from "./media";
import type { Fact } from "./cities";

/**
 * Founder section. Nothing here may be invented: every field stays null
 * until the founder provides it. While `ready` is false the scene renders
 * only in development, with visible placeholders.
 */
export const founder: {
  ready: boolean;
  name: string | null;
  portrait: Media | null;
  story: string | null;
  facts: Fact[];
} = {
  ready: false,
  name: null,
  portrait: null,
  story: null,
  facts: [
    { label: "Séjours en Russie", value: null },
    { label: "Villes connues de l'intérieur", value: null },
    { label: "Niveau de russe", value: null },
    { label: "Lutte, sambo", value: null },
    { label: "Pourquoi Verste", value: null },
  ],
};
