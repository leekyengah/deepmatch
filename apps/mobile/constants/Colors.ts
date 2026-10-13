import { colors } from "./theme";

/** Align Expo template Colors with DeepMatch wine tokens. */
export default {
  light: {
    text: colors.ink,
    background: colors.canvas,
    tint: colors.primary,
    tabIconDefault: colors.muted,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.surface,
    background: colors.deep,
    tint: colors.champagne,
    tabIconDefault: colors.muted,
    tabIconSelected: colors.champagne,
  },
};
