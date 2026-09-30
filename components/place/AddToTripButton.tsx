"use client";

import { Check, Plus } from "lucide-react";

import { toggleTripPlace, useTrip } from "@/lib/trip";

export function AddToTripButton({ placeId, className = "" }: { placeId: string; className?: string }) {
  const added = useTrip().includes(placeId);
  return (
    <button
      type="button"
      onClick={() => toggleTripPlace(placeId)}
      aria-pressed={added}
      className={`inline-flex min-h-12 items-center gap-2 rounded-xs px-5 text-[0.95rem] font-medium transition-colors duration-fast ${
        added ? "border border-fg/40 text-fg" : "bg-route text-on-route hover:brightness-110"
      } ${className}`}
    >
      {added ? <Check aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}
      {added ? "Dans mon voyage" : "Ajouter à mon voyage"}
    </button>
  );
}
