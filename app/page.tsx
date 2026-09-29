import { HeroScene } from "@/components/home/HeroScene";
import { ManifestoScene } from "@/components/home/ManifestoScene";
import { RouteScene } from "@/components/itinerary/RouteScene";

/**
 * Homepage: five acts, fourteen scenes, from night to snow
 * (docs/02-fondations-v1.md §5). Increment 1: S01–S03.
 */
export default function HomePage() {
  return (
    <>
      <HeroScene />
      <RouteScene />
      <ManifestoScene />
    </>
  );
}
