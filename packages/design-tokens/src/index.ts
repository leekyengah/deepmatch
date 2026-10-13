/** DeepMatch design tokens — shared by Web (CSS vars) and Mobile (StyleSheet). */

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
