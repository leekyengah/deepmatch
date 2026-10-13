/** Cookie names that carry Supabase / auth session material. */
export function isAuthCookieName(name: string): boolean {
  return (
    name.startsWith("sb-") ||
    name.includes("auth-token") ||
    name.includes("supabase")
  );
}
