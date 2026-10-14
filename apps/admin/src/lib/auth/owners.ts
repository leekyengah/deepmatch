/** Bootstrap allowlist — must match founder seed / ADMIN_OWNER_EMAILS. */
export const DEFAULT_OWNER_EMAILS = ["leekyengah@gmail.com"] as const;

export function ownerEmailAllowlist(): string[] {
  const fromEnv = (process.env.ADMIN_OWNER_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const merged = new Set<string>([
    ...DEFAULT_OWNER_EMAILS.map((e) => e.toLowerCase()),
    ...fromEnv,
  ]);
  return [...merged];
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ownerEmailAllowlist().includes(email.trim().toLowerCase());
}

export type StaffRole = "owner" | "admin" | "moderator" | "advisor" | "support";

export function isFullAccessRole(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
