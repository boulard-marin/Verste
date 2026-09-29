"use client";

import { useActionState, useEffect, useId } from "react";

import { submitLead, type LeadState } from "@/app/actions/lead";
import { buttonClass } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

const initial: LeadState = { status: "idle" };

/**
 * Native form + Server Action: works before hydration and without
 * JavaScript. The follow-up e-mails require an explicit, unticked opt-in.
 */
export function LeadForm() {
  const [state, action, pending] = useActionState(submitLead, initial);
  const id = useId();

  useEffect(() => {
    if (state.status === "ok") track("lead_submitted", { source: "premiere-verste" });
  }, [state.status]);

  return (
    <form action={action} className="grid gap-5" aria-describedby={`${id}-privacy`}>
      <div className="grid gap-2">
        <label htmlFor={`${id}-email`} className="label text-fg-2">
          Votre adresse e-mail
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          defaultValue={state.email}
          aria-invalid={state.status === "error"}
          aria-describedby={`${id}-status`}
          placeholder="prenom@exemple.fr"
          className="min-h-12 rounded-xs border border-fg/25 bg-white px-4 text-[1rem] text-ink placeholder:text-fg-2/60 focus-visible:border-route aria-[invalid=true]:border-route"
        />
      </div>

      <div className="flex gap-3">
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-[var(--route)]"
        />
        <label htmlFor={`${id}-consent`} className="text-[0.9rem] leading-snug text-fg-2">
          J&apos;accepte aussi de recevoir quatre conseils pratiques par e-mail dans les douze jours qui suivent.
          Désinscription en un clic.
        </label>
      </div>

      {/* Honeypot, hidden from people and assistive technologies */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-entreprise`}>Entreprise</label>
        <input id={`${id}-entreprise`} name="entreprise" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full disabled:opacity-60 sm:w-auto" })}>
        {pending ? "Envoi…" : "Recevoir La Première Verste"}
      </button>

      <p id={`${id}-status`} role="status" aria-live="polite" className="min-h-[1.5em] text-[0.9rem] text-fg">
        {state.message}
      </p>
      <p id={`${id}-privacy`} className="text-[0.82rem] leading-snug text-fg-2">
        Votre adresse sert uniquement à vous envoyer le guide et, si vous l&apos;acceptez, ces conseils. Elle n&apos;est
        ni revendue ni partagée.
      </p>
    </form>
  );
}
