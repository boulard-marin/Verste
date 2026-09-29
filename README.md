# VERSTE

Préparation de voyages en Russie. *Chaque voyage commence par une première verste.*

## Démarrer

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:3000.

## Vérifier

```bash
npx eslint .
npx tsc --noEmit
npm run build
```

## Où trouver quoi

- `docs/01-dossier-fondateur.html` : stratégie, nom, direction artistique (phases 1 à 9).
- `docs/02-fondations-v1.md` : marque, design system, plan V1, journal d'implémentation.
- `docs/03-audit.md` : audits successifs, avec ce qui a été corrigé.
- `data/` : tout le contenu éditable (textes, villes, offres, informations datées).
- `components/home/` : une scène de l'accueil par fichier.

## Contenus en attente

Les informations sur le fondateur, les photos et vidéos, le cadre juridique et les prix validés seront fournis plus tard. Tant qu'elles manquent, les emplacements correspondants sont visibles en développement et masqués en production (`components/ui/Pending.tsx`).
