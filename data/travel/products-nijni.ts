import type { ItineraryDay, Product, SportEvent } from "@/lib/travel/types";

import { secondary } from "./proof.ts";

/**
 * The first Nizhny Novgorod products, built on the founder's week
 * (22–25/09/2026) and verified on official sources on 30/09/2026.
 */

const arrivee: ItineraryDay = {
  id: "nijni-arrivee",
  cityId: "nijni-novgorod",
  title: "Arriver doucement",
  theme: "Récupérer du trajet",
  intro: "Quatre heures de train depuis Moscou suffisent pour une journée. On s'installe, on mange, et on regarde la Volga une première fois, sans rien cocher.",
  morning: [{ title: "Lastochka depuis Moscou", text: "Départ le matin ; gare de départ selon le train (Koursky ou Vostotchny), à lire sur le billet.", effort: 1, durationMin: 240 }],
  afternoon: [
    { title: "Installation et repos", text: "Déposer les bagages, dormir une heure si besoin.", effort: 1, durationMin: 120 },
    { title: "Premier regard sur la confluence", placeId: "quai-fiodorovski", text: "Le quai Fiodorovski en fin d'après-midi : l'Oka, la Volga et la cathédrale de la Strelka en face.", effort: 1, durationMin: 40 },
  ],
  evening: [{ title: "Dîner simple, rue Rojdestvenskaïa", placeId: "rue-rojdestvenskaia", text: "La rue des marchands, à dix minutes à pied : on choisit sur place.", effort: 1, durationMin: 90 }],
  transport: ["Lastochka Moscou → Nijni Novgorod (gare Moskovski)", "Taxi ou métro jusqu'au centre"],
  meals: ["Déjeuner dans le train ou à l'arrivée", "Dîner rue Rojdestvenskaïa"],
  optionalExperiences: ["Si l'énergie est là : le monastère Petchersky au bord de la Volga, comme le 22/09 sur le terrain"],
  media: ["train-lastochka", "nijni-quai-fiodorovski-confluence", "nijni-monastere-petchersky"],
};

const grandeVerste: ItineraryDay = {
  id: "nijni-grande-verste",
  cityId: "nijni-novgorod",
  title: "La Grande Verste",
  theme: "Du kremlin à la Volga, à pied",
  intro: "La journée qui fait comprendre Nijni : le kremlin sur la colline, la cathédrale, le panorama sur la Volga, le tableau de Minine, puis la ville basse, un déjeuner rue Rojdestvenskaïa et le quai jusqu'aux bateaux.",
  morning: [
    { title: "Séance de sambo (option sport)", placeId: "pentka-gym", text: "Pour ceux qui s'entraînent : séance d'essai tôt le matin, avant la marche.", effort: 3, durationMin: 90, optional: true },
    { title: "START · Le kremlin", placeId: "kremlin-nijni", text: "Par la tour Dmitrievskaïa ; excursion guidée sur la muraille à 12 h 30.", effort: 2, durationMin: 45 },
    { title: "02 · La cathédrale", placeId: "cathedrale-archange", text: "La cathédrale de l'Archange-Michel, au cœur de l'enceinte.", effort: 1, durationMin: 15 },
    { title: "03 · Le panorama", placeId: "escalier-tchkalov", text: "La terrasse du monument à Tchkalov : la Volga s'ouvre d'un coup.", effort: 1, durationMin: 20 },
  ],
  afternoon: [
    { title: "04 · Le musée", placeId: "maison-sirotkine", text: "La toile de Makovski, 698 × 594 cm, dans la salle attenante à la maison Sirotkine.", effort: 1, durationMin: 60 },
    { title: "05 · Le centre", placeId: "rue-rojdestvenskaia", text: "L'escalier Tchkalov en descente, puis la rue des marchands.", effort: 2, durationMin: 40 },
    { title: "06 · Le restaurant", placeId: "restaurant-piatkine", text: "Déjeuner tardif chez Piatkine, cuisine russe classique (horaires à confirmer).", effort: 1, durationMin: 75 },
    { title: "07 · Le quai", placeId: "quai-bas-volga", text: "Au ras de l'eau, le kremlin au-dessus de soi.", effort: 1, durationMin: 20 },
  ],
  evening: [{ title: "FINAL · La Volga", placeId: "embarcadere-volga", text: "Un bateau au coucher du soleil si la saison est ouverte ; sinon, le téléphérique jusqu'à Bor.", effort: 1, durationMin: 60 }],
  transport: ["Métro jusqu'à Gorkovskaïa, puis à pied jusqu'à la place Minine", "Tout le parcours à pied", "Retour en taxi ou en métro depuis la place Markine"],
  meals: ["Pause sur la terrasse du monument à Tchkalov", "Déjeuner tardif chez Piatkine", "Dîner léger dans la ville basse"],
  optionalExperiences: ["Manoir Roukavichnikov", "Excursion guidée sur la muraille du kremlin"],
  avoid: { weekdays: ["lun"], reason: "Le musée d'art (tableau de Minine) est fermé le lundi." },
  media: ["nijni-kremlin-mur-volga", "nijni-tableau-makovski", "nijni-escalier-tchkalov", "nijni-bateau-volga"],
};

const strelka: ItineraryDay = {
  id: "nijni-strelka",
  cityId: "nijni-novgorod",
  title: "La Strelka et la Volga",
  theme: "Souvenirs, la cathédrale de la confluence, un soir de hockey si le calendrier le permet",
  intro: "Le matin pour les souvenirs, l'après-midi là où l'Oka rejoint la Volga : la cathédrale ocre, le stade de 2018, la nouvelle patinoire, puis le fleuve.",
  morning: [
    { title: "Souvenirs et artisanat", placeId: "boutique-promysly", text: "Peinture de Gorodets, Khokhloma : l'artisanat de la région, au 43 de la rue Bolchaïa Pokrovskaïa.", effort: 1, durationMin: 60 },
    { title: "La Banque d'État", placeId: "banque-etat", text: "Le décor néo-russe de la grande rue, vu de près.", effort: 1, durationMin: 20 },
  ],
  afternoon: [
    { title: "Cathédrale Alexandre-Nevski", placeId: "cathedrale-nevski", text: "La grande cathédrale ocre de la Strelka, intérieur peint.", effort: 1, durationMin: 40 },
    { title: "Le stade de la Coupe du monde et la VOLGA Arena", placeId: "stade-nijni", text: "Le tour des équipements sportifs de la Strelka, à pied.", effort: 1, durationMin: 40 },
    { title: "Sur la Volga", placeId: "embarcadere-volga", text: "Une promenade en bateau si la saison est encore ouverte ; sinon le téléphérique au-dessus du fleuve.", effort: 1, durationMin: 90 },
  ],
  evening: [
    { title: "Match du Torpedo à la VOLGA Arena", placeId: "volga-arena", text: "Seulement si un match à domicile est confirmé sur hctorpedo.ru pour cette date.", effort: 2, durationMin: 180, optional: true },
    { title: "Sinon, dîner face au kremlin", placeId: "restaurant-red-wall", text: "Red Wall, au pied du kremlin, vue sur la Volga (horaires à confirmer).", effort: 1, durationMin: 90 },
  ],
  transport: ["Métro jusqu'à Strelka pour l'après-midi", "Taxi pour le retour après un match"],
  meals: ["Déjeuner dans le centre", "Dîner Red Wall, ou après le match"],
  optionalExperiences: ["Téléphérique Nijni – Bor au-dessus de la Volga"],
  media: ["nijni-cathedrale-nevski", "nijni-volga-arena", "nijni-hockey-mise-en-jeu", "nijni-bateau-volga"],
};

const nature: ItineraryDay = {
  id: "nijni-nature",
  cityId: "nijni-novgorod",
  title: "Nijni — Nature",
  theme: "Les trois lacs, la forêt, puis la Volga",
  intro: "Une journée pour respirer : la forêt de Chtcholokovski Khoutor au sud de la ville, ses trois lacs et son musée d'architecture en bois, puis la Volga en fin de journée.",
  morning: [
    { title: "Les trois lacs de Chtcholokovski Khoutor", placeId: "chtcholokovski", text: "Le tour des lacs par les sentiers aménagés, les pontons, la forêt. Petites plages : baignade selon la saison et les règles affichées sur place.", effort: 2, durationMin: 120 },
    { title: "Musée d'architecture en bois", placeId: "chtcholokovski", text: "Maisons et églises de bois de la région, dans le même parc (fermé lundi et mardi, à confirmer).", effort: 1, durationMin: 60, optional: true },
  ],
  afternoon: [
    { title: "Pêche, seulement si c'est autorisé", placeId: "chtcholokovski", text: "Aucune règle officielle trouvée pour les lacs : on se renseigne sur place avant de sortir une ligne.", effort: 1, durationMin: 90, optional: true },
    { title: "Sur la Volga", placeId: "embarcadere-volga", text: "Promenade en bateau depuis la gare fluviale si la saison est ouverte ; sinon le téléphérique jusqu'à Bor.", effort: 1, durationMin: 90 },
  ],
  evening: [{ title: "Coucher du soleil sur la confluence", placeId: "quai-fiodorovski", text: "Le belvédère du quai Fiodorovski, puis dîner rue Rojdestvenskaïa.", effort: 1, durationMin: 60 }],
  transport: ["Taxi jusqu'à Chtcholokovski Khoutor (transports en commun à confirmer)", "Taxi ou métro pour revenir au centre"],
  meals: ["Pique-nique ou café du parc (à confirmer sur place)", "Dîner dans le centre"],
  optionalExperiences: ["Téléphérique au-dessus de la Volga"],
  avoid: { weekdays: ["lun", "mar"], reason: "Le musée d'architecture en bois serait fermé le lundi et le mardi (à confirmer)." },
  media: ["nijni-lacs-ponton", "nijni-lacs-roseaux", "nijni-lacs-maisons", "nijni-telepherique-volga"],
};

export const nijniDays = { arrivee, grandeVerste, strelka, nature };

export const nijniTroisJours: Product = {
  id: "nijni-3-jours",
  title: "Nijni — 3 jours",
  cityId: "nijni-novgorod",
  subtitle: "Arriver, marcher La Grande Verste, finir sur la Strelka",
  days: [arrivee, grandeVerste, strelka],
};

export const nijniNature: Product = {
  id: "nijni-nature",
  title: "Nijni — Nature",
  cityId: "nijni-novgorod",
  subtitle: "Une journée de lacs, de forêt et de Volga, à ajouter aux trois jours",
  days: [nature],
};

/**
 * Torpedo home games announced by the local press for October 2026. They are
 * NOT confirmed on the club's site: the engine never proposes them as certain.
 */
const press = secondary("Vgoroden, calendrier du Torpedo 2026-2027", "https://www.vgoroden.ru/statyi/hk-torpedo-polnoe-raspisanie-matchey-kalendar-igr-na-sezon-2026-2027");
export const torpedoAnnounced: SportEvent[] = [
  { id: "torpedo-2026-10-08", venueId: "volga-arena", date: "2026-10-08", title: "Torpedo – Severstal" },
  { id: "torpedo-2026-10-12", venueId: "volga-arena", date: "2026-10-12", title: "Torpedo – Metallurg Magnitogorsk" },
  { id: "torpedo-2026-10-14", venueId: "volga-arena", date: "2026-10-14", title: "Torpedo – HC Sotchi" },
  { id: "torpedo-2026-10-16", venueId: "volga-arena", date: "2026-10-16", title: "Torpedo – Dynamo Moscou" },
  { id: "torpedo-2026-10-24", venueId: "volga-arena", date: "2026-10-24", title: "Torpedo – Dinamo Minsk" },
].map((e) => ({
  ...e,
  date: e.date as SportEvent["date"],
  verification: { status: "a-verifier" as const, checkedAt: "2026-09-30" as const, sources: [press], note: "Non confirmé sur hctorpedo.ru au 30/09/2026." },
}));
