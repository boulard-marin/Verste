# VERSTE — V2 · L'expérience immersive

*Document de cadrage, 30/09/2026. Rien n'est implémenté ici : c'est le plan à valider avant de toucher au code.*
*Complète `01-dossier-fondateur.html` (stratégie), `02-fondations-v1.md` (marque, design system, journal) et `03-audit.md`.*

---

## 0. En une page

**Le constat.** Le socle V1 est sain : modèle juridique clair, transparence 2026, design system par surfaces, carte calculée, configurateur testé. Mais l'accueil se lit encore comme un *site* : quatorze sections, beaucoup de texte, aucune photographie réelle, et aucun lieu que l'on puisse *visiter*.

**La bascule.** Votre semaine du 19 au 26 septembre 2026 change tout : 176 fichiers datés et géolocalisés, qui forment un vrai trajet. La V2 en fait trois choses à la fois : le récit de l'accueil, le premier produit (*Moscou + Nijni Novgorod : 7 jours*) et le jeu de données qui nourrit le configurateur.

**Cinq décisions proposées :**

1. **Cinq scènes exceptionnelles**, pas douze scènes moyennes :
   - le trajet jusqu'à Moscou ;
   - Saint-Basile ;
   - sous Moscou ;
   - Poklonnaïa, du soleil à la nuit ;
   - le tableau de Minine.

   Les autres scènes restent calmes : une image forte, un texte court, une donnée.
2. **La photo d'abord, la 3D ensuite.** Saint-Basile existe d'abord en version photo, avec des points à explorer. La 3D stylisée vient en amélioration, et seulement si elle passe les critères du §D.
3. **La carte devient la navigation.** Elle se lit en trois niveaux : pays, région, ville. Elle est calculée au build et ne charge aucun JavaScript de cartographie sur l'accueil.
4. **Une donnée = une source + une date + un statut.** Le statut vaut *Officiel*, *Terrain*, *Conseil Verste*, *À confirmer* ou *Sources divergentes*. Les tests bloquent tout événement non vérifié.
5. **Les médias passent par un pipeline** qui supprime le GPS (votre logement apparaît dans les métadonnées d'origine) et produit des formats lisibles partout.

**Ce qui m'a le plus surpris dans vos fichiers :**
- Vos photos de Poklonnaïa forment un vrai passage du jour à la nuit, horodaté de 18 h 21 à 19 h 40. Le coucher du soleil calculé ce jour-là tombe à 18 h 33.
- Les fermetures du lundi (Nouvelle Tretiakov, Cosmonautique, Histoire contemporaine, probablement musée de la Victoire) font du lundi le jour idéal pour le train.
- La Lastochka de retour arrive à Moscou-Vostotchny, à environ 1,3 km à vol d'oiseau du Kremlin d'Izmaïlovo (coordonnées provisoires). Votre dernier soir tombe donc là par pure logique de trajet.

---

## A. Audit : ce qui reste, ce qui change

### Ce qui fonctionne et reste

| Élément | Pourquoi on le garde |
|---|---|
| Modèle « Nous préparons. Vous réservez. » + S07 *Russie aujourd'hui* | C'est le cœur de la crédibilité. La V2 le rend plus compact, sans jamais le cacher. |
| `SourceTag` Officiel / Terrain / Conseil Verste | Devient un type de donnée général (`Verification`, §F). |
| Surfaces `night → snow`, typographie, règle du rouge ≤ 5 % | La direction « De la nuit à l'aube » porte déjà le récit V2 : Poklonnaïa (la nuit) puis l'aube (le cadre avant de réserver). |
| `RouteScene` (Paris → Istanbul → Moscou, épinglé, distances calculées) | La meilleure interaction du site. Elle devient la base des scènes 01 à 03 (interactions A et E). |
| Cartes calculées au build (d3-geo, zéro JS) | Base technique de la carte Verste. |
| Moteur du configurateur (pur, 11 tests, formulaires GET sans JS) | Il est étendu, pas remplacé : il produira un itinéraire narratif. |
| `MotionProvider` (LazyMotion), variante `still:`, « état de repos = état final » | Toutes les scènes V2 s'y conforment. |
| Discipline de performance (165 Ko gzip, dont ≈ 34 Ko de code propre) | Les modules lourds (3D, MapLibre, vidéo) se chargeront uniquement sur intention. |

### Ce qui ne fonctionne pas encore

1. **Aucune continuité spatiale.** On ne « descend » jamais de la carte vers une ville, puis vers un lieu. Chaque section recommence à zéro.
2. **Aucun média réel.** Un canvas illustratif (`MoscowLights`) et des motifs. C'était le plus gros manque ; vos 176 fichiers le comblent en grande partie.
3. **Des destinations sans profondeur.** Des cartes dans un rail : ni lieux, ni journées, ni expériences.
4. **Un résultat de configurateur trop abstrait.** Il donne un profil et une répartition par ville, pas une journée que l'on peut se représenter.
5. **Aucune donnée à l'échelle du lieu.** Horaires, prix, jours de fermeture et sources sont écrits en prose dans `data/`, donc impossibles à contrôler automatiquement.
6. **Une navigation minimale** : cinq ancres, ni index des scènes, ni carte, ni sensation de progression.
7. **Le sport annoncé mais vide.** L'intérêt « Sport » existe dans le moteur, sans aucun contenu derrière.
8. **Des contenus toujours en attente de vous** : récit du fondateur, fourchettes de budget, validation des prix, cadre juridique.

### Ce que l'on retire ou fusionne

- `DestinationsRail` est remplacé par la carte (scène 11 et menu).
- `Problem` (les six questions) est fusionné dans le Carnet : la question et sa réponse au même endroit.
- `Manifesto` est absorbé par les scènes 01 et 02.
- Le canvas `MoscowLights` (vrais anneaux routiers) est **réemployé** comme étage intermédiaire de la descente vers Moscou (interaction A), au lieu de servir de hero.
- Les offres, le fondateur, La Première Verste et le départ forment une coda après la scène 12. Ils sont conservés, pas numérotés.

---

## B. Vision V2

> Le site ne raconte plus la Russie, il la fait traverser. Chaque geste fait avancer le voyage : défiler rapproche, cliquer ouvre un lieu, zoomer révèle un détail, et la ligne rouge dit toujours où l'on est.

### Le principe : trois échelles, une ligne

```
PAYS  (Europe → Oural)       la ligne rouge relie Paris, Moscou, Nijni
  │  défiler = la caméra descend
RÉGION (Moscou ↔ Nijni, 401 km à vol d'oiseau, calculé)   Volga, Oka, Lastochka
  │  cliquer une ville = transition vers la destination
VILLE (Moscou : Moskova, anneaux, Kremlin · Nijni : confluence, kremlin, Strelka)
  │  cliquer un lieu = mini-expérience
LIEU  (Saint-Basile, Poklonnaïa, maison Sirotkine…)  photo, histoire, pratique, « Ajouter à mon voyage »
```

### Accueil V2 : 12 scènes

J'ai gardé vos douze noms. Seuls **Nuit** et **Musée** changent de place, pour que Moscou et Nijni restent d'un seul tenant. Carnet et Votre Russie sont inversés pour suivre votre parcours final (« Et vous ? » → configurateur → itinéraire → Carnet → départ).

| # | Scène | Surface | Ce qui se passe | Médias | Traitement |
|---|---|---|---|---|---|
| 01 | **Paris** | night | « Chaque voyage commence par une première verste. » Compteur à 0 km. | Typographie seule | Calme |
| 02 | **La ligne rouge** | night → midnight | CDG → IST → SVO, distance calculée, la ligne se trace au défilement. | Carte calculée | ★ avec 03 |
| 03 | **Moscou** | midnight | La caméra descend : pays → anneaux (`MoscowLights`) → la ville réelle. | 1744–45 (Moscow City depuis la voiture), 1748, 1756–57, 1769 | ★ Le trajet |
| 04 | **Le Kremlin** | russian | Place Rouge → Saint-Basile : points à explorer, mini-expérience, « Ajouter à mon voyage ». | 1760–68 | ★ Saint-Basile |
| 05 | **Le métro** | midnight | La station comme portail : descente de l'escalator de Park Pobedy, puis galerie des stations-palais, puis sortie à Poklonnaïa. | 1905 (séquence), stations : sources libres (§E) | ★ Sous Moscou |
| 06 | **La nuit** | russian → night | Poklonnaïa : le défilement fait passer l'heure réelle de 18 h 21 à 19 h 40. Le site ralentit, le bleu fonce, puis la nuit tombe. | 1873–1903 | ★ Du soleil à la nuit |
| 07 | **Nijni Novgorod** | midnight | Retour à l'échelle région : la Lastochka trace Moscou → Nijni, la caméra se pose sur la confluence Oka–Volga. | 1929–41, 1950–56 | Calme + transition C |
| 08 | **Le musée** | night | Le tableau de Makovski (≈ 7 × 6 m) : zoom guidé sur Minine, la foule, le kremlin. | 1937 | ★ Le tableau de Minine |
| 09 | **La Volga** | frost | Le kremlin au-dessus du fleuve, les lacs, le bateau (si la saison le permet). | 1934–36, 1958–59, 1971–76 | Calme |
| 10 | **Le sport** | night | Un soir de KHL à la VOLGA Arena, puis la lutte comme verticale de l'offre. | 1948–49, 1980–89, 1778 | Calme, vidéo courte |
| — | *L'aube* (interlude) | frost | Avant de construire : avis du Quai d'Orsay, eVisa, paiements, connexion, « Nous préparons. Vous réservez. » | — | Compact, jamais masquable |
| 11 | **Votre Russie** | frost | Retour à la carte : « Et vous ? », puis première question du configurateur, puis la carte qui se transforme (G). | Carte calculée | Interaction G |
| 12 | **Le Carnet** | snow | Ce que vous emportez : aperçu d'une journée hors ligne, les six questions et leurs réponses. | Captures recréées | Calme |
| — | Coda | snow | Offres, fondateur (masqué jusqu'à réception), La Première Verste, départ. | — | Existant |

**Pourquoi l'interlude « L'aube » :** l'avis du Quai d'Orsay doit apparaître *avant* le configurateur, pas en pied de page. Placé après la dernière scène de nuit, il devient le moment où le site redevient sobre et factuel. Il est aussi relié depuis le menu et le pied de page.

### Les cinq scènes exceptionnelles

1. **Le trajet** (02 → 03)
   - La ligne rouge part de Paris et s'arrête à Moscou.
   - Puis la caméra plonge : la silhouette du pays, les anneaux de Moscou en lumière, enfin la première vidéo réelle (Moscow City vue depuis la voiture, le jour de votre arrivée).
   - Fonction : faire comprendre la distance et l'arrivée.
2. **Saint-Basile** (04)
   - Votre photo à l'heure dorée (18 h 20, coucher calculé à 18 h 38 ce jour-là).
   - Neuf points correspondent aux neuf églises. Un clic ouvre la mini-expérience : l'histoire (sourcée), la visite pratique (horaires, billets, date de vérification), le meilleur moment et l'endroit exact d'où la photo a été prise.
   - La vue 3D « d'en haut » révèle ce qu'aucune photo ne montre : huit chapelles autour d'une église centrale.
3. **Sous Moscou** (05)
   - Le défilement pilote la descente de l'escalator de Park Pobedy (≈ 126 m selon mos.ru).
   - En bas, les stations-palais défilent comme une galerie. On en ressort à Poklonnaïa.
   - Fonction : faire du métro un portail, pas un sujet.
4. **Du soleil à la nuit** (06)
   - Chaque image porte son heure réelle : 18 h 36 (le soleil vient de se coucher), 19 h 09 (heure bleue, Saint-Georges), 19 h 24 (Moscow City à l'horizon), 19 h 38 (les fontaines rouges).
   - Le rouge de la ville remplace celui de l'interface ; c'est la seule scène où il vient de la photo. Le défilement ralentit (sections plus hautes), les textes se raréfient.
   - Fonction : l'émotion, et un conseil concret (« arrivez 40 min avant le coucher du soleil »).
5. **Le tableau de Minine** (08)
   - De la façade de la maison Sirotkine au tableau entier, puis trois arrêts guidés (Minine, la foule, le kremlin de 1612), puis retour à la Volga.
   - Fonction : montrer qu'un musée de province peut être la surprise du voyage.

### Navigation exploratoire

- **Menu plein écran « Le voyage »** (`<dialog>`, Échap, focus rendu à l'ouverture et à la fermeture) :
  - colonne *Scènes* : 01 à 12, numérotées comme des bornes ;
  - colonne *Villes* : Moscou, Nijni Novgorod, et les suivantes grisées « bientôt » ;
  - colonne *Expériences* : Saint-Basile, métro-palais, Poklonnaïa, le tableau de Minine, un soir de KHL, les trois lacs ;
  - colonne *Préparer* : Russie aujourd'hui, Carnet, Offres, Configurateur.

  Une mini-carte montre où l'on se trouve.
- **La ligne rouge comme index** :
  - sur desktop, un trait vertical fin au bord droit, avec une borne par scène, qui se remplit au défilement (E) ; chaque borne est un lien (F) ;
  - sur mobile, une barre de 2 px sous l'en-tête et « 04 / 12 » dans l'en-tête.
- **Raccourcis** : chaque scène de ville propose « Explorer Moscou → » (page destination) et chaque lieu « Ajouter à mon voyage ».
- **Couleurs du métro** : les couleurs officielles des lignes n'apparaissent que dans des pastilles numérotées (≤ 16 px), jamais en tracé. Sinon la ligne 1, rouge, se confondrait avec la route.

### La carte Verste (votre « Russia Travel Map »)

- Une carte stylisée, pas une carte routière :
  - silhouette du pays (Natural Earth, domaine public) ;
  - Volga et Oka tracées ;
  - villes figurées comme des bornes Verste avec leur nom cyrillique ;
  - la route vécue en rouge, les destinations futures en pointillé clair.
- Les trois niveaux (pays, région, ville) sont calculés au build en SVG. Les calques de ville (Moskova, anneaux, murs du Kremlin ; confluence et kremlin de Nijni) sont extraits une fois d'OpenStreetMap (ODbL, mention « © contributeurs OpenStreetMap »).
- Une vraie carte glissante (MapLibre) n'est chargée **que** sur la page d'un itinéraire, pour suivre la « Grande Verste » à pied (§G, J5).
- Nom : je propose **« La Carte »** et « Карта » en cyrillique, cohérent avec un site français. Le libellé *Russia travel map* peut rester en sous-titre pour le référencement. À vous de trancher.

---

## C. Carte des interactions (A à G)

Chaque animation doit avoir une fonction. Si la fonction est absente, l'animation l'est aussi.

| | Interaction | Fonction | Où | Technique | Repli (mouvement réduit / sans JS / vieux navigateur) | Coût |
|---|---|---|---|---|---|---|
| **A** | Défiler → la caméra approche d'une ville | Faire sentir la distance et l'échelle (pays → ville → lieu) | 02–03, 07 | SVG calculé au build ; `useScroll` + `useTransform` (Motion) sur un `<g transform>` ; étage intermédiaire `MoscowLights` ; fondu vers la vidéo | Image finale fixe de chaque niveau, empilées ; variante `still:` | ≈ 3 Ko de code, 0 Ko de dépendance nouvelle |
| **B** | Cliquer un monument → mini-expérience | Passer de l'admiration à l'action (comprendre, planifier, ajouter) | 04 (Saint-Basile), puis tous les lieux | Points `<button>` sur la photo ; panneau en **route interceptée** (`app/@lieu/(.)lieux/[id]`) : modale au clic, page complète en accès direct (partageable, indexable) ; 3D en option (§D) | La page du lieu `/lieux/saint-basile` fonctionne seule ; la liste des neuf églises est aussi une liste HTML | Photo seule : ≈ 2 Ko ; 3D : chargée à la demande |
| **C** | Carte → destination | Garder le fil entre la carte et la page ville (c'est la même Nijni) | 07, 11, menu | `<ViewTransition name="ville-nijni">` de React, activé par la navigation Next (aucune configuration, cf. `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) ; `transitionTypes` sur `<Link>` pour le sens de la transition | Sans prise en charge du navigateur, la navigation se fait normalement, sans animation | 0 Ko |
| **D** | Photo → zoom cinématographique | Lire un détail qu'on ne voit pas en vignette (le tableau fait ≈ 7 × 6 m) | 08, galeries | `react-zoom-pan-pinch` (15 Ko, `setTransform` pour les arrêts guidés, pincement au doigt) ; image 5712 px source | Image entière + trois recadrages statiques légendés | 15 Ko, chargés à l'ouverture |
| **E** | Ligne rouge → progression du voyage | Savoir où l'on est dans le voyage et combien il reste | Toute la page | `animation-timeline: scroll()` (CSS, zéro JS) sur le trait ; repli JS via le `useScroll` existant ; bornes = `<nav>` d'ancres | Barre statique, bornes cliquables | ≈ 1 Ko |
| **F** | Frise → aller à une scène | Explorer sans défiler 12 écrans ; reprendre là où l'on était | Index de scènes, frise J1–J7 de l'itinéraire | Liens d'ancre + `lenis.scrollTo` ; l'URL (`#scene-06`, `#jour-5`) se met à jour ; flèches clavier dans la frise | Ancres natives | ≈ 1 Ko |
| **G** | Configurateur → transformation visuelle | Voir son voyage prendre forme à chaque réponse | 11, `/configurateur` | Formulaires GET inchangés ; le tracé de la carte se transforme entre deux états (`<ViewTransition>` sur le tracé, `d` interpolé) ; la surface et l'image d'ambiance suivent le profil (sport → VOLGA Arena, 14 jours → Saint-Pétersbourg) | Fonctionne déjà sans JS : chaque étape est une page | ≈ 3 Ko |

**Règles transverses :**
- Aucune interaction ne bloque le défilement plus de 1,5 écran.
- Tout ce qui est épinglé a une variante `still:`.
- Chaque scène se vérifie dans le navigateur : desktop, mobile, mouvement réduit.
- Une scène qui fait chuter l'INP au-delà de 200 ms est simplifiée.

---

## D. Stratégie 3D

**Une seule 3D : Saint-Basile.** Aucun autre modèle n'est prévu en V2.

### Pourquoi celle-là, et seulement si elle aide

La photo montre une façade. La 3D montre le **plan** : une église centrale à toit en tente, entourée de quatre grandes chapelles sur les axes et de quatre petites en diagonale. C'est cela qui rend l'édifice compréhensible, pas seulement beau. C'est la seule justification retenue.

### Recommandation : modèle procédural stylisé, construit par nous

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| **Procédural** (three.js : `LatheGeometry` pour les bulbes, prismes octogonaux, toit en tente) | Palette de la marque, poids ≈ 15–25 Ko de code sans fichier GLB, points d'intérêt placés au bon endroit, cohérent avec l'esthétique « carte stylisée » | Demande 2 à 3 jours de modélisation ; la fidélité reste stylisée | **Retenu** |
| Modèle Sketchfab de Polskaball (CC BY 4.0, téléchargeable, 44,4 k triangles) | Plus réaliste, disponible tout de suite | Attribution obligatoire ; style générique qui jure avec la direction artistique ; 1 à 2 Mo après compression (gltf-transform + meshopt) ; points d'intérêt à recaler | Plan B si le procédural paraît trop « jouet » |

### Mise en œuvre

- **Chargement sur intention.**
  - `next/dynamic` sans rendu serveur, déclenché par le bouton « Tourner autour ». Ce bouton ne s'affiche que si WebGL2 est disponible, si `Save-Data` est désactivé et si `hardwareConcurrency` est au moins 4.
  - Jusque-là, c'est votre photo IMG_1767 qui sert d'affiche.
- **Pile technique :**
  - `three` 0.186 + `@react-three/fiber` 9.8 (compatible React 19.2) ;
  - de `@react-three/drei`, seulement `CameraControls` et `Html` (import par chemin pour éviter les 509 Ko du paquet complet) ;
  - `maath` pour l'amortissement ;
  - **pas** de post-traitement.
- **Rendu :**
  - `frameloop="demand"` : aucun calcul quand rien ne bouge ;
  - `dpr={[1, 1.75]}`, lumière d'heure dorée (hémisphère + directionnelle chaude), ombre de contact simple ;
  - briques dans un terracotta désaturé, jamais le rouge `route`.
- **Caméra :**
  - trois vues préréglées, « Depuis la place Rouge », « D'en haut : le plan » et « Depuis la Moskova » ;
  - rotation limitée (±70° en azimut), zoom borné.
- **Accessibilité :**
  - les neuf points sont de vrais `<button>` ;
  - la même liste existe en HTML à côté du canevas ;
  - Échap ferme, et le mouvement réduit désactive la rotation automatique.
- **Honnêteté** :
  - légende « Modélisation stylisée VERSTE, proportions indicatives » ;
  - dans `data/media.ts`, `kind: "illustrative"` et `type: "model3d"`.

### Budget et critère de maintien

| Mesure | Seuil |
|---|---|
| JavaScript 3D chargé à la demande | ≤ 300 Ko gzip |
| Images par seconde | 60 sur un portable moyen, ≥ 30 sur un Android milieu de gamme |
| Effet sur l'accueil | LCP et JS initial inchangés (rien n'est chargé avant l'intention) |
| Test utilisateur | Au moins 2 personas sur 3 comprennent le plan « 8 autour de 1 » grâce à la vue 3D |

Si un seul critère échoue, la 3D reste hors ligne et la version photo suffit. Elle est livrée en premier (V2.2b), la 3D ensuite (V2.5).

---

## E. Stratégie médias

### E.1 Inventaire de votre dossier Drive

**176 fichiers, 1,44 Go**, iPhone 15, du 19 au 26/09/2026 :

| Type | Nombre | Format |
|---|---|---|
| Photos HEIC | 97 | 5712 × 4284, une en 4032 × 3024 |
| Photos JPG sans métadonnées | 2 | JPG |
| Captures d'écran | 3 | PNG |
| Vidéos | 74 | MOV HEVC, 1080 × 1920, 642 s au total, de 1,8 à 23,6 s |

- **Orientation** : tout est vertical, sauf trois vidéos (1890–1892, nuit).
- **Métadonnées** : 168 fichiers portent un GPS.
- **Identification des lieux** : faite à la main, planche par planche. Le GPS des photos du 19/09 est décalé jusqu'à environ 1 km : les photos de Saint-Basile sont géolocalisées près du Bolchoï. **On ne déduit donc jamais un lieu des métadonnées.**

```
VERSTE · Drive
│
├── MOSCOU · 131 fichiers (77 photos, 54 vidéos, 457 s)
│   ├── Arrivée ················ Moscow City depuis la voiture : 1744, 1745 (vidéos, 19/09)
│   ├── Architecture ··········· Bolchoï, Marx : 1747–1750 · hôtel Moskva, Manège, jardin d'Alexandre : 1751–1758
│   │                            Christ-Sauveur : 1867–1872 · VDNKh, pavillons Arménie et Biélorussie : 1780–1783, 1790–1795
│   ├── Kremlin & place Rouge ·· Murailles, flamme éternelle, Musée historique : 1759–1765
│   │   └── ★ Saint-Basile à l'heure dorée : 1766, 1767, 1768 (18 h 19–18 h 20)
│   ├── Églises & monastères ··· Novodievitchi : 1841, 1845–1848
│   ├── Histoire & mémoire ····· Cimetière Novodievitchi : 1842–1844 · Muzeon : 1855–1863
│   │                            Poklonnaïa, obélisque, musée (extérieur) : 1873–1889
│   ├── Espace ················· Pavillon Kosmos, fusée Vostok, Yak-42, Mi-8 : 1796–1803
│   ├── Musées & attractions ··· Moskvarium : 1804–1814 + F8570AC4 · expositions : 1815–1821 · arche VDNKh : 1822–1823
│   ├── Métro ·················· ★ escalator de Park Pobedy : 1905 (le seul plan de métro)
│   ├── Nuit ··················· ★ Poklonnaïa, 19 h 09–19 h 46 : 1888–1904 (Saint-Georges, skyline, fontaines rouges), 1887
│   ├── Moskova ················ Kotelnitcheskaïa : 1769–1770 · pont du Patriarche : 1864–1866, 1869
│   ├── Paysages ··············· Étang de Novodievitchi face à Moscow City : 1849, 1850
│   ├── Nourriture ············· VDNKh : 1786, 1787 · déjeuner géorgien (khinkali) : 1852–1854 · menus : 1777 (capture), 1851
│   ├── Sport / vie quotidienne · Salle de sport : 1778
│   └── ✕ Privé ················ 1839, 1840 : église près du logement (le GPS révèle l'adresse) → jamais publiés
│
├── NIJNI NOVGOROD · 42 fichiers (24 photos, 18 vidéos, 171 s)
│   ├── Architecture & églises · Monastère Petchersky : 1929–1931 · église Stroganov : 1940, 1941
│   │                            ★ cathédrale Alexandre-Nevski (ext., int., statue) : 1950–1956 · Annonciation (probable) : 1962
│   ├── Kremlin & Volga ········ 1934 (vidéo), 1935, 1936
│   ├── Musées ················· ★ tableau de Makovski, maison Sirotkine : 1937 · manoir Roukavichnikov : 1938, 1939
│   ├── Histoire & mémoire ····· Blindés et obélisque rouge : 1932, 1933 (lieu à identifier avec vous)
│   ├── Volga & quais ·········· 1958, 1959
│   ├── Paysages & nature ······ Lacs de Chtcholokovski Khoutor : 1971–1976
│   ├── Sport ·················· VOLGA Arena (extérieur) : 1948, 1949 · ★ match du Torpedo, 24/09 : 1980–1989 (10 vidéos)
│   ├── Nourriture ············· — (seulement une capture Yandex Maps « Где поесть » : 1957)
│   └── Vie quotidienne ········ —
│
└── TRAJETS · 3 fichiers : hublot au retour, au-dessus de la Turquie puis des Balkans (2014, 2016, 2017)
```

### E.2 Inutilisable ou à traiter

| Fichiers | Problème | Décision |
|---|---|---|
| 1839, 1840 | GPS = adresse du logement | **Exclus** |
| 1887 (158 Mo) | Conteneur illisible (atome `moov` introuvable), probablement un export interrompu. La vignette montre Saint-Georges de nuit. | À réexporter depuis le téléphone |
| 1750, 1754, 1797, 1823, 1882, 1886 | Déclenchements involontaires (pavé, mur, pigeon) ou cadrage partiel | Écartés |
| 1890, 1891, 1895, 1898, 1901, 1904 | Nuit trop sombre, bruit fort | Écartés. Les nuits utilisables sont 1893, 1894, 1896, 1897, 1899, 1900, 1902, 1903 (grain assumé, cohérent avec l'utilitaire `grain`). |
| 1756, 1781, 1974, 1985 | Moins de 3 s | Image fixe ou micro-boucle seulement |
| F8570AC4 | 720 × 1280 recompressé, aucune métadonnée | Vignette uniquement |
| 1777, 1779, 1957 | Captures d'écran (menu d'un tiers, doublon de 1747, interface et fond Yandex protégés) | Non publiées. 1957 inspire une fiche du Carnet « Trouver où manger », à recréer. |
| 1851 | Photo de menu sans métadonnées | Référence interne (fiche « Lire un menu en cyrillique ») |
| 1808 | **Personne identifiable** (pose devant l'aquarium) | Consentement écrit, ou exclue |
| 1980 (et plans de tribune) | Spectateurs identifiables en gros plan | Recadrage ou flou ; logos KHL et du club jamais en élément graphique |
| 1937, 1975 | Une personne dans le cadre (visiteur devant le tableau, pêcheur de dos) | Recadrage |
| 1842 | Tombe au cimetière Novodievitchi | Usage sobre, légende factuelle |

**Conséquence de design.** Les vidéos sont verticales (1080 × 1920). Recadrées en 16:9, elles tombent à 1080 × 608 : trop peu pour un plein écran de bureau. Donc :
- sur mobile, les vidéos occupent tout l'écran ;
- sur desktop, elles sont composées en diptyques ou triptyques verticaux ;
- les **photos** (24 Mpx) se recadrent en paysage sans perte visible (4284 × 2410 en 16:9, soit 10 Mpx) et portent les grands plans de bureau.

### E.3 Pipeline

Il vit dans `scripts/media/`. Les originaux restent dans Drive et dans `media-src/` (ignoré par git, jamais commité).

1. **Photos.**
   - Décodage HEIC avec `heic-convert` (le `sharp` précompilé ne lit pas le HEVC).
   - Puis `sharp` : rotation selon l'EXIF, conversion Display P3 → sRGB, recadrages nommés, bord long à 2560 px, JPEG q 82, **toutes les métadonnées supprimées**.
   - Placeholder flou de 16 px pour `next/image`.
   - `images.formats: ['image/avif', 'image/webp']` dans `next.config.ts` : Next produit les déclinaisons.
2. **Vidéos** (`ffmpeg-static`, outil de build seulement, jamais distribué).
   - Découpe, stabilisation si utile (vidstab), 720 × 1280 et 1080 × 1920.
   - H.264 High CRF 26, `+faststart`, sans son pour les boucles.
   - `-map_metadata -1` : le GPS QuickTime disparaît.
   - Affiche JPEG. Objectif : ≤ 1,5 Mo par boucle de 6 s en 720p.
3. **Séquence de l'escalator** (1905, 4,2 s) : 60 images WebP de 720 px, ≈ 1,5 Mo au total, chargées à l'approche de la scène, puis lues dans un canvas au défilement. C'est plus fluide que de piloter `currentTime` d'une vidéo.
4. **Contrôle (`npm run media:check`)** :
   - aucun fichier de `public/media` ne contient de GPS (vérifié avec `exifr`) ;
   - chaque fichier est déclaré dans le manifeste ;
   - chaque entrée a `alt`, `caption`, `license` et un statut `people`.
5. **Hébergement.**
   - Photos sélectionnées (≤ 40, ≈ 25 Mo) dans le dépôt.
   - Vidéos dans `public/media` tant que le total reste sous 50 Mo, puis sur un CDN (Vercel Blob ou Cloudflare R2).

**⚠ Votre lien Drive est partagé « à toute personne disposant du lien ».** Les originaux contiennent le GPS de votre logement. Une fois l'import fait, je vous conseille de restreindre ce partage.

### E.4 Médias externes (quand les vôtres manquent)

- **Règle** : vos médias d'abord. Un média externe n'entre que pour un manque réel, et porte toujours `kind: "illustrative"` avec sa source, son auteur, sa licence, l'attribution et la date de récupération, dans `data/media.ts`.

| Source | Licence | Ce qu'on en tire | Attention |
|---|---|---|---|
| **Wikimedia Commons** | CC BY / CC BY-SA / domaine public, au cas par cas | Stations-palais (Maïakovskaïa, Komsomolskaïa, Novoslobodskaïa, Biélorousskaïa), intérieur du musée de la Cosmonautique, Lastochka | Attribution et lien de licence obligatoires ; si on recadre une image CC BY-SA, le recadrage reste sous CC BY-SA |
| **Unsplash** | Licence Unsplash | Ambiances (Moscow City la nuit, étangs du Patriarche) | Pas de revente en l'état, pas de service concurrent ; créditer malgré tout |
| **Pexels** | Licence Pexels | Idem | Mêmes limites ; vérifier les personnes identifiables |
| **Openverse** | Agrégateur | Recherche | Licence à revérifier sur la page d'origine, jamais sur l'agrégateur |
| **Œuvres anciennes** | Domaine public (Makovski, 1896) | Reproduction du tableau | Votre photo 1937 suffit ; en droit européen, une reproduction fidèle d'une œuvre du domaine public n'ouvre pas de nouveau droit (directive 2019/790, art. 14) |

### E.5 Ce qui manque par rapport à votre récit, et la liste de prises pour le prochain voyage

**Manques :**
- belvédère de Vorobiovy Gory et MGU ;
- intérieur du musée de la Victoire ;
- stations-palais ;
- musée et monument de la Cosmonautique ;
- musée d'Histoire contemporaine ;
- étangs du Patriarche ;
- Moscow City la nuit, de près ;
- Kremlin d'Izmaïlovo ;
- soirée khinkali ;
- Nijni : shopping, bateau sur la Volga, pêche, séance de lutte, dîner final ;
- les deux trajets en Lastochka.

**Liste de prises :**
- pour chaque lieu : 3 photos **horizontales** (pour le desktop), 1 verticale, et 1 vidéo fixe de 10 s, exposition verrouillée ;
- l'escalator de Park Pobedy en une prise continue, de haut en bas ;
- les stations tôt le matin (moins de monde) ;
- pour toute personne reconnaissable (lutte, restaurant), un consentement écrit.

---

## F. Architecture de données

Une seule source de types dans `lib/travel/types.ts`. Le contenu vit dans `data/` (un fichier par ville et par itinéraire) et la logique pure dans `lib/`.

```ts
// ─── Vérification : chaque fait porte sa preuve ───────────────────────────────
export type ISODate = `${number}-${number}-${number}`;
export type SourceKind = "officiel" | "terrain" | "conseil"; // Officiel / Terrain / Conseil Verste
export type VerificationStatus =
  | "verifie"        // source officielle consultée à checkedAt
  | "observe"        // vécu par le fondateur (Terrain), daté
  | "a-verifier"     // source secondaire ou non confirmée
  | "contradictoire"; // sources divergentes : on affiche les deux

export type Source = { label: string; url?: string; kind: SourceKind };
export type Verification = {
  status: VerificationStatus;
  checkedAt: ISODate;
  sources: Source[];          // au moins 1, sauf "observe"
  note?: string;              // ex. « 600 ₽ (site officiel) / 450 ₽ (agrégateur) »
  staleAfterDays?: number;    // 90 pour horaires et prix, 7 pour un événement
};
export type Verified<T> = { value: T; verification: Verification };

// ─── Géographie ─────────────────────────────────────────────────────────────
export type LonLat = [lon: number, lat: number];
export type CityId = "moscou" | "nijni-novgorod" | "saint-petersbourg" | "kazan" | "anneau-d-or" | "baikal";
export type Weekday = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

export type Destination = {
  id: CityId; ru: string; fr: string; coords: LonLat;
  intro: string; recommendedDays: [min: number, max: number];
  placeIds: string[]; experienceIds: string[]; mediaIds: string[];
};

export type PlaceCategory =
  | "monument" | "eglise" | "musee" | "parc" | "panorama" | "metro" | "gare"
  | "quartier" | "marche" | "nature" | "sport" | "restaurant";

export type OpeningHours = {
  weekly: Partial<Record<Weekday, Array<[open: string, close: string]> | "ferme">>;
  note?: string;              // « dernière entrée 1 h avant »
};
export type Price = { amount: number; currency: "RUB"; label: string }; // « plein tarif »

export type Place = {
  id: string; cityId: CityId; ru: string; fr: string; category: PlaceCategory;
  coords: LonLat;             // vérifiées sur OpenStreetMap, jamais tirées d'un EXIF
  address?: { ru: string; fr?: string };
  metro?: { ru: string; fr: string; line: string }[];
  hours?: Verified<OpeningHours>;
  prices?: Verified<Price[]>;
  website?: string;
  story?: string;             // 2 ou 3 phrases rédigées par nous, sourcées si factuelles
  bestTime?: { kind: "coucher-soleil" | "matin" | "soir"; offsetMin?: number; why: string };
  interests: string[];        // InterestId du configurateur
  mediaIds: string[];
};

export type Restaurant = Place & {
  category: "restaurant";
  cuisine: string[]; budget: Verified<1 | 2 | 3 | 4>;
  booking: Verified<"conseillee" | "inutile" | "inconnue">;
  why: string;                // Conseil Verste : pourquoi ici, ce jour-là
};

export type SportVenue = Place & {
  category: "sport";
  disciplines: Array<"hockey" | "lutte-libre" | "greco-romaine" | "sambo" | "boxe" | "musculation">;
  visitorAccess: Verified<"ouvert" | "sur-demande" | "inconnu">;
};

export type Event = {
  id: string; venueId: string; kind: "match" | "spectacle" | "concert";
  title: string; date: ISODate; startsAt?: string; // heure seulement si publiée officiellement
  ticketing?: string;
  verification: Verification; // le moteur ne propose que status === "verifie"
};

// ─── Déplacements et repas ──────────────────────────────────────────────────
export type TransportMode = "marche" | "metro" | "train" | "taxi" | "bus" | "bateau" | "telepherique" | "avion";
export type TransportSegment = {
  mode: TransportMode; from: string; to: string;          // ids de Place
  line?: { number?: string; ru: string; fr: string };
  service?: string;                                        // « Lastochka »
  duration?: Verified<{ min: number; max: number }>;       // en minutes
  distance?: { km: number; basis: "vol-oiseau" | "itineraire" }; // toujours calculée (lib/geo.ts)
  howTo?: string; tip?: string;
};
export type Meal = {
  moment: "petit-dejeuner" | "dejeuner" | "diner" | "encas";
  kind: "supermarche" | "stolovaia" | "cafe" | "restaurant";
  restaurantId?: string; suggestion: string;
  budget?: Verified<{ min: number; max: number; currency: "RUB" }>;
};

// ─── Expériences, scènes, itinéraires ───────────────────────────────────────
export type Activity = {
  placeId?: string; title: string; duration: { min: number; max: number };
  story: string; practical?: string; kind: SourceKind; optional?: boolean;
};
export type DaySlot = { activities: Activity[]; transport?: TransportSegment[] };

export type Experience = {
  id: string; title: string; cityId: CityId; placeIds: string[];
  interests: string[]; duration: { min: number; max: number }; effort: 1 | 2 | 3;
  months?: number[];          // saisonnalité (bateau, plage)
  requires?: string[];        // « réservation », « russe conseillé »
  story: string; practical: string; mediaIds: string[];
  verification: Verification;
};

export type ItineraryDay = {
  day: number; cityId: CityId; title: string; theme: string;
  avoid?: { weekdays: Weekday[]; reason: string }; // ex. musées fermés le lundi
  morning: DaySlot; afternoon: DaySlot; evening: DaySlot;
  transport: TransportSegment[]; meals: Meal[];
  optionalExperiences: string[];
  walkingKm?: number;         // calculé
  effort: 1 | 2 | 3; sceneId?: string; mediaIds: string[];
  conseils: string[];
};

export type Itinerary = {
  id: string; title: string; days: ItineraryDay[];
  basedOn?: { kind: "vecu"; period: string };  // « septembre 2026 »
};

export type InteractionId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Scene = {
  id: string; order: number; title: string; ru?: string;
  surface: "night" | "midnight" | "russian" | "frost" | "snow";
  cityId?: CityId; interaction?: InteractionId;
  purpose: string;            // la fonction de l'animation (règle « pas d'animation gratuite »)
  still: string;              // ce que voit un visiteur en mouvement réduit
  mediaIds: string[]; experienceIds: string[];
};

export type MediaAsset = {
  id: string; kind: "verste" | "illustrative";
  type: "photo" | "video" | "sequence" | "model3d";
  src: string; poster?: string; width: number; height: number;
  orientation: "portrait" | "paysage" | "carre"; durationS?: number;
  alt: string; caption: string; placeId?: string; takenOn?: ISODate;
  people: "aucune" | "foule-non-identifiable" | "consentement" | "a-flouter";
  license: {
    type: "proprietaire" | "domaine-public" | "CC0" | "CC-BY-4.0" | "CC-BY-SA-4.0" | "unsplash" | "pexels";
    author?: string; sourceUrl?: string; attribution?: string; retrievedOn?: ISODate;
  };
  gpsStripped: true;          // littéral : impossible de déclarer un média non nettoyé
};
```

**Tests de données** (`lib/travel/data.test.ts`, lancés par `npm test`) :
- toute information pratique a une `Verification` ;
- aucun `Event` proposé sans `status: "verifie"` ;
- aucune distance saisie à la main ;
- tout média a une licence, un statut `people` et `gpsStripped: true` ;
- aucun lieu n'est planifié un jour où il est fermé ;
- toutes les références (`placeId`, `mediaIds`) existent.

**Fraîcheur des données.** `npm run facts:stale` liste ce qui a dépassé `staleAfterDays`. C'est un avertissement, pas un échec de build : la fraîcheur ne doit pas casser un déploiement. Côté interface, une information périmée s'affiche automatiquement « À reconfirmer ».

### Du configurateur à l'itinéraire narratif

`lib/itinerary/engine.ts`, fonction pure et testée :

1. **Le profil existant** (`buildProfile`) fournit les villes et le nombre de jours par ville.
2. **Les jours-types** sont des journées écrites par nous, par exemple :
   - `moscou-imperiale`, `moscou-sovietique`, `moscou-espace-boulgakov` ;
   - `nijni-arrivee`, `nijni-grande-verste`, `nijni-lacs-confluence` ;
   - `train-retour-izmailovo`.

   Ils sont choisis selon les intérêts, en alternant les efforts : jamais deux jours d'effort 3 de suite.
3. **Si des dates sont données** :
   - le moteur les convertit en jours de semaine et déplace les journées pour éviter les fermetures ; le train tombe de préférence le lundi ;
   - il calcule le coucher du soleil par ville et par date (`lib/sun.ts`, formule NOAA, sans dépendance) pour placer les moments « heure dorée » ;
   - il ajoute les `Event` vérifiés compris dans la période, en expérience optionnelle du soir.
4. **Le texte** est assemblé à partir des `story` et `practical` des activités, avec des liaisons déterministes (« En fin d'après-midi… »). Aucun texte n'est généré à la volée, donc rien d'invérifiable.
5. **Sans dates**, l'itinéraire affiche les contraintes au lieu de les résoudre (« À éviter le lundi : trois musées fermés »).

Exemple de sortie attendue pour des dates du 12 au 18 octobre 2026 avec l'intérêt sport :

> **Jour 6 · mercredi 14 octobre · Nijni Novgorod.** […] En soirée, le Torpedo reçoit HC Sotchi à la VOLGA Arena, à 170 m de la cathédrale Alexandre-Nevski (distance calculée). *Calendrier annoncé par la presse locale, à confirmer sur hctorpedo.ru. L'heure du match n'est pas encore publiée ici.*

---

## G. Premier itinéraire VERSTE

# Moscou + Nijni Novgorod : 7 jours

*Construit sur votre voyage du 19 au 26 septembre 2026 (sept nuits, vol retour le 8e jour).*

**Légende :**
- **Terrain** : vécu, septembre 2026.
- **Officiel** : vérifié sur la source officielle le 30/09/2026.
- **À confirmer** : source secondaire ou non trouvée.
- **Divergent** : sources contradictoires.
- **Conseil** : recommandation Verste.

**Distances.** Toutes sont calculées à vol d'oiseau à partir de coordonnées provisoires (précision de l'ordre de 100 m). La distance « à pied » est estimée à vol d'oiseau × 1,3. Elles seront recalculées par `lib/geo.ts` après vérification des coordonnées sur OpenStreetMap.

### Ce que votre semaine a appris au produit

- **Le lundi ferme la moitié de Moscou.** Sont fermés : Nouvelle Tretiakov (*Officiel*), musée de la Cosmonautique (*Officiel*), musée d'Histoire contemporaine (*Officiel*), et probablement le musée de la Victoire (*Divergent*). Vos médias du lundi 21/09 ne montrent aucun intérieur de musée : Muzeon vu du parc, Poklonnaïa au coucher du soleil. → **Départ conseillé un vendredi, train pour Nijni le lundi.**
- **Écart récit / médias à trancher avec vous.** Votre récit parle du belvédère de Vorobiovy Gory. Vos photos de ce matin-là montrent le couvent Novodievitchi et son étang face à Moscow City (métro Sportivnaïa, même ligne 1). Les deux se combinent : 1,8 km à vol d'oiseau, en traversant la Moskova sur le pont du métro. L'itinéraire propose donc Novodievitchi en variante.
- **La gare de retour s'appelle Vostotchny** (Восточный вокзал) : c'est vérifié, et ce n'est pas « Novstochni ». Elle est proche d'Izmaïlovo.

### Vue d'ensemble

| Jour | Ville | Thème | Effort | Marche estimée |
|---|---|---|---|---|
| J1 · ven | Moscou | Arrivée : du Bolchoï à la Moskova, heure dorée | 1 | ≈ 2,3 km |
| J2 · sam | Moscou | De la colline aux vainqueurs : Moscou soviétique | 3 | ≈ 8 km |
| J3 · dim | Moscou | Le métro-palais, l'espace, Boulgakov | 2 | ≈ 6 km |
| J4 · lun | Train → Nijni | La Lastochka, puis Nijni qui respire | 1 | à calculer (journée légère) |
| J5 · mar | Nijni | La Grande Verste : du haut de la ville à la Volga | 3 | ≈ 5 à 6,4 km |
| J6 · mer | Nijni | Les trois lacs, la confluence, un soir de KHL si le calendrier le permet | 2 | ≈ 1,3 km à la Strelka + le tour des lacs (à calculer) |
| J7 · jeu | Train → Moscou | Retour, dernier soir à Izmaïlovo | 1 | ≈ 1,7 km (gare → Kremlin d'Izmaïlovo) |
| J8 · ven | — | Vol retour (via Istanbul) | — | — |

---

### J1 · vendredi · Arrivée : du Bolchoï à la Moskova

- **Transport** :
  - vol via Istanbul (pas de vol direct depuis l'UE, *Officiel*, vérifié le 29/09/2026) ;
  - transfert en taxi réservé par application ; le mode de paiement est préparé dans le Carnet, car les cartes Visa et Mastercard ne fonctionnent pas.
  - En entrant dans la ville, on longe les tours de Moscow City (vos vidéos 1744–1745).
- **Après-midi** : installation, repos. *Conseil* : ne rien prévoir avant 17 h.
- **Fin d'après-midi · la première verste à pied** (≈ 2,3 km estimés, 1,8 km à vol d'oiseau) :
  1. Bolchoï, place du Théâtre ;
  2. place du Manège et jardin d'Alexandre (517 m) ;
  3. flamme éternelle (168 m) ;
  4. place Rouge et Musée historique (274 m) ;
  5. **Saint-Basile** à l'heure dorée (421 m) ;
  6. pont Bolchoï Moskvoretski, avec le Kremlin et la tour Kotelnitcheskaïa au coucher du soleil (425 m).
  - Coucher du soleil calculé : 18 h 38 le 19/09. Vos photos de Saint-Basile datent de 18 h 20. *Conseil* : être devant la cathédrale 20 min avant le coucher du soleil.
- **Soir** : dîner simple, dans une stolovaïa ou au supermarché. *Conseil* : le premier soir, on ne cherche pas le restaurant parfait.
- **Pratique** :
  - intérieur de Saint-Basile, de 10 h à 18 h ou 19 h, billets sur tickets.shm.ru (*Officiel*, shm.ru) : à garder pour un autre jour ;
  - le soir, seul l'extérieur se visite.
- **Médias** : 1744–1745, 1747–1770 · **Scènes** : 03, 04.

### J2 · samedi · De la colline aux vainqueurs : Moscou soviétique

*Jamais un lundi.*

- **Matin** :
  - *Si vous vous entraînez* : séance 1 (haut du corps). Petit-déjeuner du supermarché : tvorog, kéfir, banane, pain de seigle (*Terrain*).
  - Métro **ligne 1** (Сокольническая) jusqu'à **Vorobiovy Gory**, une station construite sur le pont qui franchit la Moskova (*À confirmer* : source à citer).
  - Belvédère à 306 m de la station, puis **MGU**, gratte-ciel stalinien achevé en 1953 (*À confirmer* : source à citer), à 1,6 km.
  - *Variante vécue* : métro Sportivnaïa, **couvent Novodievitchi**, cimetière, étang face à Moscow City (*Terrain*, 1841–1850), puis belvédère à pied (1,8 km à vol d'oiseau).
- **Fin de matinée** :
  - **Park Kultury**, puis **Muzeon** (870 m) : les statues déboulonnées après 1991, dont Dzerjinski (toujours au Muzeon selon Wikipédia, 30/09/2026 ; *à recouper*), et le Pierre le Grand de Tsereteli de l'autre côté de l'eau.
  - Puis la **Nouvelle Tretiakov**, à 135 m : Malevitch, Kandinsky, Chagall, réalisme socialiste. Ouverte de 10 h à 21 h, fermée le lundi, 700 ₽ (*Officiel*, tretyakovgallery.ru, 30/09/2026).
- **Déjeuner** : au supermarché (pirojki, kolbasa, syrok, eau). *Conseil* : c'est la journée qui montre comment vivre Moscou avec un budget maîtrisé. Les montants seront ajoutés quand vous aurez validé vos relevés de prix.
- **Après-midi** :
  - Park Kultury → Kievskaïa par la **ligne circulaire** (Кольцевая), puis la **ligne 3** jusqu'à **Park Pobedy**. C'est l'une des stations les plus profondes de Moscou, avec des escalators d'environ 126 m (mos.ru ; les chiffres de profondeur varient selon les sources, à citer avec leur source).
  - **Poklonnaïa** : l'obélisque de 141,8 m, soit 1 418 jours de guerre (*À confirmer* : à sourcer sur victorymuseum.ru), fontaines, blindés et canons, à 825 m du métro.
  - **Musée de la Victoire** (298 m plus loin) : dioramas, salle de la Gloire, salle du Souvenir.
    - **Divergent** : le site officiel indique du mardi au dimanche de 10 h à 21 h, dès 600 ₽ ; des agrégateurs indiquent le lundi de 9 h 30 à 17 h et 450 ₽.
    - À reconfirmer avant chaque départ ; entrer au plus tard vers 15 h 30.
- **Coucher du soleil à Poklonnaïa · la scène clé.** Coucher calculé à 18 h 33 le 21/09. *Terrain* : l'heure bleue vers 19 h 10 avec Saint-Georges éclairé, la nuit vers 19 h 25, et Moscow City qui s'allume à l'horizon. *Conseil* : arriver sur l'esplanade 40 min avant le coucher du soleil.
- **Soir**, deux options :
  - **Moscow City la nuit.** Park Pobedy → Delovoï Tsentr, une station sur la ligne 8A (*À confirmer*). Tours, Moskova, pont Bagration, reflets. « Une seule ville, plusieurs Russie. »
  - *Si vous vous entraînez* : retour à la salle, séance 2 (tractions, mobilité), puis dîner du supermarché : poulet, sarrasin, kéfir, zéfir (*Terrain*).
- **Marche** : ≈ 8 km estimés au total (2,5 km le matin, 2,4 km au Muzeon, 2,9 km à Poklonnaïa).
- **Médias** : 1841–1850, 1855–1863, 1873–1905 · **Scènes** : 05, 06.

### J3 · dimanche · Le métro-palais, l'espace, Boulgakov

*Jamais un lundi.*

- **Matin** :
  - *Si vous vous entraînez* : séance 1.
  - **Le Palais du peuple, sous terre**, environ 1 h, de préférence avant 10 h (*Conseil* : moins de monde) :
    1. Maïakovskaïa (ligne 2) ;
    2. Biélorousskaïa (correspondance vers la ligne circulaire ; le nom est correct : Белорусская) ;
    3. Novoslobodskaïa ;
    4. Prospekt Mira ;
    5. Komsomolskaïa ;
    6. retour à Prospekt Mira, puis ligne 6 (orange) jusqu'à VDNKh.
  - Les descriptions des décors seront sourcées station par station.
- **Fin de matinée** :
  - **Allée des Cosmonautes** et monument aux Conquérants de l'espace (107 m, *À confirmer* : à sourcer), avec Tsiolkovski à sa base, à 218 m du métro.
  - **Musée de la Cosmonautique** : Spoutnik, Gagarine, Korolev, Belka et Strelka. Ouvert du mardi au dimanche de 10 h à 19 h, jusqu'à 21 h le jeudi, fermé le lundi, 350 ₽ (*Officiel*, kosmo-museum.ru, 30/09/2026).
- **Déjeuner** : à VDNKh (*Terrain* : vous y avez déjeuné le 20/09, 1786–1787). Adresse à retenir avec vous.
- **Après-midi · VDNKh**, une scène visuelle majeure (≈ 4,6 km estimés sur place) :
  - arche principale, pavillon central ;
  - fontaine de l'Amitié des peuples ;
  - pavillons Arménie et Biélorussie (*Terrain*) ;
  - pavillon Kosmos, avec la fusée Vostok, le Yak-42 et le Mi-8 (*Terrain*) ;
  - fontaine de la Fleur de pierre.
  - *Option* : Moskvarium (*Terrain*, tarifs à confirmer).
- **Fin d'après-midi** :
  - ligne 6, puis ligne 7 jusqu'à **Pouchkinskaïa** ;
  - *option* : **musée d'Histoire contemporaine**, Tverskaïa 21, de 10 h à 20 h, de 11 h à 21 h le jeudi, fermé le lundi (*Officiel*, sovrhistory.ru, 30/09/2026).
- **Coucher du soleil · étangs du Patriarche**, à 700 m du musée. C'est là que commence *Le Maître et Marguerite* de Boulgakov. *Conseil* : relire le premier chapitre avant d'y aller.
- **Soir** : dîner dans le quartier (établissement à sélectionner selon la méthode décrite au J5).
- **Médias** : VDNKh, 1780–1823 (*Terrain*, 20/09). Stations, musée et étangs : à photographier, ou sources libres (§E.4).

### J4 · lundi · La Lastochka, puis Nijni qui respire

- **Matin · train Moscou → Nijni Novgorod** en Lastochka (Ласточка) :
  - 3 h 41 à 4 h 24 selon le train (horaires Yandex Raspisaniya, 30/09/2026 ; *à recouper* sur rzd.ru) ;
  - 401 km à vol d'oiseau entre les deux centres (calculé) ;
  - **gare de départ selon le train, Koursky ou Vostotchny : à lire sur le billet** (*À confirmer* train par train).
  - Procédure : billet nominatif, passeport demandé à l'embarquement (*À confirmer* sur rzd.ru). L'achat se prépare dans le Carnet, puisque les cartes étrangères ne fonctionnent pas. **Vous réservez ; nous préparons.**
  - Arrivée à la gare Moskovski de Nijni, à 3,6 km du kremlin (calculé). *Terrain* : le 22/09, vous étiez au monastère à 14 h 46.
- **Après-midi · Nijni qui respire** :
  - installation ;
  - **monastère de l'Ascension-Petchersky** (*Terrain*, 1929–1931, horaires à confirmer) ;
  - puis le quai Fiodorovski et la première vue sur la Volga.
- **Coucher du soleil** : calculé à 18 h 04 le 22/09 à Nijni, soit 26 min plus tôt qu'à Moscou le même jour. *Conseil* : c'est le même fuseau horaire, mais Nijni est plus à l'est ; il faut penser à avancer les moments « heure dorée ».
- **Soir** : dîner rue Rojdestvenskaïa ou Bolchaïa Pokrovskaïa.
- **Marche** : ≈ 3 km. Journée volontairement légère.

### J5 · mardi · La Grande Verste : du haut de la ville à la Volga

*Votre « Grand Walk VERSTE ». Je propose de l'appeler **La Grande Verste** : ≈ 5 km, soit 4,7 verstes. À vous de trancher.*

| Point | Lieu | Ce qu'on y fait | Tronçon (vol d'oiseau) |
|---|---|---|---|
| **A** | Place Gorki → rue **Bolchaïa Pokrovskaïa** | La rue piétonne : shopping, souvenirs, cafés | — |
| **B** | **Place Minine et kremlin** | Les murailles, la vue sur la confluence | 1,5 km |
| **C** | **Maison Sirotkine**, quai Haut-Volga 3 | **Le tableau** (voir encadré) · *option* : manoir Roukavichnikov, intérieurs (*Terrain*, 1938–1939), aller-retour ≈ 1,2 km | 500 m |
| **D** | **Escalier Tchkalov** | Descente vers la Volga, le panorama | 80 m |
| **E** | Quai Bas-Volga → **église Stroganov** → rue Rojdestvenskaïa | Façade baroque rouge et blanc (*Terrain*, 1940–1941), puis le dîner | 330 m + 1,2 km + 175 m |

- **Distance** : ≈ 5,0 km à pied estimés (3,8 km à vol d'oiseau) ; ≈ 6,4 km avec le manoir Roukavichnikov.
- **Temps** : ≈ 70 à 85 min de marche effective, 5 à 6 h avec les visites.
- **Difficulté** : modérée. Forte pente à l'escalier Tchkalov, prise en **descente**.
- **Horaire conseillé** : départ à 11 h, pour arriver sur le quai Bas-Volga avant le coucher du soleil (≈ 18 h le 22/09, calculé), puis dîner vers 19 h.
- **Pause** : les bancs du quai Haut-Volga, entre C et D. *Conseil* : c'est le plus beau belvédère de la promenade.
- **Médias** : 1934–1941 (*Terrain*, 22/09).

> **Le tableau.**
> - **L'œuvre** : *L'Appel de Minine aux Nijégorodiens* (Воззвание Минина к нижегородцам), de **Konstantin Makovski**, ≈ 7 × 6 m. Année 1896 à sourcer.
> - **Le lieu** : pavillon attenant à la **maison Sirotkine**, quai Haut-Volga 3, **Musée d'art de Nijni Novgorod** (sources : tourister.ru, novation-nn.ru, afisha.ru).
> - **L'intérêt** : 1612, Kouzma Minine appelle les habitants à financer la milice qui libérera Moscou. C'est la scène fondatrice de la ville, peinte à l'échelle d'un mur.
> - **Horaires et billet** : **à confirmer sur le site du musée**. Non trouvés sur une source officielle à ce jour.

**Le restaurant final.**
- **Méthode** : un établissement actuel, cohérent avec le lieu d'arrivée de la marche (rue Rojdestvenskaïa), la cuisine, l'ambiance, le jour et le budget. On ne le choisit pas au seul nombre d'avis.
- **Proposition de base** : **Пяткинъ (Piatkine)**, Rojdestvenskaïa 25, cuisine russe classique, à 175 m de l'église Stroganov.
- **Alternative moderne** : **Yale**, Rojdestvenskaïa 30.
- **Pour une vue sur le kremlin et la Volga** : **Red Wall**, Kojevennaïa 2.
- Source : sélection *The Taste* 2026. Horaires, prix et réservation **à confirmer** avant publication.

**Le sport ce jour-là** : *option tôt le matin* : séance de lutte (voir J6).

### J6 · mercredi · Les trois lacs, la confluence et un soir de KHL si le calendrier le permet

- **Matin · Chtcholokovski Khoutor** (*Terrain*, 24/09, 1971–1976) :
  - trois lacs (Premier, Deuxième, Troisième), avec plages, forêt et pontons (*Officiel*, culture.ru ; tourister.ru) ;
  - à 6,1 km au sud du kremlin (calculé) ; accès en taxi ou en bus (*À confirmer*) ;
  - café sur place : *à confirmer* ;
  - **pêche** : règles locales (zones, périodes d'interdiction) *à vérifier*. Aucune promesse.
- **Après-midi · la Strelka**, là où l'Oka rejoint la Volga :
  - **cathédrale Alexandre-Nevski**, la grande cathédrale ocre près du complexe de hockey (*Terrain*, 1950–1956 ; identifiée) ;
  - **stade de Nijni Novgorod** de la Coupe du monde 2018, à 561 m (calculé) ;
  - **VOLGA Arena**, à 423 m du stade et 173 m de la cathédrale (calculé) : 12 000 places, ouverte en septembre 2026, premier match à domicile du Torpedo le 14/09 (presse locale et Wikipédia ; *à recouper* sur une source officielle).
  - *Option* : **bateau sur la Volga**, si la saison est encore ouverte (vodohod-nn.ru, nameteor.ru : **fin de saison non trouvée, à confirmer**), ou le téléphérique au-dessus du fleuve (*à confirmer*).
- **Soir · match du Torpedo, seulement s'il existe.**
  - Le moteur ne propose un match que s'il est confirmé sur **hctorpedo.ru**.
  - Matchs à domicile annoncés en octobre 2026 par la presse locale (vgoroden.ru), **non encore confirmés sur le site du club** :

    | Date | Adversaire |
    |---|---|
    | jeu. 8/10 | Severstal |
    | lun. 12/10 | Metallurg Magnitogorsk |
    | mer. 14/10 | HC Sotchi |
    | ven. 16/10 | Dynamo Moscou |
    | sam. 24/10 | Dinamo Minsk |

  - *Terrain* : le 24/09, vous étiez en tribune dès 18 h 59.
  - Sans match : dîner chez Red Wall ou quai Bas-Volga.
- **La lutte, verticale de l'offre** :
  - **Centre de lutte « Alexandre Nevski »** (ЦСБ «Александр Невский», anevsky.ru) : lutte gréco-romaine et lutte libre (*Officiel*, site du club).
  - **Accès visiteur : à confirmer** par écrit avant le départ. Autres clubs recensés sur sportschools.ru et kartasporta.ru.
  - Dans l'offre : « séance sur demande, confirmée avant votre départ ». Jamais garantie.
- **Médias** : 1948–1956, 1971–1976, 1980–1989 · **Scènes** : 09, 10.

### J7 · jeudi · Retour à Moscou, dernier soir à Izmaïlovo

- **Matin · Lastochka Nijni (gare Moskovski) → Moscou, gare Vostotchny** (Восточный вокзал) :
  - trajet le plus rapide : 3 h 48 (Yandex Raspisaniya, 30/09/2026 ; *à recouper* sur rzd.ru) ;
  - certains trains arrivent à Koursky (le 727Г par exemple) : **à lire sur le billet**.
- **Après-midi** : installation. *Conseil* : choisir l'hébergement du dernier soir en fonction de l'aéroport du lendemain.
- **Fin d'après-midi · Kremlin d'Izmaïlovo** :
  - ouvert de 9 h à 21 h, entrée libre, métro Partizanskaïa (*Officiel*, kremlin-izmailovo.com, 30/09/2026) ;
  - environ 1,3 km à vol d'oiseau de la gare Vostotchny (≈ 1,7 km à pied estimés, coordonnées de la gare à confirmer) ;
  - marché aux souvenirs voisin : jours d'ouverture *à confirmer*.
- **Soir** : un grand restaurant géorgien, khinkali. **Nom à me donner** (le déjeuner du 21/09, 1852–1854 ?) ou à sélectionner selon la méthode du J5.
- **Nuit** : repos.

### J8 · vendredi · Vol retour

- Vol via Istanbul (*Terrain* : vos vues du hublot du 26/09 au-dessus de la Turquie puis des Balkans, 2014–2017).
- *Conseil* : prévoir large pour les contrôles à l'aéroport. Les délais seront à documenter dans le Carnet.

### Récapitulatif des vérifications de l'itinéraire

| Statut | Ce qui est concerné |
|---|---|
| *Officiel*, vérifié le 30/09/2026 sur le site de l'institution | Nouvelle Tretiakov, Cosmonautique, Histoire contemporaine, Saint-Basile, Kremlin d'Izmaïlovo, lacs de Chtcholokovski Khoutor (culture.ru), disciplines du centre de lutte ; absence de vols directs depuis l'UE (29/09) |
| Source secondaire, *à recouper* | Lastochka (durées, arrivée à Vostotchny : Yandex Raspisaniya), VOLGA Arena (presse, Wikipédia), Dzerjinski au Muzeon (Wikipédia), restaurants (*The Taste*), calendrier du Torpedo (presse locale) |
| *Divergent* | Musée de la Victoire (horaires, prix, lundi) |
| *À confirmer*, aucune source trouvée | Gare de départ à Moscou, procédure RZD, Delovoï Tsentr, horaires du musée d'art de Nijni et du monastère Petchersky, bateau, téléphérique, pêche, accès visiteur au club de lutte, cafés, marché d'Izmaïlovo, accès aux lacs ; chiffres 141,8 m, 107 m, 1953, 1896 et station sur le pont, à sourcer |
| *Terrain* | Toutes les journées : horaires de vos photos, lieux vécus, repas au supermarché |

---

## H. Plan d'implémentation incrémental

Chaque incrément est livrable seul et passe les mêmes portes :
- `npx eslint .`, `npx tsc --noEmit`, `npm test`, `npm run build` ;
- vérification dans le navigateur (desktop, mobile, mouvement réduit), Lighthouse, clavier ;
- entrée au journal du `02` §10, puis commit.

| Incrément | Contenu | Livrable visible | Dépend de vous |
|---|---|---|---|
| **V2.0 · Socle** | GitHub (voir ci-dessous) · `lib/travel/types.ts` · `data/places/moscou.ts`, `data/places/nijni-novgorod.ts` · `lib/sun.ts` + tests · pipeline médias + `media:check` · 25 à 40 photos et 10 à 15 clips traités · tests de données | Rien de visible, mais toutes les données de l'itinéraire sont vérifiables | Accord pour le push ; réponses du §L |
| **V2.1 · Navigation et carte** | Menu « Le voyage » · ligne rouge-index (E, F) · carte Verste à trois niveaux · pages `/destinations/moscou` et `/destinations/nijni-novgorod` · transitions carte → ville (C) | On se déplace dans le site comme sur une carte | Nom de la carte |
| **V2.2a · Le trajet** | Scènes 01–03 : extension de `RouteScene` jusqu'à la descente dans Moscou (A) | La première scène exceptionnelle | — |
| **V2.2b · Saint-Basile** | Scène 04 : photo et 9 points, route interceptée `/lieux/saint-basile` (B), « Ajouter à mon voyage » | La deuxième | — |
| **V2.2c · Sous Moscou** | Scène 05 : séquence de l'escalator et galerie des stations | La troisième | Médias des stations (ou accord pour les sources libres) |
| **V2.2d · Du soleil à la nuit** | Scène 06 : défilement = heure réelle | La quatrième | — |
| **V2.2e · Le tableau de Minine** | Scènes 07–08 : transition vers Nijni, zoom guidé (D) | La cinquième | — |
| **V2.3 · Scènes calmes et interlude** | 09 Volga, 10 Sport, *L'aube*, 12 Carnet ; retrait de `DestinationsRail`, `Problem` et `Manifesto` | L'accueil V2 complet | — |
| **V2.4 · L'itinéraire** | `/itineraires/moscou-nijni-7-jours` : frise J1–J8 (F), cartes par jour, pastilles de vérification, carte MapLibre de la Grande Verste (chargée sur la page seulement) | Le premier produit | Validation du texte du J1 au J8 |
| **V2.5 · Configurateur narratif** | `lib/itinerary/engine.ts` (jours-types, fermetures, coucher du soleil, événements vérifiés) + transformation visuelle (G) | « Votre Russie » devient un vrai itinéraire | Budgets de terrain |
| **V2.6 · 3D Saint-Basile** | Prototype derrière un drapeau, mesuré avec les critères du §D, conservé ou abandonné | La vue « d'en haut » | — |
| **V2.7 · Test et audit n° 2** | Nouveau test des trois personas, audit complet, corrections | `docs/03-audit.md`, section 2 | — |

Les phases F à J de la V1 (Resend, pages légales, Stripe en mode test, Carnet hors ligne, mesure d'audience, SEO et CSP) reprennent dès que vous fournissez les éléments. Elles ne bloquent pas la V2.

### GitHub

Votre dépôt `Marino338/Verste` ne contient qu'un « Initial commit » avec un README ; le travail local compte 6 commits, sur une branche `master`. Ce que je propose, **sans jamais écraser votre commit** :

1. ajouter le dépôt comme `origin` ;
2. renommer la branche locale `master` en `main` ;
3. fusionner votre commit initial avec `--allow-unrelated-histories`, en gardant les deux README fusionnés ;
4. pousser `main`.

Le dépôt est **public** :
- aucune donnée privée n'y entre (GPS, originaux, `.env`) ;
- `docs/` y sera lisible par tous, y compris ce document.

---

## I. Test des trois personas

Chaque persona est simulé deux fois : une fois sur le site actuel (V1), une fois sur les critères de réussite qui serviront au test V2.7.

### 1. Premier voyage en Russie

*Français, 30–45 ans, voyageur aguerri en Europe, inquiet (visa, argent, sécurité, langue).*

**Sur la V1 :**
- Le hero et la route plaisent, et *Russie aujourd'hui* rassure : l'avis du Quai d'Orsay est affiché, daté et sourcé. C'est un point fort à ne pas perdre.
- Le configurateur (7 jours) donne une répartition par ville, mais pas de journée concrète, et le budget reste « à compléter ».
- Aucune photo réelle ; le fondateur est masqué. Il se demande : « Qui êtes-vous, et qu'est-ce que je reçois exactement ? »

**Ce que la V2 doit changer :**
- une journée type visible en moins de trois minutes (J2) ;
- les lignes de métro, la gare et la procédure du train ;
- des photos datées et signées *Terrain* ;
- un aperçu du Carnet ;
- l'interlude *L'aube* avant le configurateur.

**Critères de réussite :**
- il décrit une journée de l'itinéraire sans aide ;
- il dit spontanément que Verste prépare mais ne réserve pas ;
- il trouve l'avis du Quai d'Orsay sans le chercher ;
- il n'y a aucune confusion entre immersion et publicité touristique.

**Risque** : que l'immersion paraisse enjoliver la situation. Parade : l'interlude factuel, les sources partout, aucun superlatif sur la sécurité.

### 2. Passionné d'histoire

*50–65 ans, lecteur, a déjà vu Saint-Pétersbourg ou veut la Russie « profonde ».*

**Sur la V1 :** le manifeste et les destinations restent généraux. Rien sur Saint-Basile, Poklonnaïa, le Muzeon ou Minine. Il quitte le site en pensant qu'il trouvera mieux dans un guide papier.

**Ce que la V2 doit changer :**
- les neuf églises de Saint-Basile, sourcées ;
- les statues du Muzeon et leur histoire après 1991 ;
- le tableau de Minine et l'année 1612 ;
- le kremlin de Nijni ;
- Boulgakov aux étangs du Patriarche ;
- le musée d'Histoire contemporaine.

**Critères de réussite :**
- il apprend au moins trois faits sourcés qu'il ignorait ;
- il repère la différence entre *Officiel*, *Terrain* et *Conseil* ;
- il ajoute au moins deux lieux à son voyage.

**Ligne éditoriale à valider avec vous.** Les lieux de mémoire (Poklonnaïa, musée de la Victoire) peuvent présenter en 2026 des expositions liées à la guerre en cours. Verste décrit les lieux et leur histoire de façon factuelle, sans reprendre leur discours.

### 3. Pratiquant de lutte ou de sports de combat

*25–40 ans, s'entraîne plusieurs fois par semaine, veut garder son rythme et vivre le sport local.*

**Sur la V1 :** l'intérêt « Sport » ajoute Nijni sur 14 jours, mais aucun contenu : ni club, ni salle, ni horaire, ni match. Il ne voit pas ce que Verste lui apporte de plus qu'une recherche.

**Ce que la V2 doit changer :**
- des séances placées dans la journée (vos séances 1 et 2) ;
- la nutrition au supermarché (tvorog, kéfir, sarrasin) ;
- le centre de lutte « Alexandre Nevski », avec la mention « accès confirmé avant le départ » ;
- la VOLGA Arena, avec des matchs **seulement quand ils sont confirmés** ;
- la scène 10.

**Critères de réussite :**
- il voit une journée « entraînement + visite » crédible ;
- il comprend comment demander une séance ;
- il n'y a jamais de match ni de séance présentés comme certains sans confirmation.

**Risque** : promettre un accès au club que personne n'a confirmé. Parade : le statut *À confirmer* reste affiché jusqu'à la réponse écrite du club.

---

## J. Recherche de bibliothèques

Versions, licences et tailles relevées sur npm, GitHub et Bundlephobia en septembre 2026.

| Bibliothèque | Licence | Activité | Next 16 / React 19 | Taille (gzip) | Décision | Raison |
|---|---|---|---|---|---|---|
| **motion** 13 *(en place)* | MIT | Très active | Oui (`motion/react-m` + LazyMotion) | Déjà comptée | **Garder** | Couvre A, E, G ; pas de doublon |
| **lenis** *(en place)* | MIT | Active | Oui | Déjà comptée | **Garder** | Défilement fluide sur desktop, `scrollTo` pour F |
| **d3-geo** + topojson-client + world-atlas *(en place)* | ISC / BSD | Stables | Au build seulement | 0 Ko client | **Garder** | La carte Verste reste calculée au build |
| `<ViewTransition>` de React | MIT | Intégré | Aucune configuration dans Next 16 | 0 Ko | **Adopter** | Interaction C, morphing de la carte (G) |
| CSS `animation-timeline` | Natif | — | — | 0 Ko | **Adopter** en amélioration progressive | Ligne-index (E) sans JS |
| **three** 0.186.1 | MIT | Très active | Oui | ≈ 181 Ko | **Adopter, à la demande** | Saint-Basile seulement (V2.6) |
| **@react-three/fiber** 9.8.1 | MIT | Active | Oui (React ≥ 19 < 19.4) | ≈ 56 Ko | **Adopter, à la demande** | Composants React pour la scène 3D |
| **@react-three/drei** 10.7.9 | MIT | Active | Oui | 509 Ko en entier, quelques Ko en import ciblé | **Import ciblé** (`CameraControls`, `Html`) | Éviter le paquet complet |
| **maath** | MIT | Active | Oui | Petite | **Adopter** avec la 3D | Amortissements |
| @react-three/postprocessing 3.1.3 | MIT | Active | Oui | Lourde | **Écarter** | Coût GPU sans gain de compréhension |
| **maplibre-gl** 6.11.2 | BSD-3 | Très active | Oui (client seulement) | ≈ 278 Ko | **Adopter sur une seule page** | Carte glissante de la Grande Verste (V2.4) |
| react-map-gl 8.1.3 | MIT | Active | Oui | Petite | **Adopter** avec MapLibre | API déclarative |
| **pmtiles** 4.5.0 + OpenFreeMap | BSD-3 / données ODbL | Actives | — | ≈ 8 Ko | **Adopter** | Tuiles auto-hébergées, sans compte ni pistage |
| deck.gl 9.4 | MIT | Active | Oui | Lourde | **Écarter** | Surdimensionné pour deux villes |
| **react-zoom-pan-pinch** 4.2.0 | MIT | Active | Oui | ≈ 15 Ko | **Adopter, à la demande** | Zoom guidé du tableau (D), pincement au doigt |
| yet-another-react-lightbox 3.32.2 | MIT | Active | Oui | ≈ 12 Ko | **Écarter pour l'instant** | `<dialog>` + défilement aimanté suffisent aux galeries |
| photoswipe 5.4.4 | MIT | Active | Oui | ≈ 17 Ko | **Écarter** | Idem |
| openseadragon 6.1.1 | BSD-3 | Active | Client | Moyenne | **Écarter** | Utile pour un scan en gigapixels, que nous n'avons pas |
| gsap 3.15 | Licence propriétaire gratuite | Active | Oui | ≈ 27 Ko | **Écarter** | Doublon de Motion ; licence non libre |
| scrollama | MIT | Inactive depuis 2022 | — | Petite | **Écarter** | `useScroll` + IntersectionObserver suffisent |
| @use-gesture/react | MIT | Dernière version en 2024 | Oui | ≈ 9 Ko | **Écarter** | Les contrôles R3F gèrent déjà le geste |
| @theatre/core | Apache-2.0 / AGPL | Inactive | — | Lourde | **Écarter** | Inactive |
| d3-zoom | ISC | Stable | Oui | ≈ 15 Ko | **Écarter** | La caméra est pilotée par le défilement, pas par l'utilisateur |
| **@gltf-transform/core** 4.5.1 + meshoptimizer | MIT | Actives | Outils de build | 0 Ko client | **Plan B seulement** | Compression du modèle Sketchfab si besoin |
| gltfjsx 6.5.3 | MIT | Inactive depuis 11/2024 | Outil ponctuel | 0 Ko client | **Plan B seulement** | Conversion ponctuelle d'un GLB |
| **heic-convert** (+ libheif-js) | ISC (+ LGPL-3.0) | Active | Outil de build | 0 Ko client | **Adopter** | Décoder vos HEIC |
| **sharp** *(dépendance de Next)* | Apache-2.0 | Très active | Build | 0 Ko client | **Adopter** | Redimensionnement, sRGB, suppression des métadonnées |
| **ffmpeg-static** | GPL-3.0 | Active | Outil de build, jamais distribué | 0 Ko client | **Adopter** | Transcodage HEVC → H.264, séquences |
| **exifr** | MIT | Active | Tests | 0 Ko client | **Adopter** | Prouver l'absence de GPS dans `media:check` |

**Budget V2 :**
- JavaScript initial de l'accueil : au plus +20 Ko de code propre par rapport à aujourd'hui ;
- modules lourds (3D ≤ 300 Ko, MapLibre ≤ 300 Ko, vidéos ≤ 1,5 Mo par boucle) chargés sur intention ou à l'approche seulement ;
- objectifs : LCP ≤ 2,5 s en 4G, CLS < 0,05, INP < 200 ms.

---

## K. Sources consultées (30/09/2026 sauf mention)

| Sujet | Source |
|---|---|
| Musée de la Victoire | victorymuseum.ru · russpass.ru/place/5fb5442f02a7780018a6ac9b |
| Tableau de Makovski, maison Sirotkine | tourister.ru · novation-nn.ru · afisha.ru/nnovgorod/museum/6818 |
| VOLGA Arena | pravda-nn.ru/news/otkrylas-volga-arena-v-nizhnem-novgorode/ · sport24.ru · ru.wikipedia.org/wiki/VOLGA_Арена |
| Lastochka, gare Vostotchny | rasp.yandex.ru/lastochka/nizhniy-novgorod--vostochny-vokzal |
| Chtcholokovski Khoutor | culture.ru/institutes/86198 · tourister.ru |
| Lutte à Nijni | anevsky.ru · sportschools.ru · kartasporta.ru |
| Musée de la Cosmonautique | kosmo-museum.ru/static_pages/stoimost-biletov |
| Nouvelle Tretiakov | tretyakovgallery.ru/for-visitors/museums/novaya-tretyakovka/ |
| Dzerjinski au Muzeon | ru.wikipedia.org (Памятник Дзержинскому, Москва) |
| Musée d'Histoire contemporaine | sovrhistory.ru · culture.ru/institutes/11143 |
| Station Park Pobedy | mos.ru/news/item/19418073/ · ru.wikipedia.org (Парк Победы, станция метро) |
| Kremlin d'Izmaïlovo | kremlin-izmailovo.com/faq · sputnik8.com |
| Saint-Basile | shm.ru/museum/hvb/ · shm.ru/visit/tickets/hvb/ |
| Restaurants de Nijni | thetaste.io/nizhny-novgorod/media/collections/best-restaurants-nizhny-novgorod-2026/ |
| Bateaux sur la Volga | vodohod-nn.ru · nameteor.ru |
| Calendrier du Torpedo | hctorpedo.ru/season/calendar/ · vgoroden.ru (calendrier 2026-2027) |
| Modèle 3D (plan B) | sketchfab.com/3d-models/saint-basils-cathedral-a0b09745ecfe4cfea590eefcaac1e457 |
| Contexte 2026 (29/09) | Voir `02-fondations-v1.md` et la mémoire du projet : avis du Quai d'Orsay, eVisa, WhatsApp, vols, cartes bancaires |
| Coucher du soleil | Calculé (algorithme NOAA), à intégrer dans `lib/sun.ts` avec tests |

---

## L. Questions pour vous

1. **GitHub** : j'ajoute le dépôt, je fusionne avec votre commit initial (sans rien écraser) et je pousse `main` ? Le dépôt est public.
2. **Vorobiovy Gory et musée de la Victoire** : les avez-vous faits ? Vos médias montrent Novodievitchi et Poklonnaïa vue de l'extérieur uniquement.
3. **Médias absents du dossier** : en avez-vous pour les stations-palais, les étangs du Patriarche, Moscow City la nuit, Izmaïlovo, les trains, la lutte, le bateau ou le dîner final ?
4. **IMG_1808** : la personne à l'aquarium accepte-t-elle d'apparaître sur le site ?
5. **IMG_1932–1933** (blindés et obélisque rouge à Nijni) : de quel lieu s'agit-il ?
6. **Le restaurant géorgien** du 21/09 et celui du dernier soir : leurs noms ?
7. **IMG_1887** : pouvez-vous le réexporter ? Le fichier du Drive est illisible.
8. **Noms** : « La Carte » ou « Russia Travel Map » ? « La Grande Verste » ou « Grand Walk » ?
9. **Ligne éditoriale** sur les lieux de mémoire (question du §I.2) : d'accord avec « factuel, sans reprendre leur discours » ?
10. **Partage Drive** : pouvez-vous le restreindre une fois l'import fait ?
