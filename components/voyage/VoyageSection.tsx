import { getJourney } from "@/data/travel/journeys";
import { flightLegs, flightMarks } from "@/data/voyage/flight";
import { highlights, metroLine1, outlines, scenes } from "@/data/voyage/scenes";
import { photoOf } from "@/lib/map/data";
import { lineKm } from "@/lib/travel/geo";
import { getMedia } from "@/lib/travel/media";

import { Voyage, type VoyageMedia, type VoyageScene } from "./Voyage";

function media(slug: string): VoyageMedia | null {
  const photo = photoOf(slug);
  const m = getMedia(slug);
  if (!photo || !m) return null;
  return { ...photo, ...(m.type === "video" ? { video: m.src } : {}) };
}

/** Server side of the journey: media resolved, distances computed, lean props. */
export function VoyageSection() {
  const resolved: VoyageScene[] = scenes.map((s) => ({ ...s, resolved: (s.media ?? []).map(media).filter((x): x is VoyageMedia => x !== null) }));
  const rail = getJourney("train-moscou-nijni");
  const total = lineKm(rail.path);
  const at = (index: number) => lineKm(rail.path.slice(0, index + 1)) / total;
  const stations = [
    { ru: "Москва", fr: "Moscou", at: 0 },
    { ru: "Владимир", fr: "Vladimir", at: at(6) },
    { ru: "Ковров", fr: "Kovrov", at: at(7) },
    { ru: "Дзержинск", fr: "Dzerjinsk", at: at(10) },
    { ru: "Нижний Новгород", fr: "Nijni Novgorod", at: 1 },
  ];
  const sequence = getMedia("moscou-escalator-park-pobedy")?.sequence;
  if (!sequence) throw new Error("Escalator sequence missing: run npm run media:process");
  return (
    <Voyage
      scenes={resolved}
      highlights={highlights}
      outlines={outlines}
      line={metroLine1}
      train={{ path: rail.path, stations, duration: `${rail.duration?.value ?? ""} (à recouper sur rzd.ru)` }}
      escalator={sequence}
      fortresses="kremlin-nijni"
      label="Le voyage, de Paris à Nijni Novgorod"
      legs={flightLegs}
      marks={flightMarks}
    />
  );
}
