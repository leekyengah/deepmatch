export type NavItem = {
  href: string;
  labelKey: string;
};

export const adminNav: NavItem[] = [
  { href: "/", labelKey: "admin.overview" },
  { href: "/users", labelKey: "admin.users" },
  { href: "/moderation", labelKey: "admin.moderation" },
  { href: "/matching", labelKey: "admin.matching" },
  { href: "/safety", labelKey: "admin.safety" },
  { href: "/services", labelKey: "admin.services" },
  { href: "/commerce", labelKey: "admin.commerce" },
  { href: "/billing", labelKey: "admin.billing" },
  { href: "/catalog", labelKey: "admin.catalog" },
  { href: "/cms", labelKey: "admin.cms" },
  { href: "/analytics", labelKey: "admin.analytics" },
  { href: "/flags", labelKey: "admin.flags" },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const titleKeys: Record<string, string> = {
  "/": "admin.dashboard",
  "/users": "admin.users",
  "/moderation": "admin.moderation",
  "/matching": "admin.matchingOps",
  "/safety": "admin.safetyFull",
  "/services": "admin.servicesFull",
  "/commerce": "admin.commerceFull",
  "/billing": "admin.billingFull",
  "/catalog": "admin.catalog",
  "/cms": "admin.cmsFull",
  "/analytics": "admin.analyticsFull",
  "/flags": "admin.flagsFull",
};

export function adminPageTitleKey(pathname: string) {
  return titleKeys[pathname] ?? "admin.title";
}
