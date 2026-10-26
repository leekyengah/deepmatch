# HOME / Master wave staging handoff — 2026-10-12

## Deploy

| Field | Value |
|---|---|
| URL | https://datingvn.com |
| Commit | `b2899ed` (+ follow-ups) |
| Vercel | `dpl_4cZH6vygwUbq9DpFRgLpZyGE1s1y` |
| Target | staging alias datingvn.com (not LIVE payment) |

## Wave delivered

- Persona `/home` + nav Home
- AI hub + quota badge + circuit breaker
- Privacy AI consent revoke
- Admin catalog CMS (status / product toggle)
- Couple → DEMO commerce CTAs
- Catalog ranking doc + Playwright catalog + home-state matrix
- Mobile Home tab (persona state)

## Rollback

`vercel rollback` to prior production deployment, or redeploy previous commit on `feat/ext-lifestyle-ai-commerce`.

## Blockers remaining

- EXT-040 LIVE — BLOCKED_EXTERNAL
- TestFlight — Apple Developer
- Measured Lighthouse/a11y numbers (EXT-062) — device pass pending
