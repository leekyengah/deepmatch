# DM-017 — Design Tokens

| Field | Value |
|---|---|
| Updated | 2026-10-12 |
| Code | `apps/web` + `apps/admin` CSS variables + Tailwind `dm.*` |

## Color

| Token | CSS | Value | Usage |
|---|---|---|---|
| primary / Peony Pink | `--dm-primary` | `#E95383` | CTA, logo accent, pins |
| blush / Petal Pink | `--dm-blush` | `#F6C1D2` | Soft accents, secondary bg |
| canvas / Soft White | `--dm-canvas` | `#FFF8FA` | App background |
| deep / Raspberry | `--dm-deep` | `#822D4C` | Headings (legacy alias) |
| raspberry | `--dm-raspberry` | `#822D4C` | Headings, emphasis |
| ink | `--dm-ink` | `#382735` | Body text |
| muted | `--dm-muted` | `#927A8A` | Secondary text |
| line | `--dm-line` | `#F0DFE7` | Borders |
| panel | `--dm-panel` | `#FFFFFF` | Cards / surfaces |
| surface | `--dm-surface` | `#FFF2F6` | Soft fill, theirs bubble |
| good | `--dm-good` | `#18806B` | Success |
| danger | `--dm-danger` | `#A63E52` | Destructive |

## Typography

- Display / emotional titles: **Fraunces** (`--font-display`)
- UI / forms / Vietnamese body: **Be Vietnam Pro** (`--font-body`)
- Do not ship Inter from the HTML prototype.

## Radius / shadow / spacing

| Token | Value |
|---|---|
| `--dm-radius-sm` | 9px |
| `--dm-radius-md` | 12px |
| `--dm-radius-lg` | 20px |
| `--dm-radius-xl` | 26px |
| `--dm-shadow` | `0 14px 46px rgba(91,38,62,.07)` |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32 / 40 (Tailwind defaults) |

## Contrast notes

- Body: ink `#382735` on canvas `#FFF8FA`.
- Primary buttons: white on `#E95383`.
- Headings: raspberry on canvas/panel.
- Focus ring: primary at ~2px offset for keyboard users.

## Components (Wave 1)

`apps/web/src/components/ui/` and mirrored admin primitives:

Button, Input, Textarea, Card, Badge, Avatar, EmptyState, ErrorState, LoadingState, Modal, Toast.
