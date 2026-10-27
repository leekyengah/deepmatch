import type { User } from "@supabase/supabase-js";

/** True when Supabase marks the email confirmed (or confirmation disabled → set at signup). */
export function isEmailVerified(user: User | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.email_confirmed_at);
}

/** App HTML routes allowed while email is still unverified. */
export function isUnverifiedAllowedPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path.startsWith("/api/")) return true;
  const prefixes = [
    "/auth",
    "/logout",
    "/legal",
    "/privacy",
    "/terms",
    "/support",
    "/faq",
    "/account-deletion",
  ];
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}
