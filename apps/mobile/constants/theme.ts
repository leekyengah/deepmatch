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

export const LEGAL_URLS = {
  privacy: "https://datingvn.com/privacy",
  terms: "https://datingvn.com/terms",
  accountDeletion: "https://datingvn.com/account-deletion",
} as const;

export const IAP_PRODUCT_ID =
  process.env.EXPO_PUBLIC_IAP_PRODUCT_ID ?? "premium_monthly";
