@AGENTS.md

# VERSTE

Site de préparation de voyages en Russie (travel planner indépendant). Sources de vérité : `docs/01-dossier-fondateur.html` (stratégie), `docs/02-fondations-v1.md` (marque, design system, plan V1, journal d'implémentation), `docs/03-audit.md` (audits), `docs/04-v2-experience-immersive.md` (cadrage V2), `docs/05-inventaire-medias.md` (médias) et `docs/06-v2.2-monde-interactif.md` (architecture Scène / Portail / Destination / Trajet). Mettre à jour le journal du §10 à chaque incrément.

## Règles non négociables

- Modèle juridique : « Nous préparons. Vous réservez. » Ne jamais présenter Verste comme une agence de voyages, ni promettre de réservation ou d'encaissement pour le compte du client.
- Contexte 2026 : ne jamais cacher l'avis du Quai d'Orsay ; dater et sourcer toute information pratique ; distinguer *Officiel*, *Terrain* et *Conseil Verste*.
- Ne jamais promettre WhatsApp (bloqué en Russie depuis février 2026) ; l'assistance et le carnet doivent tolérer une connexion dégradée.
- Aucun témoignage, chiffre ou fait biographique inventé. Tout média déclare `kind: "verste" | "illustrative"` dans `data/media.ts`.
- Aucun média publié ne garde ses métadonnées : les originaux du fondateur contiennent le GPS de son logement. Les originaux ne sont jamais commités (`media-src/` ignoré) ; un lieu ne se déduit jamais d'un EXIF.
- Toute distance affichée est calculée (`lib/geo.ts`, `lib/travel/geo.ts`) et libellée.
- Données personnelles : ne jamais envoyer d'e-mail, de nom, d'adresse ni aucune donnée personnelle à une API externe (géocodage, tuiles, recherche, analytics) ; une requête de géocodage ne contient que la recherche géographique, avec un User-Agent générique. Aucune donnée personnelle dans les URL, les logs ou les événements d'analytics.

## Design system

- Couleurs via les surfaces : chaque scène pose `data-surface` (night, midnight, russian, frost, snow) et les composants n'utilisent que `text-fg`, `text-fg-2`, `border-line`, `bg-route`, `text-on-route`. Jamais de primitive pour du texte.
- Le rouge (`route`) est réservé à la route, à l'action principale et au focus : ≤ 5 % de l'écran, jamais en fond de section.
- Tout mot cyrillique porte `lang="ru"`.
- Polices : `font-display` (+ `font-cond` / `font-semicond`), `font-display-italic`, `font-sans`, `font-mono` / utilitaire `label`.
- Animations : état de repos = état final ; respecter `prefers-reduced-motion` (variante `still:` pour les scènes épinglées) ; Motion via `motion/react-m` (composants `m`), qui ne fonctionnent que sous `MotionProvider` (LazyMotion, déjà dans le layout). Vérifier chaque animation dans le navigateur après modification.
- `VerstPost` est `relative` : le positionner via une enveloppe, jamais via `className`.
- Pages sur fond clair : l'en-tête est opaque automatiquement hors de l'accueil.
- Contenu dans `data/`, logique pure dans `lib/`, Server Components par défaut.

## Commandes

- `npm run dev` · `npm run build` · `npm test` (moteur du configurateur) · `npx eslint .` · `npx tsc --noEmit` (après `npx next typegen` si `LayoutProps`/`PageProps` sont introuvables)
- Le projet est dans OneDrive : le cache compilateur Turbopack est désactivé exprès (`next.config.ts`).
