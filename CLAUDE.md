@AGENTS.md

# VERSTE

Site de préparation de voyages en Russie (travel planner indépendant). Sources de vérité : `docs/01-dossier-fondateur.html` (stratégie) et `docs/02-fondations-v1.md` (marque, design system, plan V1, journal d'implémentation). Mettre à jour le journal du §10 à chaque incrément.

## Règles non négociables

- Modèle juridique : « Nous préparons. Vous réservez. » Ne jamais présenter Verste comme une agence de voyages, ni promettre de réservation ou d'encaissement pour le compte du client.
- Contexte 2026 : ne jamais cacher l'avis du Quai d'Orsay ; dater et sourcer toute information pratique ; distinguer *Officiel*, *Terrain* et *Conseil Verste*.
- Ne jamais promettre WhatsApp (bloqué en Russie depuis février 2026) ; l'assistance et le carnet doivent tolérer une connexion dégradée.
- Aucun témoignage, chiffre ou fait biographique inventé. Tout média déclare `kind: "verste" | "illustrative"` dans `data/media.ts`.
- Toute distance affichée est calculée (`lib/geo.ts`) et libellée.

## Design system

- Couleurs via les surfaces : chaque scène pose `data-surface` (night, midnight, russian, frost, snow) et les composants n'utilisent que `text-fg`, `text-fg-2`, `border-line`, `bg-route`, `text-on-route`. Jamais de primitive pour du texte.
- Le rouge (`route`) est réservé à la route, à l'action principale et au focus : ≤ 5 % de l'écran, jamais en fond de section.
- Tout mot cyrillique porte `lang="ru"`.
- Polices : `font-display` (+ `font-cond` / `font-semicond`), `font-display-italic`, `font-sans`, `font-mono` / utilitaire `label`.
- Animations : état de repos = état final ; respecter `prefers-reduced-motion` (variante `still:` pour les scènes épinglées) ; Motion via `motion/react-m` pour rester léger.
- Contenu dans `data/`, logique pure dans `lib/`, Server Components par défaut.

## Commandes

- `npm run dev` · `npm run build` · `npx eslint .` · `npx tsc --noEmit` (après `npx next typegen` si `LayoutProps` est introuvable)
