# VERSTE — V3 · Une expérience de voyage vivante

*30/09/2026. Suite de `06-v2.2-monde-interactif.md`. Journal : `02` §10.*

Le but de la V3 n'était pas d'ajouter des composants, mais d'ajouter du monde. Priorité : l'image, puis l'interaction, puis quelques mots. On comprend avec les yeux avant de comprendre avec les mots.

## A. Le parcours de démonstration

Le premier écran pose VERSTE, puis la Russie, puis l'expérience, puis l'action. Le voyage enchaîne ensuite les étapes suivantes :

1. **Le vol.** Un petit avion part de Paris, pose à Istanbul, fait demi-tour au sol, puis atterrit à Cheremetievo. Il vole sur le vrai globe, et c'est le défilement qui le fait avancer.
2. **Moscou.** La même carte plonge sur la ville.
3. **Le Kremlin**, un hub à explorer : place Rouge, cathédrales, jardin d'Alexandre, Saint-Basile.
4. **Saint-Basile**, en huit temps.
5. **Le Bolchoï.**
6. **Le métro.**
   - « Descendre » à Okhotny Riad.
   - L'escalator réel.
   - La station.
   - Le trajet station après station, jusqu'à Vorobiovy Gory.
7. **Moscou, suite :** Muzeon, VDNKh, Poklonnaïa, Moscow City la nuit.
8. **Le train :** la Lastochka.
9. **Nijni Novgorod.**
   - La ville à l'aube.
   - Le kremlin sur sa falaise.
   - La Grande Verste.
   - Le hockey.
   - Les trois lacs.
10. **« D'autres Russie ».** Moscou et Nijni ont été vécues sur le terrain. Saint-Pétersbourg et Kazan sont préparées sur sources.
11. **Votre voyage :** le configurateur et la Russia Travel Map.

| Mission du brief | Résultat |
|---|---|
| 1-2 Fondateur | Placeholders supprimés. Section écrite avec les informations fournies (terrain 2026, russe A2, sports de combat, pourquoi VERSTE). Mini-carte : villes vécues ● et destinations préparées ○ |
| 3 Logo | « La borne » V3 : mot extra-gras et serré, borne redessinée, signature RUSSIA TRAVEL sous la ligne rouge, plus grand dans l'en-tête. `/marque` à jour |
| 4 Avion | `lib/voyage/flight.ts` (pur, testé), scènes `paris`, `istanbul`, `cap-au-nord` |
| 5-7 Carte, Saint-Pétersbourg, Kazan | Russia Travel Map refaite :<br>– voyage animé depuis Moscou et palette propre à chaque ville ;<br>– quartiers et lieux ;<br>– météo du moment ;<br>– 13 nouveaux lieux sourcés et 4 images libres |
| 8 Scènes et portails | Voir B |
| 9 Objets 3D | Kremlin de Moscou (tours, toits en tente, étoiles), couleurs OSM des monuments, hotspots, séquence Saint-Basile |
| 10 Transitions | Déclarées par les scènes : noir en descendant, lumière en ressortant. Vol, trajet ferroviaire, voyage sur la carte |
| 11 Métro | Surface, entrée, escalator, station, arrêt à chaque station (nom en cyrillique sur le quai), sortie au jour |
| 12 Parcours complet | Voir le début de cette section |
| 13 Configurateur | Le voyage se compose sous les yeux (`lib/configurator/compose.ts`) |
| 14 Nijni | La Grande Verste, le hockey et la forêt ajoutés au voyage de l'accueil |
| 15 Audit | Voir G |

## B. Architecture : Scène et Portail

```text
Scene                                   lib/voyage/types.ts
 ├── camera       clés de caméra interpolées par le défilement (monde)
 ├── environment  monde · metro · train · fin
 ├── objects      modèles 3D qui montent (Saint-Basile) ; forteresses (kremlins)
 ├── hotspots     points à explorer : vol de caméra et carte courte ; le défilement reprend la main
 ├── transition   in / out : dark (sous terre), light (sortie du métro, du train)
 ├── vehicle      l'avion : position, cap, altitude, fonction pure du défilement
 ├── marks, lines repères (aéroports, stations, villes) et lignes nommées (routes, schémas)
 └── portals      sauts explicites ; la scène suivante (NextScene) est la suite du défilement

Portal
 ├── sourceScene  la scène qui le porte
 ├── targetScene  { scene, at } ou { href }
 ├── interaction  clic : portail, carte d'un hotspot ; défilement : la suite
 ├── transition   celle que déclare la scène d'arrivée
 └── preload      par proximité :
                  – le monde se charge à 120 % d'écran ;
                  – le métro se construit à une scène d'écart ;
                  – les images de l'escalator se chargent à côté du métro
```

Saint-Basile → Kremlin, métro → Vorobiovy Gory et Moscou → Nijni ne sont plus des cas particuliers : ce sont des scènes, des transitions et des portails déclarés dans `data/voyage/scenes.ts`. Chaque mouvement est une fonction pure, testée :

- `flight.ts` : l'avion ;
- `ride.ts` : le métro ;
- `fortress.ts` : les kremlins ;
- `compose.ts` : le configurateur.

## C. 3D

**Kremlin de Moscou.** Les tuiles OSM n'ont pas de drapeau `hide_3d` pour les tours : leur emprise pleine hauteur boxait les étages. Le modèle reconstruit donc les 20 tours à partir de leurs étages OSM :

- l'étage le plus haut devient un toit en tente vert ;
- les cinq tours à étoile reçoivent une étoile rubis : Spasskaïa, Nikolskaïa, Troïtskaïa, Borovitskaïa, Vodovzvodnaïa ;
- les autres reçoivent un épi doré ;
- la muraille OSM est conservée ;
- seules les tours principales sont nommées.

**Couleurs réelles.** Un monument éclairé prend sa couleur OSM (`colour`) : ocre de l'Arsenal et du Sénat, dorures, brique. Elle est adoucie de 30 % vers la teinte de l'éclairage de nuit. Les boîtes `hide_3d` sont retirées partout.

**Hotspots.** Leur texte, leur photo et leur lien viennent de la fiche du lieu (`data/travel`). Rien n'est écrit deux fois.

**Recherche de modèles externes** (Saint-Basile, Kremlin, Bolchoï, métro, VDNKh, MGU, gare, train) :

- Sketchfab : le téléchargement exige un compte, que VERSTE ne crée pas depuis cet environnement, et la licence varie selon le modèle.
- TurboSquid et CGTrader : commerciaux.
- Free3D : compte obligatoire.
- Thingiverse et Printables : modèles d'impression, souvent en CC BY-NC.

Retenu : des modèles dérivés d'OpenStreetMap (ODbL) et procéduraux. C'est légal, précis, léger, et chaque mesure a sa source. Si un GLB en CC0 ou CC BY est fourni plus tard, la chaîne `@gltf-transform/cli` + meshopt reste la voie prévue (compression, chargement paresseux).

## D. Bibliothèques : décisions

| Outil | Décision | Raison |
|---|---|---|
| MapLibre 6 (projection globe, atmosphère, relief, extrusions) | Gardé, poussé plus loin | Le monde entier, du globe au quartier, dans un seul moteur |
| three.js | Gardé | Saint-Basile dans la carte, environnement métro |
| Motion (`domMin`) | Gardé | Défilement, apparitions, tracés. Pas d'animations de layout : largeurs animées directement |
| Lenis | Gardé | Défilement doux, portails |
| React Three Fiber, Drei | Écarté | Scènes scénarisées et impératives dans MapLibre ; poids du bundle |
| GSAP, React Spring, Theatre.js | Écarté | Motion couvre le besoin ; Theatre.js est inactif |
| Zustand | Écarté | L'état du voyage vit dans l'URL : partageable, bouton retour, sans JavaScript |
| Radix, shadcn | Écarté | Peu de widgets ; éléments natifs accessibles (`details`, `fieldset`, boutons) |
| Embla | Écarté | Aucun carrousel utile |
| React Hook Form, Zod | Écarté | Formulaires GET lus par une liste blanche (`lib/configurator/params.ts`) |
| OpenLayers | Écarté | Moins adapté à la 3D et au globe que MapLibre |
| Audio | Reporté | Règles d'autoplay ; les sons CC0 (Freesound) exigent un compte. À proposer en option |

## E. API et données

| Source | Usage | Au rendu ? |
|---|---|---|
| OpenStreetMap via OpenFreeMap (tuiles vectorielles) | La carte, les bâtiments, les couleurs, les quartiers | Oui (tuiles) |
| Overpass, Wikipédia (API), tuiles POI | Recherche : tours, stations, coordonnées. Résultats stockés dans le dépôt, datés | Non |
| Wikimedia Commons | 4 images libres de Saint-Pétersbourg et Kazan, créditées | Non |
| Open-Meteo (CC BY 4.0) | Météo du moment sur la carte, via `app/api/meteo` : route statique revalidée toutes les 30 min. Le navigateur ne contacte aucun tiers | Oui, en cache serveur |
| Yandex Raspisaniya | Durées des trains (Sapsan 754А : 3 h 47 ; 002Й : 11 h 20), relevées le 30/09/2026, « à confirmer » | Non |
| GTFS | Aucun flux ouvert exploitable trouvé pour le métro ou les RZD | Non |
| API sportives, événements | Aucune source gratuite fiable (calendrier du Torpedo toujours « annoncé, non confirmé ») | Non |

**Règle.** Ce qui change rarement vit dans le dépôt : monuments, coordonnées, distances, photos, itinéraires. Ce qui change souvent passe par une route revalidée, avec un repli : la météo aujourd'hui. Aucune donnée personnelle n'est envoyée ; les User-Agents sont génériques.

## F. Confiance

- **Terrain ou sources, partout.** Villes vécues (Moscou, Nijni) et destinations préparées (Saint-Pétersbourg, Kazan) sont distinguées sur quatre surfaces :
  - la section fondateur ;
  - la carte ;
  - les fiches de lieux ;
  - l'atlas du configurateur.

  Un test interdit toute note de terrain sur une ville préparée.
- **Tracés déclarés** comme réels, indicatifs (par les gares) ou schématiques :
  - Istanbul → Moscou est stylisé par la mer Noire, car le grand cercle traverse l'Ukraine, dont l'espace aérien est fermé depuis 2022 ;
  - les kilomètres du vol restent à vol d'oiseau entre aéroports.
- **Aucun club, prix ou horaire inventé.** La journée sport dit « club à confirmer ».

## G. Audit du 30/09/2026

| Contrôle | Résultat |
|---|---|
| Débordement horizontal, 9 pages à 390, 768, 1280 et 1440 px | Aucun |
| Logo et navigation | Aucun chevauchement : écart logo / menu de 87 px à 1280, 247 px à 1440. Menu repliable sous 1280 |
| 3D et monde | Vérifiés dans le navigateur, scène par scène : vol, Kremlin, hotspots, Saint-Basile, métro, Nijni, carte, configurateur |
| Tests | 59 (vol, trajet de métro, forteresses, composition, météo, données) |
| Médias | `media:check` : aucune métadonnée de lieu, tous les médias déclarés |

## H. Limites et suite

- **Le vol :** le tracé Istanbul → Moscou est stylisé ; la vraie route aérienne n'est pas dessinée.
- **Moscou → Kazan :** simple arc schématique ; le parcours ferroviaire n'est pas vérifié ici.
- **Saint-Pétersbourg et Kazan :** pas de photos de terrain, pas d'horaires ni de prix ; les journées types restent « à construire avec vous ».
- **Kremlin de Moscou :** merlons en queue d'aronde non modélisés (muraille OSM conservée) ; toits stylisés.
- **Métro :** ligne 1 seulement ; les autres lignes sont annoncées « bientôt ».
- **Configurateur :** la branche alternative est une proposition ; le moteur ne permute pas encore les villes.
- **À suivre :**
  - monument aux Conquérants de l'espace (VDNKh) et Poklonnaïa au niveau objet ;
  - son en option ;
  - quartiers de Moscou dans la carte ;
  - un séjour de terrain à Saint-Pétersbourg et à Kazan.
