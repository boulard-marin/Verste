/**
 * Funnel events (docs/02-fondations-v1.md §6). The provider is chosen in
 * phase I; until then events are only logged in development so every call
 * site is already wired.
 */
export type AnalyticsEvent =
  | "hero_cta_click"
  | "route_completed"
  | "destination_open"
  | "today_open"
  | "configurator_started"
  | "configurator_completed"
  | "lead_submitted"
  | "pricing_viewed"
  | "checkout_started"
  | "purchase_completed";

export type AnalyticsProps = Record<string, string | number | boolean>;

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.debug("[track]", event, props ?? {});
  }
}
