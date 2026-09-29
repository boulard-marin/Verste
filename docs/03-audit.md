# VERSTE — Audits

Chaque audit liste ce qui va, ce qui n'allait pas, ce qui a été corrigé et ce qui reste à surveiller. Le plus récent est en haut.

---

## Audit n° 1 · 29/09/2026 · incrément 1 et nouvelles scènes

**Périmètre** : socle technique, scènes S01 à S03 (incrément 1), puis scènes S04 à S14 construites dans la foulée.
**Méthode** : relecture du code, lint et TypeScript strict, build de production avec mesures, contrôle visuel en mobile (375 px), tablette (768 px) et desktop (1 280 px, par mesures DOM), tests fonctionnels (menu mobile, formulaire du guide, défilements animés).

### Ce qui va

- **Identité** : ВЕРСТА → VERSTE, double alphabet, poteau, ligne rouge et compteur forment un système reconnaissable, fidèle au dossier fondateur.
- **Récit** : le trajet Paris → Istanbul → Moscou raconte une contrainte réelle (pas de vol direct) avec des distances calculées, pas inventées.
- **Juridique** : « Nous préparons. Vous réservez. » apparaît près des offres, le statut est rappelé en pied de page, l'avis du Quai d'Orsay est affiché et daté.
- **Technique** : toutes les pages sont statiques, aucune erreur console, contenus séparés du code dans `data/`, carte calculée au build sans bibliothèque côté navigateur.

### Ce qui n'allait pas, et ce qui a été fait

| # | Gravité | Constat | Correction | Statut |
|---|---|---|---|---|
| 1 | Critique | **Régression.** Les composants légers `m` de Motion n'ont pas de moteur de rendu sans le fournisseur `LazyMotion` : les valeurs animées n'étaient jamais écrites (ligne du trajet, glissement des destinations). Introduite par l'optimisation de poids de l'incrément 1, qui n'avait pas été revérifiée sur toutes les scènes. | `MotionProvider` (`LazyMotion` + `domMin`, mode strict qui interdit les composants lourds). | Corrigé, vérifié |
| 2 | Élevée | Le badge « Image illustrative » du hero était masqué sur mobile, contrairement à la règle « jamais omis ». | Visible sur toutes les tailles. | Corrigé |
| 3 | Élevée | Les boutons du hero n'étaient visibles qu'après ~3,2 s. | Visibles en moins de 2 s. | Corrigé |
| 4 | Élevée | OneDrive synchronisait en continu `node_modules` (517 Mo, 26 882 fichiers) et 183 Mo de caches `.next`. | Cache compilateur Turbopack désactivé (dev et build), `.next` nettoyé. `node_modules` reste, pour garder la sauvegarde OneDrive du projet. | Atténué |
| 5 | Moyenne | Aucun texte visible au-dessus de la ligne de flottaison ne disait « voyages en Russie » (référencement, clarté). | Sur-titre « Travel planner · Voyages en Russie, préparés sur mesure ». La définition de la verste passe à la fin du manifeste. | Corrigé |
| 6 | Moyenne | Le halo des lumières de Moscou était flouté en pleine résolution : coûteux sur les téléphones à haute densité. | Flou calculé sur une copie au quart de la résolution. | Corrigé |
| 7 | Moyenne | Scène du trajet : lecture de la mise en page à chaque image du défilement, typage contourné (`as never`), indicateur d'arrivée non mis à jour sur grand écran, libellés de carte lus en double par les lecteurs d'écran. | Tailles mises en cache (ResizeObserver), variable CSS posée proprement, indicateur corrigé, carte masquée aux lecteurs d'écran (la narration reste lue). Hauteur réduite de 430 à 380 vh. | Corrigé |
| 8 | Moyenne | Tablette : le compteur du trajet était écrasé dans une colonne étroite. | Mise en page compacte jusqu'à 1 024 px. | Corrigé |
| 9 | Moyenne | Aucun en-tête de sécurité HTTP. | `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS. La politique CSP (avec nonce) viendra en phase J. | Corrigé |
| 10 | Faible | L'adresse publique retombait sur `localhost` si la variable manquait (métadonnées fausses en production). | Repli sur l'adresse de production Vercel. | Corrigé |
| 11 | Faible | Pas de `.env.example`, pas de README, fins de ligne non normalisées, aucun commit. | Ajoutés. Historique Git en place. | Corrigé |

### Défauts trouvés dans les nouvelles scènes, corrigés avant commit

- Le poteau recevait `absolute` par sa `className`, mais la classe `relative` du composant l'emportait : il occupait une cellule de grille et cassait la section « Problème » (2 808 px de haut). Positionnement par une enveloppe : 2 102 px.
- Le motif du métro passait sous les données de Moscou. Les données sont maintenant dans un bandeau sous le visuel.
- Le rail des destinations ne glissait pas (même cause que la régression n° 1, plus une valeur qui ne se rattachait pas après l'hydratation). La valeur est désormais toujours liée et activée selon l'écran.
- Des coches rouges décoratives dans « Nous préparons » : passées en couleur de texte. Le rouge reste la route et l'action.
- Quatre boutons rouges dans les offres : passés en secondaires, un seul appel principal par écran.

### Mesures après corrections (build de production)

| Poste | Mesure | Commentaire |
|---|---|---|
| JavaScript | 185 Ko gzip | Socle Next 16 + React ≈ 131 Ko, notre code ≈ 54 Ko : budget (≤ 60 Ko) respecté. |
| Polices préchargées | 202 Ko | 4 fichiers. |
| HTML de l'accueil | 38 Ko gzip (221 Ko brut) | 14 scènes plus la charge RSC. À surveiller. |
| Pages | toutes statiques | — |
| Production | sans « À compléter » ni section fondateur | Les emplacements en attente n'existent qu'en développement. |

### Grille qualité de l'accueil complet

| Critère | Évaluation |
|---|---|
| Design | Cohérent de bout en bout : surfaces, double alphabet, poteaux, ligne rouge. |
| Émotion | Forte au début (hero, trajet, manifeste). La fin repose sur la clarté plus que sur l'image : normal tant qu'il n'y a pas de photos. |
| Russie | Perceptible partout : cyrillique réel, carte, plan de Moscou, noms de lieux. |
| Premium | Typographie et rythme au niveau. Les photos de terrain manquent pour franchir le dernier palier. |
| UX | On comprend quoi faire. **Point faible** : tous les appels « Construire mon voyage » mènent encore à une page d'attente. |
| Conversion | Guide gratuit fonctionnel (validation serveur), offres claires. L'envoi réel du guide attend Resend (phase F). |
| Confiance | Contexte daté et sourcé, modèle expliqué, aucun avis inventé. La section fondateur manque en production. |
| Juridique | Conforme au modèle défini. Pages légales à créer (phase G). |
| Performance | Budgets tenus. Lighthouse à passer sur un déploiement réel. |

### Points de vigilance

- **Priorité suivante** : le configurateur (phase D). C'est le point de conversion central et le seul trou du parcours.
- Longueur de l'accueil sur mobile (~26 000 px) : chaque future scène doit en remplacer une, pas s'ajouter.
- Les informations « Terrain » de « Russie aujourd'hui » viennent de sources publiques (presse, OONI) : à confirmer ou remplacer par votre expérience.
- Les temps de trajet des destinations sont indicatifs.
- Le mouvement réduit n'est pas émulable dans l'outil de prévisualisation : vérifié par relecture du code et du CSS compilé.
- L'outil de capture d'écran coupe le quart droit des pages larges : les contrôles desktop ont été faits par mesures DOM, pas à l'œil.
