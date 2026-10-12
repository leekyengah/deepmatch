# VISUAL IMPLEMENTATION REPORT — 2026-10-13

## Approvals received

- A2 full 9 frames · B1 5-tab nav · C1 Playfair/Lora/Be Vietnam Pro · D2 refs in chat
- **G-VISUAL-FIDELITY FOUNDER GO — 2026-10-13** (see `FOUNDER-G-VISUAL-FIDELITY-2026-10-13.md`)

## References

- REF-WEB / REF-DATING / REF-COUPLE in `docs/design/references/`
- Sheet 26 PREMIUM VISUAL MASTER
- Manifest: `docs/design/VISUAL_REFERENCE_MANIFEST.md`

## Staging deploy (latest visual wave)

| Field | Value |
|---|---|
| Alias | https://datingvn.com |
| Commit | `962d56a` (+ follow-up Sánh đôi label fix) |
| Deploy | `dpl_EMYJQVSE6pgyYYHZjbkVbTN274Ev` |
| no-leak | PASS (`npm run test:no-leak -- https://datingvn.com`) |

## Implemented (staging)

| Deliverable | Status |
|---|---|
| Tokens v3 wine/ivory/champagne | Done |
| Logo interlocking loops + HTML wordmark | Done |
| Fonts Playfair + Lora + Be Vietnam Pro | Done |
| Marketing homepage WEB-01..06 | Done (`/`) |
| Onboarding values (DATING-01) | Done |
| Discover feed + detail (DATING-02/03) | Done (`ff_matching` ON via service-role flags) |
| Chat wine bubbles + safety menu (DATING-04) | Done (`/chat`) |
| Couple map Map/List + memories hero (COUPLE-01/02) | Done |
| Companion services DEMO (COUPLE-03) | Done (`/services`) |
| Privacy settings (COUPLE-04) | Done (`/me/privacy`) |
| Lifestyle/AI DEMO labels (EXT-076) | Done |
| ADR-11 mobile 5 tabs | Done |
| Canonical VI label **Sánh đôi** (not “Chúng mình”) | Done |
| EXT-079 manifest + EXT-067 AS-IS audit | Done |
| EXT-068 brand content spec | Done (`docs/design/PREMIUM_BRAND_CONTENT_SPEC.md`) |

## EXT-084 screenshot pack (evidence only — not sign-off)

Captured 2026-10-13 → `docs/evidence/visual-2026-10-13/`

| Frame | File | Notes |
|---|---|---|
| WEB desktop | `WEB-01-hero-desktop.png`, `WEB-01-full-1440.png` | Guest `/` |
| WEB mobile 390 | `WEB-01-mobile-390.png` | Guest `/` |
| DATING-01 | `DATING-01-onboarding.png` | QA couple session |
| DATING-02 | `DATING-02-discover.png` | Shows kill-switch empty (ff off) |
| DATING-04 | `DATING-04-chat.png` | Empty inbox (no mutual yet); route `/chat` |
| COUPLE-01 | `COUPLE-01-map.png` | Map/List toggle present |
| COUPLE-02 | `COUPLE-02-memories.png` | Empty state (no pins yet) |
| COUPLE-03 | `COUPLE-03-companion.png` | DEMO badge |
| COUPLE-04 | `COUPLE-04-privacy.png` | Settings cards |
| Lifestyle/AI | `EXT-076-lifestyle.png`, `EXT-076-ai.png` | DEMO labels |

## Pending human visual sign-off

- **G-VISUAL-FIDELITY** — Founder side-by-side 9/9 vs refs (no self-PASS)
- Overlay/diff review of `docs/evidence/visual-2026-10-13/` against REF-* PNGs
- Lighthouse field metrics (Deployment Protection may block)
- Licensed custom photography replacing Unsplash (optional)

## Blockers

- EXT-040 LIVE still BLOCKED_EXTERNAL
- Do not self-PASS G-VISUAL-FIDELITY

## Deviations (logged)

- Hero/journey photos: Unsplash stand-ins (registered), not cropped reference people.
- REF copy “chúng mình” → product **Sánh đôi** (canonical).
- Nav: 5-tab B1 (not 4-tab dating sheet).
- Discover feed empty when matching feature flag / kill switch is off on staging.
- REF file dimensions compressed vs sheet expected (see manifest).
