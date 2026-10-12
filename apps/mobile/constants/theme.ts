export const colors = {
  primary: "#6B2D3C",
  primaryHover: "#54212F",
  blush: "#F4E9E4",
  canvas: "#F7F3EE",
  deep: "#472025",
  raspberry: "#6B2D3C",
  champagne: "#A88A62",
  gold: "#96734B",
  ink: "#241A1C",
  muted: "#706763",
  line: "#E8DCD4",
  panel: "#FAF6F3",
  surface: "#FFFCF9",
  good: "#2F7D4A",
  danger: "#A63E52",
} as const;

const LEGAL_BASE = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://datingvn.com"
).replace(/\/$/, "");

export const LEGAL_URLS = {
  hub: `${LEGAL_BASE}/legal`,
  privacy: `${LEGAL_BASE}/legal/privacy`,
  terms: `${LEGAL_BASE}/legal/terms`,
  community: `${LEGAL_BASE}/legal/community`,
  childSafety: `${LEGAL_BASE}/legal/child-safety`,
  coupleData: `${LEGAL_BASE}/legal/couple-data`,
  subscriptions: `${LEGAL_BASE}/legal/subscriptions`,
  ai: `${LEGAL_BASE}/legal/ai`,
  services: `${LEGAL_BASE}/legal/services`,
  deleteAccountPolicy: `${LEGAL_BASE}/legal/delete-account`,
  accountDeletion: `${LEGAL_BASE}/account-deletion`,
  support: `${LEGAL_BASE}/support`,
  privacySettings: `${LEGAL_BASE}/me/privacy`,
  premium: `${LEGAL_BASE}/me/premium`,
} as const;

export const IAP_PRODUCT_ID =
  process.env.EXPO_PUBLIC_IAP_PRODUCT_ID ?? "premium_monthly";
