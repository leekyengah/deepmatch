/** Optional Sentry bootstrap — no-op when DSN missing or SDK not installed. */

export async function initSentry(
  runtime: "client" | "server" | "edge",
): Promise<void> {
  const dsn =
    runtime === "client"
      ? process.env.NEXT_PUBLIC_SENTRY_DSN
      : (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);

  if (!dsn) return;
  if ((process.env.NEXT_PUBLIC_APP_ENV ?? "local") === "local") return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "staging",
      tracesSampleRate: runtime === "edge" ? 0.05 : 0.1,
    });
  } catch {
    console.warn("[sentry] SDK unavailable; skipping init");
  }
}
