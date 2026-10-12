export const colors = {
  primary: "#E95383",
  blush: "#F6C1D2",
  canvas: "#FFF8FA",
  deep: "#822D4C",
  raspberry: "#822D4C",
  ink: "#2A1A22",
  muted: "#7A6570",
  line: "#F0D8E0",
  panel: "#FFFFFF",
  surface: "#FFF0F4",
  good: "#2F7D4A",
  danger: "#C23B4A",
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
