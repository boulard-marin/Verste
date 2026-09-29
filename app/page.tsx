import { CarnetScene } from "@/components/home/CarnetScene";
import { ConfiguratorTeaser } from "@/components/home/ConfiguratorTeaser";
import { DepartureScene } from "@/components/home/DepartureScene";
import { DestinationsScene } from "@/components/home/DestinationsScene";
import { FounderScene } from "@/components/home/FounderScene";
import { GuideScene } from "@/components/home/GuideScene";
import { HeroScene } from "@/components/home/HeroScene";
import { ManifestoScene } from "@/components/home/ManifestoScene";
import { MoscowScene } from "@/components/home/MoscowScene";
import { OffersScene } from "@/components/home/OffersScene";
import { PositioningScene } from "@/components/home/PositioningScene";
import { ProblemScene } from "@/components/home/ProblemScene";
import { TodayScene } from "@/components/home/TodayScene";
import { RouteScene } from "@/components/itinerary/RouteScene";
import { SurfaceBridge } from "@/components/ui/SurfaceBridge";

/**
 * Homepage: five acts, from night to snow (docs/02-fondations-v1.md §5).
 * Bridges are the only places where the page changes colour between scenes.
 */
export default function HomePage() {
  return (
    <>
      {/* Acte I · L'appel — nuit */}
      <HeroScene />
      <RouteScene />

      {/* Acte II · La découverte — minuit, puis bleu */}
      <ManifestoScene />
      <MoscowScene />
      <DestinationsScene />

      {/* Acte III · L'immersion — bleu, le rouge apparaît */}
      <ProblemScene />
      <PositioningScene />
      <SurfaceBridge from="russian" to="midnight" size="sm" />
      <TodayScene />

      {/* Acte IV · Votre Russie — l'aube, le givre */}
      <SurfaceBridge from="midnight" to="frost" size="lg" />
      <ConfiguratorTeaser />
      <CarnetScene />

      {/* Acte V · Le départ — la neige */}
      <SurfaceBridge from="frost" to="snow" size="sm" />
      <OffersScene />
      <FounderScene />
      <GuideScene />
      <DepartureScene />
    </>
  );
}
