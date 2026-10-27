import { colors, layout } from "./index";

/** CSS custom properties string for web globals (optional sync helper). */
export function cssVariablesBlock(): string {
  const lines = [
    `--dm-primary: ${colors.primary};`,
    `--dm-primary-hover: ${colors.primaryHover};`,
    `--dm-blush: ${colors.blush};`,
    `--dm-canvas: ${colors.canvas};`,
    `--dm-deep: ${colors.deep};`,
    `--dm-raspberry: ${colors.raspberry};`,
    `--dm-champagne: ${colors.champagne};`,
    `--dm-gold: ${colors.gold};`,
    `--dm-ink: ${colors.ink};`,
    `--dm-muted: ${colors.muted};`,
    `--dm-line: ${colors.line};`,
    `--dm-panel: ${colors.panel};`,
    `--dm-surface: ${colors.surface};`,
    `--dm-good: ${colors.good};`,
    `--dm-danger: ${colors.danger};`,
    `--dm-radius-sm: ${layout.radiusSm}px;`,
    `--dm-radius-md: ${layout.radiusMd}px;`,
    `--dm-radius-lg: ${layout.radiusLg}px;`,
    `--dm-radius-xl: ${layout.radiusXl}px;`,
    `--dm-touch: ${layout.touch}px;`,
    `--dm-sidebar: ${layout.sidebar}px;`,
    `--dm-frame-app: ${layout.frameApp}px;`,
    `--dm-frame-wide: ${layout.frameWide}px;`,
    `--dm-frame-standard: ${layout.frameStandard}px;`,
    `--dm-frame-narrow: ${layout.frameNarrow}px;`,
  ];
  return lines.join("\n  ");
}
