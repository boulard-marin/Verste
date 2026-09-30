import { getPlace } from "@/data/travel/index";
import { photoOf, toMapPlace, type MapPhoto } from "@/lib/map/data";

import { SaintBasilScene } from "./SaintBasilScene";

/** Server side of the Saint Basil scene: lean data for the client. */
export function SaintBasil() {
  const place = toMapPlace(getPlace("saint-basile"));
  const photo = (slug: string) => photoOf(slug) as MapPhoto;
  const steps = [
    { photo: photo("moscou-arrivee-moscow-city"), line: "Vue d'en haut : la Moskova, les anneaux, et au centre la forteresse." },
    { photo: photo("moscou-kremlin-jardin-alexandre"), line: "La forteresse de brique au bord de la Moskova." },
    { photo: photo("moscou-place-rouge-coucher"), line: "La grande place entre le Kremlin, le Musée historique et le GOUM." },
    { photo: photo("moscou-saint-basile-minine"), line: "Neuf églises sur un même soubassement : une au centre, huit autour." },
  ];
  // Monument to Minin and Pozharsky (OpenStreetMap), where the photo was taken.
  const viewpoint = { coords: [37.62262, 55.7528] as const, photo: photo("moscou-saint-basile-minine") };
  return <SaintBasilScene place={place} steps={steps} viewpoint={viewpoint} />;
}
