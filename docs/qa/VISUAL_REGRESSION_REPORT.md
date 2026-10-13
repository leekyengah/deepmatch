# Visual Regression Report — Responsive Full Frame

| Field | Value |
|---|---|
| Date | 2026-10-13 |
| Status | **PARTIAL** — P0 code landed; screenshot matrix incomplete |

## Before / after

| Viewport | Route | Before | After (this branch) | Result |
|---|---|---|---|---|
| 375 | `/` prod | browser capture attempted (timeout) | pending preview/local | NOT RUN |
| 1440 | `/` prod | visual confirm via browser session (no file) | pending | NOT RUN |
| 768 / 1920 / 2560 | hubs | pending | pending | NOT RUN |

Planned dirs: `docs/evidence/responsive-baseline/` · `docs/evidence/responsive-after/`.

## Screen matrix (honest)

| Screen | Code frame | Overflow verified | Notes |
|---|---|---|---|
| AppShell | gutters + safe-area | code review | touch ≥44 nav |
| /home | `dm-page-frame` | NOT RUN | — |
| /discover | `dm-page-frame` + 3:4 | NOT RUN | MediaFrame class |
| /chat | `dm-page-frame` | NOT RUN | — |
| /couple | polaroid 3:4 | NOT RUN | — |
| /me | `--standard` | NOT RUN | — |
| /services | `--wide` + table scroll | INTENTIONAL | min-w 720 table |
| /lifestyle | `--wide` | NOT RUN | — |
| /ai | `dm-page-frame` | NOT RUN | — |
| `/` marketing | hero `aspect-portrait` | NOT RUN | — |
| admin | legacy pink | OUT OF SCOPE P0 | P2 |

**No global PASS.** Production not deployed from this branch.
