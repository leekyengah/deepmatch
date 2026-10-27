/** Allow only same-origin relative redirects (couple join / invite). */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/me",
): string {
  if (!raw) return fallback;
  const next = raw.trim();
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("://") || next.includes("\\")) return fallback;
  if (
    next.startsWith("/couple/join") ||
    next.startsWith("/couple/invite") ||
    next.startsWith("/onboarding") ||
    next.startsWith("/discover") ||
    next.startsWith("/me")
  ) {
    return next.slice(0, 500);
  }
  return fallback;
}
