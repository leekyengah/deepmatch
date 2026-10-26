# PREMIUM DESIGN SYSTEM v3 (EXT-069 / DM-093)

Supersedes peony v1 for **active UI**. Legacy pink retained only as rollback tokens.

## Tokens

| Token | Hex | Use |
|---|---|---|
| `--dm-primary` | `#6B2D3C` | CTA, active nav, chips |
| `--dm-primary-hover` | `#54212F` | Pressed |
| `--dm-deep` | `#472025` | Closing bands, overlays |
| `--dm-canvas` | `#F7F3EE` | Page background |
| `--dm-panel` | `#FAF6F3` | Cards |
| `--dm-surface` | `#FFFCF9` | Inputs/sheets |
| `--dm-champagne` | `#A88A62` | Logo strokes, ordinals |
| `--dm-ink` | `#241A1C` | Headings |
| `--dm-muted` | `#706763` | Secondary |
| `--dm-line` | `#E8DCD4` | Hairlines |
| `--dm-blush` | `#F4E9E4` | Quiet tags |

Sources: `apps/web/src/app/globals.css`, `packages/shared/src/brand.ts`, mobile `theme.ts`.

## Typography

- Display: Playfair Display (latin / latin-ext)
- Editorial body: Lora
- UI: Be Vietnam Pro

## Components

Button / Badge / EmptyState / ErrorState / AppShell bottom nav (ADR-11 5 tabs) use wine tokens. Alias `text-dm-raspberry` maps to wine for migration safety.

## A11y

- Primary CTA white-on-wine contrast checked
- Focus visible on controls
- `prefers-reduced-motion` respected for non-essential motion
