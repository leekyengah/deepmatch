export async function register() {
  const env = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || env === "local") return;

  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }
    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  } catch {
    // Sentry optional — never block app boot
  }
}
