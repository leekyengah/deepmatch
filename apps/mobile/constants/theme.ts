import {
  colors as tokenColors,
  darkColors as tokenDark,
  layout as tokenLayout,
  spacing as tokenSpacing,
} from "@deepmatch/design-tokens";
import { useColorScheme } from "react-native";

/** Re-export shared DeepMatch tokens for React Native screens. */
export const colors = tokenColors;
export const darkColors = tokenDark;
export const layout = tokenLayout;
export const spacing = tokenSpacing;

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : colors;
}

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
