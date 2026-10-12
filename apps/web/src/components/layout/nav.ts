export type NavItem = {
  href: string;
  labelKey: string;
  match?: "exact" | "prefix";
};

export const primaryNav: NavItem[] = [
  { href: "/home", labelKey: "nav.home", match: "exact" },
  { href: "/discover", labelKey: "nav.discover", match: "prefix" },
  { href: "/likes", labelKey: "nav.likes", match: "prefix" },
  { href: "/chat", labelKey: "nav.chat", match: "prefix" },
  { href: "/couple", labelKey: "nav.couple", match: "prefix" },
  { href: "/lifestyle", labelKey: "nav.lifestyle", match: "prefix" },
  { href: "/services", labelKey: "nav.services", match: "prefix" },
  { href: "/me", labelKey: "nav.me", match: "prefix" },
];

/** ADR-11 — 5-tab mobile: Khám phá · Sánh đôi · Đồng hành · Tin nhắn · Cá nhân */
export const mobileNav: NavItem[] = [
  { href: "/discover", labelKey: "nav.explore", match: "prefix" },
  { href: "/couple", labelKey: "nav.memories", match: "prefix" },
  { href: "/services", labelKey: "nav.companion", match: "prefix" },
  { href: "/chat", labelKey: "nav.messages", match: "prefix" },
  { href: "/me", labelKey: "nav.me", match: "prefix" },
];

export function isNavActive(pathname: string, item: NavItem) {
  if (item.match === "exact") return pathname === item.href;
  if (item.href === "/me") {
    return pathname === "/me" || pathname.startsWith("/me/");
  }
  if (item.href === "/couple") {
    return pathname === "/couple" || pathname.startsWith("/couple/");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Maps pathname → message key under nav.titles.* */
const titleKeys: Record<string, string> = {
  "/home": "nav.home",
  "/discover": "nav.titles.discover",
  "/likes": "nav.titles.likes",
  "/chat": "nav.titles.chat",
  "/couple": "nav.titles.couple",
  "/couple/map": "nav.titles.coupleMap",
  "/couple/memories": "nav.titles.coupleMemories",
  "/couple/add": "nav.titles.coupleAdd",
  "/couple/promises": "nav.titles.couplePromises",
  "/couple/us": "nav.titles.coupleUs",
  "/couple/invite": "nav.titles.coupleInvite",
  "/services": "nav.titles.services",
  "/bookings": "nav.titles.bookings",
  "/lifestyle": "nav.titles.lifestyle",
  "/lifestyle/orders": "nav.titles.lifestyleOrders",
  "/ai": "nav.titles.ai",
  "/ai/deepmind": "nav.titles.aiDeepmind",
  "/safe": "nav.titles.safe",
  "/me": "nav.titles.me",
  "/me/edit": "nav.titles.meEdit",
  "/me/deep": "nav.titles.meDeep",
  "/me/privacy": "nav.titles.mePrivacy",
  "/me/account": "nav.titles.meAccount",
  "/me/history": "nav.titles.meHistory",
  "/me/premium": "nav.titles.mePremium",
  "/onboarding": "nav.titles.onboarding",
};

export function pageTitleKey(pathname: string): string {
  if (titleKeys[pathname]) return titleKeys[pathname];
  const hit = Object.keys(titleKeys)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return hit ? titleKeys[hit] : "common.brand";
}
