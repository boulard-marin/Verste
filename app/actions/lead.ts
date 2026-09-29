"use server";

import { z } from "zod";

/**
 * La Première Verste — lead capture. Validates on the server with Zod.
 * Sending (Resend) is wired in phase F; until an API key is configured the
 * action says so plainly instead of pretending the guide was sent.
 */

export type LeadState = {
  status: "idle" | "error" | "ok" | "unavailable";
  message?: string;
  email?: string;
};

const schema = z.object({
  email: z.email().max(254),
  consent: z.literal("on").optional(),
  // Honeypot: invisible to people, filled by some bots
  entreprise: z.string().max(0),
});

export async function submitLead(_previous: LeadState, formData: FormData): Promise<LeadState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    consent: formData.get("consent") ?? undefined,
    entreprise: String(formData.get("entreprise") ?? ""),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    if (raw.entreprise) return { status: "ok" };
    return { status: "error", message: "Cette adresse e-mail ne semble pas valide. Vérifiez-la et réessayez.", email: raw.email };
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
    return {
      status: "unavailable",
      message:
        "L'envoi automatique du guide n'est pas encore activé. Votre adresse n'a pas été enregistrée : revenez dès sa publication.",
      email: raw.email,
    };
  }

  // Phase F: create the contact (with the consent flag) and send the guide.
  return {
    status: "unavailable",
    message: "L'envoi du guide sera activé prochainement. Votre adresse n'a pas été enregistrée.",
    email: raw.email,
  };
}
