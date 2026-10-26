# PREMIUM FUNNEL + UX UAT (EXT-077 / DM-101)

Date: 2026-10-13 · Staging: https://datingvn.com  
Auto-accepted under Founder Master execution authority 13/10/2026.

## Event dictionary

See `docs/architecture/ANALYTICS_EVENT_TAXONOMY.md` + `apps/web/src/lib/analytics.ts`.

Funnel (allowlisted only):

`home_view` → `cta_click` → `signup_start` → `login_ok` → `onboarding_complete` → `discover_view` → `discover_like`/`discover_pass` → `chat_open` → `couple_invite_create` / `couple_map_view` → `ai_hub_open` / `lifestyle_browse` → `cart_checkout_demo`

## Privacy rules

- No chat text, journals, email, phone, precise GPS, AI prompts in props
- Sink off unless `ANALYTICS_SINK` configured
- Props key/value regex-enforced server-side

## UAT matrix (staging)

| Journey | Result | Evidence |
|---|---|---|
| Guest marketing `/` | PASS | visual-2026-10-13/WEB-* |
| Onboarding values | PASS | DATING-01 |
| Discover + detail | PASS | DATING-02/03 (ff_matching ON) |
| Chat shell | PASS | DATING-04 |
| Couple map/memories | PASS | COUPLE-01/02 |
| Companion DEMO | PASS | COUPLE-03 |
| Privacy | PASS | COUPLE-04 |
| Lifestyle/AI DEMO labels | PASS | EXT-076-* |
| no-leak public | PASS | `npm run test:no-leak` 2026-10-13 |

## Baselines

Targets not invented. Measure after ≥1 week staging traffic with sink ON before setting KPI goals.
