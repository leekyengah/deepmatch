# QA — Lifestyle Premium Marketplace

**Date:** 2026-10-13  
**Branch:** `feat/lifestyle-premium-redesign`

## Checks

| Area | Result | Notes |
|---|---|---|
| Homepage not module-grid | PASS (code) | Hero + search + groups + featured + partners + couple + AI + map |
| Commercial data source | PASS (code) | Featured/partners from `commerce_*` tables |
| Fake LIVE claims | PASS (policy) | Copy discloses curated map / EXT-040 for LIVE providers |
| Dead / disabled CTAs | PASS (code) | All CTAs are live Links/Buttons to existing routes |
| Empty / error | PASS (code) | EmptyPanel + EmptyState on listing |
| Couple privacy | PASS (arch) | Private couple map remains `/couple/map`; Lifestyle uses public curated places |
| AuthZ APIs | UNCHANGED | Catalog APIs still flag + session gated |
| Typecheck | See run log |
| Screenshots 320/768/1440 | PENDING | Capture after deploy |
| E2E full funnel | PARTIAL | Cart/book flows unchanged; visual redesign only on hub/listing/detail |

## BLOCKED / residual

1. **Provider LIVE** — EXT-040 dual approval still open.
2. **PSP LIVE** — no live charge activation in this change.
3. **Google Maps real** — Date Discovery still uses curated LOVE_PLACES + SampleMapCanvas until GMAP gate.
4. **Screenshot matrix** — run after production/staging deploy; do not self-PASS G-LIFESTYLE-LIVE.

## Rollback

Redeploy previous Vercel production deployment. No migrations in this set.
