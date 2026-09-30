# VERSTE — Fondations V1

> Rédigé le 29 septembre 2026. Ce document fait évoluer le [Dossier fondateur](01-dossier-fondateur.html) sans le remplacer : tout ce qui n'est pas modifié ici reste valable.
>
> *Chaque voyage commence par une première verste.*

---

## 1. Audit du Dossier fondateur

### Ce qui tient

| Sujet | Décision confirmée |
|---|---|
| Nom | **VERSTE** (верста, ≈ 1,07 km). Présent dans le Larousse, lisible en français et en russe. |
| Direction artistique | **De la nuit à l'aube.** Le scroll est un trajet : nuit → minuit → bleu → givre → neige. |
| Rouge | Fonctionnel uniquement : la route, l'action principale, le focus. ≤ 5 % de la surface. |
| Signature | **La ligne verste** : trait carmin, poteaux rayés noir/blanc, compteur de distance. |
| Typographie | Noto Serif Display (titres), Geist (interface), Geist Mono (données). Cyrillique vérifié sur les trois. |
| Modèle juridique | Préparation de voyage et conseil. Pas d'agence, pas de réservation ni d'encaissement pour compte. |
| Paiement | Stripe Checkout pour les honoraires uniquement, après accord écrit de Stripe. Virement SEPA en secours. |
| Contexte 2026 | Avis formel du Quai d'Orsay (10/09/2026), WhatsApp bloqué, Telegram restreint, Internet mobile instable, eVisa 30 jours. |
| Contenus pratiques | Toujours datés et sourcés. |
| Stratégie | MVP d'abord, espace client plus tard. |

### Ce qui évolue, et pourquoi

| Sujet | Dossier | V1 | Pourquoi |
|---|---|---|---|
| Phrase du hero | « Le pays que vous croyez connaître. » | « Un pays immense. Un chemin clair. » | Seule en haut de page, la première phrase peut se lire comme « les médias vous mentent sur la Russie », un argument classique de la communication d'État. Elle reste excellente **dans** le manifeste, où le texte l'encadre. Voir §3. |
| Structure de l'accueil | 11 sections | 14 scènes en 5 actes | Le nouveau brief demande un rythme de film. Ajouts : scène du trajet, Moscou, Russie aujourd'hui, Carnet, fondateur. |
| Distance affichée | ≈ 3 995 km (approximation entre centres-villes) | **3 964 km**, calculés au build | Orthodromie entre les aéroports CDG → IST (2 214 km) → SVO (1 751 km), calculée à partir des coordonnées et libellée « à vol d'oiseau ». Aucune donnée présentée comme réelle n'est approximée à la main. |
| Produit d'appel | « Les 25 choses à savoir » | **La Première Verste** — les 25 choses à savoir avant de partir en Russie | Le guide gratuit *est* la première verste : il incarne la signature de marque. |
| Formulaires | React Hook Form + Zod | Formulaires natifs + Server Actions + `useActionState` + Zod | Un champ e-mail et un formulaire de contact ne justifient pas 14 Ko de JavaScript. Les formulaires marchent même sans JavaScript. |
| Composants | shadcn/ui + Radix | Radix directement | Nous restylons tout : la CLI shadcn apporterait `cva`, `tailwind-merge` et `clsx` sans bénéfice. On garde ses conventions de fichiers. |
| Carrousel | Embla | CSS `scroll-snap` d'abord | Le défilement au doigt natif suffit pour les destinations. Embla reste disponible si besoin. |
| Stockage des leads | Supabase | Contacts Resend | Aucune base de données nécessaire en V1. Supabase arrive avec l'espace client. |
| Analytics | Vercel Analytics | Couche `track()` + fournisseur à choisir en phase I | Les événements personnalisés de Vercel Analytics exigent l'offre Pro. La couche d'abstraction permet de câbler les événements dès maintenant. |
| Configurateur, étape 1 | — | « Combien de temps vous donnez-vous ? » | Le brief propose « Combien de temps voulez-vous disparaître ? ». Pour la Russie de 2026, où le Quai d'Orsay évoque des détentions arbitraires, « disparaître » porte un double sens malheureux. |
| Configurateur, confort | Économique | **Essentiel** | Repris du nouveau brief : plus juste, moins dévalorisant. |
| Configurateur, profils | 8 profils | 9 : « Sambo » séparé de « Sport / lutte » | Repris du nouveau brief. |

### Ce qui manque vraiment (rien de bloquant pour l'accueil)

| Information | Où elle sert | En attendant |
|---|---|---|
| Votre parcours : séjours (nombre, années, villes), niveau de russe, pratique de la lutte ou du sambo, comment la Russie est entrée dans votre vie | Scène « Qui se cache derrière Verste ? », page À propos | Section construite avec des emplacements visibles en développement, masqués en production. **Rien n'est inventé.** |
| Photos et vidéos personnelles | Hero, Moscou, fondateur, Carnet | Illustration générative « Moscou vue du ciel, la nuit » (plan radioconcentrique réel de la ville), étiquetée *Image illustrative*. Chaque média porte un badge : *Photographie VERSTE* ou *Image illustrative*. |
| Statut juridique, SIRET, adresse, RC Pro | Mentions légales, CGV, checkout | Pages légales préparées en phase G avec des champs à compléter. |
| Accord de Stripe | Phase G | Checkout en mode test, désactivé par défaut. |
| Validation des prix (240 / 420 / 690 / +190 €) | Offres | Prix stockés dans `data/offers.ts`, modifiables en une ligne. |
| Fourchettes de budget sur place, par niveau de confort | Scène Moscou, résultat du configurateur | Affichées « à calibrer » tant que vos données de terrain ne sont pas fournies. |
| Nom de domaine | SEO, e-mails | `verste.fr` semblait libre au 29/09/2026 : à réserver. |

---

## 2. Architecture de marque

### Niveaux

| Niveau | Contenu |
|---|---|
| Marque | **VERSTE** · *Верста* |
| Descripteur | Préparation de voyages en Russie · *Travel Planner Russie* |
| Signature | **Chaque voyage commence par une première verste.** |
| Positionnement | **Nous préparons. Vous voyagez.** |
| Promesse juridique | **Nous préparons. Vous réservez.** (accompagne toujours le positionnement près des offres et du paiement) |
| Hero | **Un pays immense. Un chemin clair.** |

### Système de noms

Tout ce que Verste produit porte un nom tiré du voyage et de la distance. Les noms restent en français courant, sans jeu de mots forcé.

| Élément | Nom |
|---|---|
| Guide gratuit | **La Première Verste** |
| Livrable après achat | **Le Carnet Verste** |
| Hub pratique | **Les Clés** · *Ключи* |
| Page de transparence | **Russie aujourd'hui** |
| Résultat du configurateur | **Votre Russie** |
| Offres | Découverte · Immersion · Grand format · + Conciergerie |
| Journal éditorial | **Le Journal** |

### Vocabulaire de la verste

- Une **verste** est une étape. Le configurateur avance « Verste 1 / 4 ». Dans le carnet, chaque journée ou chaque ville est une verste.
- Un **poteau** marque le début d'une scène, avec son numéro et un repère réel (coordonnées, distance).
- La **ligne** relie tout : destinations, étapes du configurateur, journées du carnet.
- La **distance** affichée est toujours réelle, calculée et libellée (« à vol d'oiseau », « par le rail »).

### Voix

L'ami expérimenté qui connaît le terrain. Il dit « vous », fait des phrases courtes, donne des faits datés et ne vend jamais plus qu'il ne sait.

| Oui | Non |
|---|---|
| « Vos cartes ne fonctionneront pas. Voici comment payer dès le premier soir. » | « Pas de panique ! On gère tout pour vous 😉 » |
| « Vérifié le 29/09/2026 · source : France Diplomatie » | « Informations toujours à jour » |
| « Nous préparons. Vous réservez. » | « Réservez votre séjour clé en main » |
| « Aucun avis inventé ici. » | « Des centaines de voyageurs satisfaits » |

Mots bannis : exceptionnel, incroyable, unique, clé en main, séjour tout compris, n'attendez plus, dernières places.

### Actifs propriétaires

1. **Mot-symbole** VERSTE en Noto Serif Display condensée, capitales espacées.
2. **Poteau** : glyphe vertical à cinq segments noir/blanc, capuchon carmin. Logo, favicon, marqueur de scène.
3. **Ligne verste** : trait carmin de 1,5 px, dessiné au scroll.
4. **Double alphabet** : cyrillique en capitales condensées au-dessus, français en dessous.
5. **Repères réels** : coordonnées, distances et dates en Geist Mono.
6. **Étiquettes de source** : *Officiel* · *Terrain* · *Conseil Verste*, toujours datées.
7. **Badges photo** : *Photographie VERSTE* · *Image illustrative*.

### Règles du double alphabet

```
МОСКВА                  ← cyrillique, capitales, Noto Serif Display 62,5 %, lang="ru"
MOSCOU                  ← français, Geist Mono capitales espacées (ou serif selon la taille)
55°45′ N · 37°37′ E     ← repère réel, Geist Mono
```

- Le cyrillique est toujours balisé `lang="ru"` pour que les lecteurs d'écran le prononcent correctement.
- Le cyrillique n'est jamais décoratif : c'est toujours le vrai nom du lieu.
- Sur mobile, les noms longs (САНКТ-ПЕТЕРБУРГ) passent sur deux lignes au trait d'union, jamais en réduction illisible.

---

## 3. Signature : test et trois propositions finales

### Grille de test

| Phrase | Propre à Verste | Émotion | Clarté | Risque de lecture politique | Rôle idéal |
|---|---|---|---|---|---|
| Le pays que vous croyez connaître. | Moyen | Fort | Moyen | **Réel** hors contexte | Manifeste, campagne |
| Un pays immense. Un chemin clair. | Fort (le chemin = la ligne) | Fort | Très forte | Nul | **Hero** |
| Chaque voyage commence par une première verste. | Total (contient le nom) | Moyen | Forte | Nul | **Signature** |
| La Russie, verste après verste. | Fort | Moyen | Forte | Faible | Réseaux sociaux, variante courte |
| Nous préparons. Vous voyagez. | Moyen | Faible | Très forte | Nul | Positionnement |
| Il n'y a plus de vol direct. Il y a toujours un chemin. | Fort | Fort | Forte | Faible | Scène du trajet, campagne |
| Voir un pays n'est pas encore le découvrir. | Moyen | Moyen | Forte | Nul | Manifeste |

### Les trois propositions

1. **« Chaque voyage commence par une première verste. »** → **Signature de marque.** Personne d'autre ne peut la dire. Elle parle de progression et d'autonomie, et elle donne son nom au guide gratuit. Elle ferme le site, les e-mails et la couverture du Carnet.
2. **« Un pays immense. Un chemin clair. »** → **Phrase du hero.** En six mots, elle répond à la question fondatrice du projet : donner envie (immense) et rassurer (clair). Elle décrit aussi exactement l'image : un territoire sombre traversé par une ligne rouge.
3. **« Le pays que vous croyez connaître. »** → **Ouverture du manifeste et ligne de campagne.** Précédée de « Vous avez peut-être déjà vu Moscou… », elle parle de la différence entre voir et découvrir, pas de l'actualité.

Le changement tient en une ligne dans `data/site.ts` si vous préférez revenir à la phrase d'origine.

---

## 4. Design System VERSTE

### 4.1 Couleurs

**Primitives**

| Jeton | Nom | Valeur | Usage |
|---|---|---|---|
| `night` | Night · Nuit | `#0C0F14` | Acte I, navigation, vidéo |
| `midnight` | Midnight Blue · Minuit | `#0B1A33` | Actes I–II |
| `russian` | Russian Blue · Bleu Neva | `#1D3B6E` | Acte III, couleur émotionnelle |
| `steel` | Steel · Acier | `#5E7C9C` | Transitions de dégradé, pictos. **Jamais comme surface** (le contraste y est mauvais dans les deux sens). |
| `frost` | Frost · Givre | `#D5DFEA` | Acte IV |
| `snow` | Snow · Neige | `#F4F6F9` | Acte V |
| `ink` | Ink · Encre | `#0D1626` | Texte sur fond clair |
| `carmine` | Carmine · Carmin | `#C21A2E` | La route et l'action, sur fond clair |
| `carmine-signal` | Carmin signal | `#E8485A` | Même rôle sur Nuit et Minuit |
| `carmine-light` | Carmin clair | `#FF6B78` | Même rôle sur Bleu Neva uniquement |

**Surfaces sémantiques.** Chaque scène déclare `data-surface`. Les composants n'utilisent que les jetons sémantiques, jamais les primitives.

| Surface | Fond | `--fg` | `--fg-2` | `--line` | `--route` (carmin) | Contrastes vérifiés |
|---|---|---|---|---|---|---|
| `night` | `#0C0F14` | `#EEF2F8` | `#A9B8CC` | blanc 12 % | `#E8485A` | fg-2 9,5:1 |
| `midnight` | `#0B1A33` | `#EEF2F8` | `#A9B8CC` | blanc 14 % | `#E8485A` | fg-2 8,6:1 · route 4,5:1 |
| `russian` | `#1D3B6E` | `#F4F6F9` | `#C9D5E6` | blanc 18 % | `#FF6B78` | fg-2 7,4:1 · route 4,0:1 (graphique) |
| `frost` | `#D5DFEA` | `#0D1626` | `#3F506A` | encre 14 % | `#C21A2E` | fg-2 6,1:1 · route 4,5:1 |
| `snow` | `#F4F6F9` | `#0D1626` | `#45566E` | encre 12 % | `#C21A2E` | route 5,6:1 |

Passage entre scènes : un dégradé vertical relie la couleur de fin d'une scène à la couleur de début de la suivante. Le fond change donc continûment au scroll, sans JavaScript.

### 4.2 Typographie

| Rôle | Famille | Réglages | Latin | Cyrillique |
|---|---|---|---|---|
| Display | Noto Serif Display | `wdth` 62,5–100, `wght` 100–900, italique | ✓ | ✓ |
| Interface, texte | Geist | `wght` 100–900 | ✓ | ✓ |
| Données | Geist Mono | `wght` 100–900, chiffres tabulaires | ✓ | ✓ |

Servies par `next/font/google` : auto-hébergées, sous-ensembles `latin` + `cyrillic` découpés par `unicode-range`, `font-display: swap`, métriques de repli ajustées (pas de décalage de mise en page).

| Jeton | Taille (fluide) | Famille · réglages |
|---|---|---|
| `display-xl` | `clamp(4.5rem, 17vw, 15rem)` | Display 62,5 %, 500, interlettrage 0,08em |
| `display-l` | `clamp(3.25rem, 11vw, 9.5rem)` | Display 62,5 %, 500 |
| `h1` | `clamp(2.5rem, 6vw, 5rem)` | Display 75 %, 500 |
| `h2` | `clamp(2rem, 4.4vw, 3.75rem)` | Display 80 %, 500 |
| `h3` | `clamp(1.5rem, 2.4vw, 2.125rem)` | Display 100 %, 500 |
| `quote` | `clamp(1.5rem, 3vw, 2.5rem)` | Display italique, 400 |
| `lead` | `clamp(1.125rem, 1.5vw, 1.375rem)` | Geist 350 |
| `body` | `1.0625rem` / 1,65 | Geist 400 |
| `small` | `0.875rem` / 1,5 | Geist 400 |
| `label` | `0.72rem`, capitales, +0,14em | Geist Mono 500 |
| `data` | `0.875rem`, chiffres tabulaires | Geist Mono 400 |

Règles : la largeur condensée ne descend jamais sous 32 px de corps ; le texte courant tient dans 68 caractères ; titres en `text-wrap: balance`.

### 4.3 Espacement et grille

- Base 4 px : `1`=4 · `2`=8 · `3`=12 · `4`=16 · `6`=24 · `8`=32 · `12`=48 · `16`=64 · `24`=96 · `32`=128 · `48`=192.
- Gouttières : 16 px (mobile), 24 px (tablette), 48 px (desktop). Largeur de contenu max 1 280 px.
- Grille : 4 colonnes (mobile), 8 (tablette), 12 (desktop).
- Rythme vertical des scènes : `clamp(6rem, 14vh, 12rem)`.

### 4.4 Rayons, ombres, bordures

- Rayons : `0` par défaut · `2px` (boutons, champs) · `4px` (médias, cartes) · plein (points). Rien de plus rond.
- Ombres : aucune sur fond sombre (la profondeur vient de la lumière) ; sur fond clair, `0 16px 40px -24px rgb(11 26 51 / .28)` pour les objets posés (carnet, cartes d'offre).
- Bordures : 1 px, couleur `--line`. Les séparateurs sont des filets, pas des blocs.

### 4.5 Motion

| Jeton | Durée | Courbe | Usage |
|---|---|---|---|
| `fast` | 160 ms | `cubic-bezier(.22,1,.36,1)` | Survol, focus, pression |
| `base` | 320 ms | idem | Menus, changements d'état |
| `slow` | 700 ms | idem | Apparitions |
| `cinematic` | 1 400 ms | `cubic-bezier(.65,0,.35,1)` | Entrée du hero, transitions de scène |
| scroll | — | linéaire | Tout ce qui est lié au scroll suit le doigt, sans ressort |

Règles : une seule animation orchestrée par scène ; uniquement `transform` et `opacity` ; rien ne reste invisible si le JavaScript ne charge pas ; avec `prefers-reduced-motion`, chaque animation affiche directement son état final et Lenis est coupé.

### 4.6 Composants

| Composant | Rôle | Variantes | Phase |
|---|---|---|---|
| `Wordmark` | Logo | tailles, avec ou sans poteau | A ✓ |
| `VerstPost` | Marqueur de scène | `sm` / `md`, avec étiquette | A ✓ |
| `BilingualName` | МОСКВА / MOSCOU | `display` / `inline` | A ✓ |
| `PhotoBadge` | Photographie VERSTE / Image illustrative | — | A ✓ |
| `SourceTag` | Officiel / Terrain / Conseil Verste + date | — | C |
| `Button` | Actions | `primary` (carmin), `secondary` (filet), `quiet` (lien) ; lien ou bouton | B ✓ |
| `Navigation` | En-tête minimal, transparent sur le hero | desktop / tiroir mobile | B ✓ |
| `ItineraryLine` | La ligne verste | carte / rail vertical / chronologie | C ✓ (carte) |
| `TravelProgress` | Compteur de distance | fixe / en ligne | C ✓ |
| `CitySection` | Scène de ville | — | C |
| `DestinationCard` | Étape sur la ligne | — | C |
| `LogisticsCard` | Une friction et sa clé | — | C |
| `ConfiguratorStep` | Une verste du configurateur | choix unique / multiple | D |
| `PricingCard` | Offre | standard / option | E |
| `RussianPhrase` | Phrase + prononciation + audio | — | F |
| `Testimonial` | Témoignage | — | Défini, **affiché seulement avec date de consentement et source** |
| `Footer` | Pied de page légal | — | B ✓ |

### 4.7 Médias

Chaque média est décrit dans `data/media.ts` : `kind` (`verste` ou `illustrative`), `alt`, `credit`, `src`, `poster`. Le badge correspondant s'affiche toujours. Objectif : que la part de *Photographie VERSTE* augmente à chaque version.

---

## 5. Structure détaillée de la homepage

Cinq actes, quatorze scènes. Le fond passe de la nuit à la neige.

| # | Scène | Surface | Contenu | Interaction | Mobile | Événement |
|---|---|---|---|---|---|---|
| **Acte I · L'appel** |||||||
| S01 | Ouverture | night | VERSTE monumental · « Un pays immense. Un chemin clair. » · Construire mon voyage · Explorer la Russie | Lumières de Moscou vues du ciel (canvas), entrée du titre, indice de scroll | Titre sur toute la largeur, CTA pleine largeur | `hero_cta_click` |
| S02 | Le trajet | night → midnight | Carte : Paris → Istanbul → МОСКВА / MOSCOU · « Il n'y a plus de vol direct. Il y a toujours un chemin. » | Scène épinglée : la ligne se dessine, le compteur passe de 0 à 3 964 km, la Russie s'éclaire | Carte recadrée en portrait | `route_completed` |
| **Acte II · La découverte** |||||||
| S03 | Manifeste | midnight | « Vous avez peut-être déjà vu Moscou… » → « Le pays que vous croyez connaître. » → Verste | Lignes qui apparaissent une à une | Texte seul | — |
| S04 | Moscou | midnight → russian | МОСКВА / MOSCOU · « La ville où le voyage commence. » · durée, rythme, expériences, transport, budget indicatif | Grand média, bandeau de données | Média plein écran, données en liste | — |
| S05 | La ligne continue | russian | Saint-Pétersbourg · Nijni Novgorod · Anneau d'or, reliés par la ligne | Défilement horizontal (desktop) | Défilement au doigt | `destination_open` |
| **Acte III · L'immersion** |||||||
| S06 | Le problème | russian | Visa · Argent · Internet · Transport · Langue · Réservations → « C'est précisément là que Verste intervient. » | Questions révélées une à une | Liste | — |
| S07 | Nous préparons. Vous voyagez. | russian | Ce que nous faisons / Ce que vous gardez en main · « Nous préparons. Vous réservez. » | — | Colonnes empilées | — |
| S08 | Russie aujourd'hui | midnight (encart) | Tableau daté : Officiel / Terrain / Conseil Verste | Lien vers la page complète | Tableau en cartes | `today_open` |
| **Acte IV · Votre Russie** |||||||
| S09 | Combien de temps vous donnez-vous ? | frost | Étape 1 du configurateur en ligne | Un choix mène à `/configurateur?duree=…` | Gros boutons tactiles | `configurator_started` |
| S10 | Le Carnet Verste | frost | L'objet, son contenu, le hors-ligne, le système d'assistance | Aperçu du carnet | Aperçu vertical | — |
| S11 | Offres | snow | Découverte · Immersion · Grand format · + Conciergerie | — | Onglets | `pricing_viewed` |
| **Acte V · Le départ** |||||||
| S12 | Qui se cache derrière Verste ? | snow | Réponse à « pourquoi vous faire confiance ? » | — | — | — |
| S13 | La Première Verste | snow | Guide gratuit | Formulaire | — | `lead_submitted` |
| S14 | Le départ | snow | « Chaque voyage commence par une première verste. » · Construire mon voyage en Russie · Parler de mon voyage | La ligne se termine | CTA fixe en bas | `hero_cta_click` (final) |

---

## 6. Parcours utilisateur

```
Visite ─▶ Découverte ─▶ Exploration ─▶ Configurateur ─▶ Résultat ─▶ Lead ─▶ Appel / offre ─▶ Paiement ─▶ Carnet
  S01        S02–S05       S06–S08         S09              Votre       S13      /contact        Stripe       /carnet
                                                            Russie               /offres         (G)          (H)
```

| Étape | Question du visiteur | Ce qui le fait avancer | Événement |
|---|---|---|---|
| Visite | « C'est quoi ? » | Titre, image, une promesse lisible | `hero_cta_click` |
| Découverte | « Qu'est-ce que je vivrais ? » | Le trajet réel, Moscou, les destinations | `route_completed` |
| Exploration | « Est-ce faisable, est-ce raisonnable ? » | Les frictions nommées, le modèle expliqué, le contexte daté | `today_open` |
| Configurateur | « À quoi ressemblerait mon voyage ? » | Quatre choix simples | `configurator_started` |
| Résultat | « Ça me correspond ? » | Votre Russie : villes, rythme, logistique, fourchette | `configurator_completed` |
| Lead | « Je veux garder ça » | Profil par e-mail, guide gratuit | `lead_submitted` |
| Offre | « Combien ? » | Prix fixes affichés, matrice claire | `pricing_viewed` |
| Paiement | « Qu'est-ce que j'achète exactement ? » | Récapitulatif, reconnaissance du contexte et des conditions | `checkout_started` → `purchase_completed` |
| Carnet | « Et maintenant ? » | Le Carnet Verste, utilisable hors-ligne | — |

Chemin de réassurance : depuis n'importe quelle scène, **Russie aujourd'hui** est à un clic (navigation et pied de page). Chemin SEO : une page pratique mène au guide gratuit et au configurateur.

Aucun compte à rebours, aucune fausse rareté, aucune case précochée.

---

## 7. Architecture technique

### Principes

- Server Components par défaut. Composants client uniquement pour : lumières du hero, scène du trajet, défilement fluide, navigation mobile, configurateur, formulaires.
- TypeScript strict (`strict`, `noUncheckedIndexedAccess`).
- Contenu et données dans `data/`, logique pure dans `lib/`, rendu dans `components/`.
- Calculs géographiques au build (d3-geo côté serveur) : le navigateur reçoit des chemins SVG, pas une bibliothèque cartographique.
- Entrées validées par Zod côté serveur. Variables d'environnement validées au démarrage (`lib/env.ts`, `server-only`).

### Arborescence

```
app/
  layout.tsx                 polices, métadonnées, défilement fluide, lien d'évitement
  page.tsx                   accueil : assemble les 14 scènes
  globals.css                jetons (@theme), surfaces, base
  icon.svg                   favicon : le poteau
  configurateur/             D · étapes (état dans l'URL via nuqs) + resultat/
  offres/                    E
  guide-gratuit/             F
  russie/aujourd-hui/        C · page de transparence
  carnet/demo/               H · prototype hors-ligne
  actions/                   F, G · Server Actions (lead, checkout)
  api/stripe/webhook/        G
  sitemap.ts robots.ts opengraph-image.tsx   J
components/
  brand/                     Wordmark, VerstPost, BilingualName, PhotoBadge, SourceTag
  ui/                        Button, Container
  layout/                    SiteHeader, SiteFooter, SmoothScroll
  itinerary/                 RouteScene (serveur) + RouteSceneClient, TravelProgress
  media/                     MoscowLights (canvas), HeroMedia
  home/                      une scène par fichier
data/                        site, route, cities, russia-today, offers, founder, media
lib/                         geo, format, analytics, env
docs/                        01 dossier, 02 fondations (ce document)
public/                      media/, audio/
```

### Variables d'environnement (à partir des phases F–I)

`NEXT_PUBLIC_SITE_URL` · `RESEND_API_KEY` · `RESEND_AUDIENCE_ID` · `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `CHECKOUT_ENABLED` (faux par défaut) · `NEXT_PUBLIC_ANALYTICS_PROVIDER`.

---

## 8. Bibliothèques retenues (version finale V1)

Vérifiées le 29/09/2026 : registre npm (version, licence, dépendances pairs), API GitHub (activité), Bundlephobia (poids).

| Bibliothèque | Version | Rôle | Licence | Next 16 / React 19 | Poids gzip | Phase |
|---|---|---|---|---|---|---|
| next | 16.3.7 | Framework | MIT | — | — | A |
| react, react-dom | 19.2.8 | Version épinglée par create-next-app 16.3.7 | MIT | ✓ | — | A |
| tailwindcss | 4 | Jetons et styles | MIT | ✓ | 0 (CSS) | A |
| motion | 13.4.6 | Scroll, tracés, transitions | MIT | pair `react ^18 \|\| ^19` ✓ | 46 Ko complet, moins en usage réel | C |
| lenis | 1.3.26 | Défilement fluide, desktop seulement | MIT | pair `react >=17` ✓ | 5 Ko | C |
| lucide-react | 1.48.0 | Pictogrammes d'interface | ISC | ✓ | ≈ 1 Ko / icône | B |
| d3-geo · topojson-client · world-atlas | 3.1.1 · 3.1.0 · 2.0.2 | Carte calculée au build (Natural Earth, domaine public) | ISC | aucune dépendance React | **0 côté client** | C |
| radix-ui | 1.6.7 | Groupes de choix accessibles du configurateur | MIT | ✓ | par primitive | D |
| nuqs | 2.10.1 | État du configurateur dans l'URL | MIT | pair `next >=14.2` ✓ | 6 Ko | D |
| zod | 4.6.5 | Validation serveur | MIT | — | serveur | D, F |
| resend | 6.30.0 | E-mails, contacts | MIT | — | serveur | F |
| stripe | 22.6.2 | Checkout (mode test, derrière un drapeau) | MIT | — | serveur | G |
| @serwist/turbopack | 9.5.12 | Carnet hors-ligne (à confirmer en phase H) | MIT | pair `next >=14` ✓ | service worker | H |
| @vercel/analytics · @vercel/speed-insights | 2.0.1 · 2.0.0 | Audience sans cookie, Core Web Vitals réels | MIT · Apache-2.0 | ✓ | ≈ 1 Ko | I |

**Écartées, avec la raison**

| Bibliothèque | Raison |
|---|---|
| GSAP (27 Ko, licence propriétaire gratuite) | Doublon avec Motion. |
| React Three Fiber + three (56 + 181 Ko) | Aucun moment du parcours n'a besoin de 3D. Compatible (React < 19.4), mais injustifiable sur mobile. |
| React Hook Form (14 Ko) | Formulaires natifs + Server Actions. |
| CLI shadcn/ui | Restylage total prévu : on garde Radix et les conventions, pas l'outil. |
| Supabase | V2 (espace client). |
| PostHog (93 Ko) | Seulement si le fournisseur choisi en phase I l'exige, chargé à la demande après consentement. |
| Embla | CSS `scroll-snap` suffit pour l'instant. |
| Zustand, Lottie, Howler, SplitType, next-video, cobe, MapLibre, Sanity, Payload, Contentlayer | Voir le dossier fondateur, rien n'a changé. |

---

## 9. Plan de développement V1

| Phase | Livrable | Terminé quand |
|---|---|---|
| **A · Système de marque** | Jetons, mot-symbole, poteau, double alphabet, favicon | Chaque actif existe en composant et s'affiche sur toutes les surfaces |
| **B · Design system** | `globals.css` (primitives + surfaces), Button, Navigation, Footer, page interne `/systeme` | Contrastes AA vérifiés, focus visible partout |
| **C · Homepage** | 14 scènes en trois incréments : S01–S03, puis S04–S08, puis S09–S14 | Mobile et desktop relus, mouvement réduit respecté, LCP < 2 s |
| **D · Configurateur** | `/configurateur`, moteur pur testé, page Votre Russie | Utilisable au clavier et au doigt, URL partageable |
| **E · Offres** | `/offres` + scène S11 | Prix, contenu et limites juridiques lisibles |
| **F · Produit d'appel** | `/guide-gratuit`, Server Action, Resend, consentement explicite pour la séquence | Formulaire fonctionnel sans JavaScript |
| **G · Checkout préparatoire** | Stripe Checkout en mode test, reconnaissance du contexte, pages légales à compléter | Désactivé par défaut, activable par variable d'environnement |
| **H · Prototype du Carnet** | `/carnet/demo` installable, lisible hors-ligne | Lecture complète en mode avion |
| **I · Analytics** | `track()` câblé sur les sept événements | Événements visibles en préproduction |
| **J · Performance, SEO, accessibilité** | Métadonnées, Open Graph, sitemap, robots, JSON-LD, audit Lighthouse et axe | Lighthouse ≥ 95 partout, zéro erreur axe |

**Hors V1** : réservation, marketplace, CRM, réseau social, application mobile, moteur d'hôtels, paiement complexe, espace client complet.

---

## 10. Journal d'implémentation

### Incrément 1 · 29/09/2026

- Projet Next.js 16.3.7 (App Router, TypeScript strict, Tailwind 4, Turbopack), dépôt Git local initialisé (aucun commit).
- Phase A : jetons de couleur, surfaces, typographie, mot-symbole, poteau, double alphabet, badges photo, favicon.
- Phase B (socle) : Button, Track, SiteHeader (tiroir mobile accessible), SiteFooter, défilement fluide.
- Phase C, incrément 1 : S01 Ouverture, S02 Le trajet, S03 Manifeste, et une page d'attente `/configurateur`.

**Choix faits en cours de route**

- Le hero montre ВЕРСТА qui se transforme en VERSTE lettre à lettre, en CSS pur. Six lettres dans chaque alphabet, comme РОССИЯ / RUSSIE dans le dossier.
- Le visuel du hero est une illustration générative de Moscou vue d'avion, la nuit : plan radioconcentrique réel (anneaux, radiales, Moskova, grands parcs), dessinée une fois sur un canvas et étiquetée *Image illustrative*.
- Le fond de carte (terres, frontières, graticule) est généré au build et servi comme image par `/carte/europe-russie.svg`. Il ne pèse ni dans le HTML ni dans la charge RSC.
- Sur mobile, la carte suit le voyageur (la caméra se décale pour garder le point rouge visible) au lieu de rétrécir tout le trajet.
- Scènes animées : état de repos = arrivée. Avec mouvement réduit ou sans JavaScript, la scène du trajet n'est plus épinglée et montre directement l'arrivée (variante CSS `still:`).

**Mesures (build de production)**

| Poste | Mesure | Commentaire |
|---|---|---|
| Pages | toutes statiques | `/`, `/configurateur`, carte, favicon |
| HTML de l'accueil | 10,9 Ko gzip | — |
| JavaScript (navigateurs modernes) | 165 Ko gzip | Socle Next 16 + React 19 ≈ 131 Ko incompressibles ; notre code ≈ 34 Ko (Motion en composants `m` légers, Lenis, carte, lumières). Le budget du dossier (150 Ko au total) est irréaliste avec ce socle : nouveau budget **≤ 60 Ko de code propre au-dessus du framework**. |
| Polices préchargées | 202 Ko (4 fichiers) | Était 356 Ko. Display normal latin + cyrillique, italique latin (instance séparée sans axe de largeur), Geist latin. Le reste est chargé à la demande. |
| Fond de carte | 10 Ko gzip | Mis en cache CDN |
| Console | aucune erreur | lint et TypeScript strict sans erreur |

**Reste à faire sur cet incrément** : test Lighthouse sur un déploiement réel, vérification visuelle en mouvement réduit (non émulable dans l'outil de prévisualisation, validée par relecture du code).

### Audit n° 1 · 29/09/2026

Voir [03-audit.md](03-audit.md). Onze constats sur l'incrément 1, dont une régression critique (animations Motion non rendues sans `LazyMotion`), tous corrigés ou atténués.

### Incréments 2 et 3 · 29/09/2026

- **S04 Moscou** : МОСКВА / MOSCOU, motif abstrait du métro traversé par la ligne rouge, bandeau de données. Le budget indicatif reste « à compléter ».
- **S05 La ligne continue** : cinq destinations triées par distance calculée depuis le kilomètre zéro, glissement horizontal épinglé sur desktop, défilement au doigt sur mobile.
- **S06 Le problème** : six questions le long de la ligne verste, faits datés.
- **S06 bis Nous préparons. Vous voyagez.** : ce que nous faisons, ce que vous gardez en main, rappel juridique.
- **S07 Russie aujourd'hui** : tableau daté, chaque information typée *Officiel*, *Terrain* ou *Conseil Verste*, avec sa source.
- **S08 Votre Russie** : première question du configurateur, quatre durées qui mènent à `/configurateur?duree=…`.
- **S09 Le Carnet Verste** : contenu, aperçu d'une page hors ligne, modèle d'assistance sans WhatsApp.
- **S10 Offres** : quatre offres à prix fixes (à valider), aucun badge ni compte à rebours.
- **S11 Fondateur** : structure prête, visible seulement en développement tant que le contenu manque.
- **S12 La Première Verste** : formulaire natif + Server Action validée par Zod, consentement explicite non coché. Tant que Resend n'est pas configuré, le formulaire dit honnêtement que l'envoi n'est pas actif.
- **S13 Le départ** : la signature de marque et les deux derniers appels.
- Composants ajoutés : `SceneMarker`, `SourceTag`, `Pending`, `SurfaceBridge`, `ViewTracker`, `MotionProvider`, `DestinationCard`, `DestinationsRail`, `MetroMotif`, `PricingCard`, `LeadForm`.
- Navigation : Le trajet · Destinations · Russie aujourd'hui · Le Carnet · Offres.

**Phase C terminée.**

### Phase D · Configurateur · 29/09/2026

- **Moteur** (`lib/configurator/engine.ts`) : fonction pure, sans dépendance, couverte par 11 tests (`npm test`). Règles lisibles : répartition des jours par ville selon la durée, variantes (sport sur 14 jours → Moscou, Nijni Novgorod, Saint-Pétersbourg ; nature sur 28 jours → Baïkal), rythme selon le nombre de changements de ville, niveau logistique selon le russe, le nombre d'étapes et les vols intérieurs, expériences limitées aux villes du trajet.
- **Étapes** : formulaires GET rendus côté serveur avec `next/form`. Aucun état côté navigateur, fonctionne sans JavaScript, adresse partageable, bouton retour du navigateur fiable. Choix natifs (radios, cases) stylés en cartes : clavier et lecteurs d'écran fonctionnent sans bibliothèque. Radix et nuqs deviennent inutiles et ne sont pas installés.
- **Votre Russie** (`/configurateur/resultat`) : synthèse (durée, profil, villes, rythme, niveau logistique), carte de l'itinéraire calculée au serveur avec tracé dessiné en CSS, ligne étape par étape, expériences, raisons du niveau de préparation, note eVisa, format conseillé, conciergerie proposée si le profil la justifie. Pas de prix en premier : le profil, puis le format.
- **Budget indicatif** : laissé « à compléter » tant que vos fourchettes de terrain ne sont pas fournies ; en production, la page annonce qu'il sera donné lors de l'appel de cadrage.
- **`/contact`** : page d'attente qui conserve le profil, en attendant l'outil de prise de rendez-vous.
- Bug trouvé par les tests : les valeurs séparées par des virgules n'étaient pas découpées quand le paramètre était répété.

**Prochaines étapes** : phase F (rédiger La Première Verste, brancher Resend dès que la clé existe), phase G (pages légales et checkout Stripe en mode test), phase H (carnet hors ligne), phases I et J.

### Cadrage V2 · 30/09/2026

Voir [04-v2-experience-immersive.md](04-v2-experience-immersive.md) : audit, vision (12 scènes, dont 5 exceptionnelles), carte des interactions A–G, stratégie 3D (Saint-Basile seulement), inventaire des 176 médias du fondateur et pipeline (suppression du GPS), types de données vérifiables, itinéraire « Moscou + Nijni Novgorod : 7 jours », plan V2.0 → V2.7, test des trois personas. Aucun code modifié : en attente de validation et des réponses du §L.
