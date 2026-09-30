import { CarnetScene } from "@/components/home/CarnetScene";
import { DepartureScene } from "@/components/home/DepartureScene";
import { FounderScene } from "@/components/home/FounderScene";
import { GuideScene } from "@/components/home/GuideScene";
import { HeroScene } from "@/components/home/HeroScene";
import { OffersScene } from "@/components/home/OffersScene";
import { PositioningScene } from "@/components/home/PositioningScene";
import { TodayScene } from "@/components/home/TodayScene";
import { RouteScene } from "@/components/itinerary/RouteScene";
import { SurfaceBridge } from "@/components/ui/SurfaceBridge";
import { VoyageSection } from "@/components/voyage/VoyageSection";

/**
 * Homepage: enter, travel, then prepare (docs/06-v2.2-monde-interactif.md).
 * The journey carries the night-to-dawn arc; what follows is the part that
 * explains, from the 2026 context to the offers.
 */
export default function HomePage() {
  return (
    <>
      {/* Entrer — nuit */}
      <HeroScene />
      <RouteScene />

      {/* Traverser — Moscou, le métro, le train, Nijni à l'aube */}
      <VoyageSection />

      {/* Avant de partir — le cadre, puis ce que nous préparons */}
      <SurfaceBridge from="frost" to="russian" size="sm" />
      <PositioningScene />
      <SurfaceBridge from="russian" to="midnight" size="sm" />
      <TodayScene />
      <SurfaceBridge from="midnight" to="frost" size="lg" />
      <CarnetScene />

      {/* Partir — la neige */}
      <SurfaceBridge from="frost" to="snow" size="sm" />
      <OffersScene />
      <FounderScene />
      <GuideScene />
      <DepartureScene />
    </>
  );
}
