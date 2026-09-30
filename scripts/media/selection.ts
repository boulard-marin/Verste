/**
 * Founder media processed for the site. `file` is the original name in the
 * Drive folder (see data/media-inventory.ts); `slug` becomes the public name.
 *
 * - photo: master at 2048 px on the long edge; `wide` adds a 16:9 crop for
 *   desktop compositions (`focusY` = vertical centre of the crop, 0–1).
 * - video: H.264 720p without sound; `hd` adds a 1080p version for full-screen
 *   scenes; `sequence` extracts frames for scroll-driven playback.
 */
export type Selection = {
  file: string;
  slug: string;
  wide?: { focusY: number };
  video?: { start?: number; end?: number; hd?: boolean };
  sequence?: { frames: number };
};

export const selection: Selection[] = [
  // Moscou · arrivée et centre historique
  { file: "IMG_1744.MOV", slug: "moscou-arrivee-moscow-city", video: { hd: true } },
  { file: "IMG_1748.HEIC", slug: "moscou-bolchoi" },
  { file: "IMG_1757.MOV", slug: "moscou-hotel-moskva-lumiere", video: {} },
  { file: "IMG_1760.HEIC", slug: "moscou-kremlin-jardin-alexandre", wide: { focusY: 0.5 } },
  { file: "IMG_1761.HEIC", slug: "moscou-kremlin-tour-grotte" },
  { file: "IMG_1764.HEIC", slug: "moscou-place-rouge-coucher", wide: { focusY: 0.42 } },
  { file: "IMG_1765.HEIC", slug: "moscou-tour-spasskaia" },
  { file: "IMG_1766.HEIC", slug: "moscou-saint-basile-heure-doree" },
  { file: "IMG_1767.HEIC", slug: "moscou-saint-basile-minine", wide: { focusY: 0.36 } },
  { file: "IMG_1768.HEIC", slug: "moscou-saint-basile-minine-2" },
  { file: "IMG_1769.HEIC", slug: "moscou-moskova-kotelnitcheskaia", wide: { focusY: 0.5 } },
  // Moscou · VDNKh
  { file: "IMG_1780.HEIC", slug: "moscou-vdnkh-pavillon-armenie" },
  { file: "IMG_1782.MOV", slug: "moscou-vdnkh-pavillon-central", video: {} },
  { file: "IMG_1786.HEIC", slug: "moscou-vdnkh-dejeuner" },
  { file: "IMG_1794.HEIC", slug: "moscou-vdnkh-pavillon-bielorussie" },
  { file: "IMG_1798.HEIC", slug: "moscou-vdnkh-yak42-vostok" },
  { file: "IMG_1799.HEIC", slug: "moscou-vdnkh-vostok-fontaines", wide: { focusY: 0.45 } },
  { file: "IMG_1802.MOV", slug: "moscou-vdnkh-vostok", video: {} },
  { file: "IMG_1808.MOV", slug: "moscou-moskvarium-visiteuse", video: {} },
  { file: "IMG_1809.MOV", slug: "moscou-moskvarium-bassin", video: {} },
  { file: "IMG_1822.HEIC", slug: "moscou-vdnkh-arche-coucher", wide: { focusY: 0.55 } },
  // Moscou · Novodievitchi, Muzeon, le fleuve
  { file: "IMG_1841.HEIC", slug: "moscou-novodievitchi-murailles" },
  { file: "IMG_1846.HEIC", slug: "moscou-novodievitchi-cathedrale" },
  { file: "IMG_1849.HEIC", slug: "moscou-novodievitchi-etang-moscow-city", wide: { focusY: 0.45 } },
  { file: "IMG_1854.HEIC", slug: "moscou-khinkali" },
  { file: "IMG_1855.HEIC", slug: "moscou-muzeon-groupe" },
  { file: "IMG_1859.HEIC", slug: "moscou-muzeon-alignement" },
  { file: "IMG_1863.HEIC", slug: "moscou-muzeon-armoiries" },
  { file: "IMG_1866.MOV", slug: "moscou-pont-patriarche", video: {} },
  { file: "IMG_1867.HEIC", slug: "moscou-christ-sauveur" },
  // Moscou · Poklonnaïa, du soleil à la nuit
  { file: "IMG_1877.HEIC", slug: "moscou-poklonnaia-1836", wide: { focusY: 0.5 } },
  { file: "IMG_1879.HEIC", slug: "moscou-poklonnaia-1836-b" },
  { file: "IMG_1880.HEIC", slug: "moscou-poklonnaia-tombee-du-jour", wide: { focusY: 0.5 } },
  { file: "IMG_1883.HEIC", slug: "moscou-musee-victoire" },
  { file: "IMG_1887.MOV", slug: "moscou-saint-georges-heure-bleue", video: { hd: true } },
  { file: "IMG_1889.MOV", slug: "moscou-saint-georges-1909", video: {} },
  { file: "IMG_1893.HEIC", slug: "moscou-skyline-poklonnaia-1923" },
  { file: "IMG_1902.MOV", slug: "moscou-fontaines-rouges-1938", video: { end: 10, hd: true } },
  { file: "IMG_1903.MOV", slug: "moscou-fontaines-rouges", video: {} },
  { file: "IMG_1905.MOV", slug: "moscou-escalator-park-pobedy", video: {}, sequence: { frames: 48 } },
  // Nijni Novgorod
  { file: "IMG_1930.HEIC", slug: "nijni-monastere-petchersky", wide: { focusY: 0.55 } },
  { file: "IMG_1932.HEIC", slug: "nijni-parc-victoire-vehicules" },
  { file: "IMG_1933.HEIC", slug: "nijni-parc-victoire-stele" },
  { file: "IMG_1934.MOV", slug: "nijni-kremlin-volga", video: { hd: true } },
  { file: "IMG_1935.HEIC", slug: "nijni-kremlin-mur-volga", wide: { focusY: 0.55 } },
  { file: "IMG_1936.HEIC", slug: "nijni-kremlin-tours", wide: { focusY: 0.6 } },
  { file: "IMG_1937.HEIC", slug: "nijni-tableau-makovski", wide: { focusY: 0.45 } },
  { file: "IMG_1938.HEIC", slug: "nijni-musee-salle" },
  { file: "IMG_1940.HEIC", slug: "nijni-eglise-stroganov" },
  { file: "IMG_1948.HEIC", slug: "nijni-volga-arena" },
  { file: "IMG_1950.HEIC", slug: "nijni-cathedrale-nevski", wide: { focusY: 0.45 } },
  { file: "IMG_1952.HEIC", slug: "nijni-cathedrale-nevski-pelouse" },
  { file: "IMG_1954.HEIC", slug: "nijni-cathedrale-nevski-coupole" },
  { file: "IMG_1955.MOV", slug: "nijni-cathedrale-nevski-interieur", video: { end: 9 } },
  { file: "IMG_1956.HEIC", slug: "nijni-cathedrale-nevski-statue" },
  { file: "IMG_1958.MOV", slug: "nijni-berges-terrasses", video: {} },
  { file: "IMG_1959.HEIC", slug: "nijni-berges-promenade" },
  { file: "IMG_1973.MOV", slug: "nijni-lacs-roseaux", video: {} },
  { file: "IMG_1975.HEIC", slug: "nijni-lacs-ponton", wide: { focusY: 0.55 } },
  { file: "IMG_1976.HEIC", slug: "nijni-lacs-maisons" },
  { file: "IMG_1981.MOV", slug: "nijni-hockey-mise-en-jeu", video: { end: 10, hd: true } },
  { file: "IMG_1984.MOV", slug: "nijni-hockey-drapeau", video: {} },
  { file: "IMG_1989.MOV", slug: "nijni-hockey-salut", video: { end: 10 } },
  // Sport et trajet
  { file: "IMG_1778.JPG", slug: "sport-salle" },
  { file: "IMG_2014.HEIC", slug: "trajet-hublot" },
];
