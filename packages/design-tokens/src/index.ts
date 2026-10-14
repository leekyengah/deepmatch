/** DeepMatch design tokens — shared by Web (CSS vars) and Mobile (StyleSheet).
 *  Approved brand palette is source of truth. Mockup V2 hex deltas are aliases only.
 */

export const colors = {
  primary: "#6B2D3C",
  primaryHover: "#54212F",
  blush: "#F4E9E4",
  softBlush: "#E8DCE0",
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
  /** Mockup reference aliases (do not replace approved primary). */
  mockupBurgundy: "#641C35",
  mockupIvory: "#FAF6F0",
  mockupChampagne: "#C6A36B",
  mockupCharcoal: "#252129",
} as const;

export const darkColors = {
  primary: "#C48A98",
  primaryHover: "#D4A3AE",
  blush: "#3A2A30",
  softBlush: "#2E2428",
  canvas: "#1A1416",
  deep: "#F4E9E4",
  raspberry: "#C48A98",
  champagne: "#C6A36B",
  gold: "#D4B48A",
  ink: "#F7F3EE",
  muted: "#A89A96",
  line: "#3A3034",
  panel: "#241A1C",
  surface: "#2A2024",
  good: "#5CB87A",
  danger: "#E07084",
} as const;

export const layout = {
  gutter: 16,
  touch: 44,
  headerH: 56,
  tabBarH: 56,
  sidebar: 272,
  frameApp: 1440,
  frameWide: 1280,
  frameStandard: 1120,
  frameNarrow: 720,
  aspectPortrait: 3 / 4,
  aspectLandscape: 16 / 10,
  aspectVideo: 16 / 9,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 22,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

export const typography = {
  displayFamily: "PlayfairDisplay",
  editorialFamily: "Lora",
  bodyFamily: "BeVietnamPro",
  bodySize: 16,
  labelSize: 13,
} as const;

export type DmColor = keyof typeof colors;
export type DmLayout = keyof typeof layout;
