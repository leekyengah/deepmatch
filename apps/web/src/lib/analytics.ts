/** EXT-036/063 — allowlisted client analytics (no PII payloads). */

export const ANALYTICS_EVENTS = [
  "home_view",
  "cta_click",
  "signup_start",
  "login_ok",
  "home_state_view",
  "ai_hub_open",
  "ai_assist_request",
  "lifestyle_browse",
  "cart_checkout_demo",
  "couple_invite_create",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const ALLOWED = new Set<string>(ANALYTICS_EVENTS);

export async function track(
  event: AnalyticsEvent,
  props: Record<string, string | number | boolean> = {},
): Promise<void> {
  if (!ALLOWED.has(event)) return;
  try {
    await fetch("/api/v1/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, props }),
      keepalive: true,
    });
  } catch {
    // fire-and-forget
  }
}
