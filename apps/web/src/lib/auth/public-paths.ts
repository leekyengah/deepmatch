/** Paths reachable without an authenticated session (HTML). APIs self-enforce. */
export function isPublicPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path === "/") return true;
  if (path === "/robots.txt" || path === "/sitemap.xml") return true;
  if (path.startsWith("/api/")) return true;
  const prefixes = [
    "/login",
    "/signup",
    "/legal",
    "/privacy",
    "/terms",
    "/support",
    "/faq",
    "/account-deletion",
    "/forgot-password",
    "/auth",
    "/couple/join",
  ];
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}
