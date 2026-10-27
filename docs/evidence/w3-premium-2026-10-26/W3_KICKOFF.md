# W3 Premium Features — Kickoff (2026-10-26)

**Wave status:** `STARTED` (engineering entry; not VERIFIED)  
**GA:** **NO-GO**  
**Depends:** W2 partial continue in parallel; staging deploy of W2 unmatch still open

## Scope (Sheet 53 wave = W3 Premium Features)

| FIX26 | Theme | Entry stance |
|-------|-------|--------------|
| 039–043 | AI Concierge consent/safety/cost | Engineering + QA matrix |
| 044 | Sánh đôi premium fidelity | Design UAT (G-SANH-DOI) |
| 045 | Maps provider | **BLOCKED_EXTERNAL** — Founder OSM-only for GA |
| 046+ | Pins/geocode/top30 | Partial; maps keys block LIVE geocode |

## This kickoff package

1. Independent QA Core CI + W2 suite (separate commits).
2. W3 backlog freeze for execution order (security → AI consent → couple UX → maps blocked).
3. No LIVE PSP / no store submit / no DONE_VERIFIED.

## Next engineering slices (independent)

1. AI assist consent gate evidence + quota decrement staging probe (FIX26-039/040).
2. Couple `/couple` visual diff checklist vs mockup (FIX26-044) — non-blocking for Eng continue.
3. Keep Mapbox unset (FIX26-045 policy).

## Blockers

- Staging missing `POST /api/v1/matches/unmatch` (404) until W2 deploy.
- Maps billing / paid keys.
- Independent human review still required for VERIFIED.
