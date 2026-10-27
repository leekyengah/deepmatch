# G6 — Public / invite launch runbook

| Field | Value |
|---|---|
| Updated | 2026-10-12 |
| Gate | G6 GO (Founder) — see `docs/evidence/FOUNDER-G5-G6-G7-2026-10-12.md` |
| Surface | Staging public: https://datingvn.com · Admin: https://deepmatch-admin.vercel.app |

## Pre-flight (each invite wave)

- [ ] `GET /api/v1/health` → ok; flags expected
- [ ] `npm run seed:qa && npm run accept:staging` → 13/13
- [ ] `npm run test:e2e` → pass
- [ ] Admin Safety queue reachable for owners
- [ ] Kill switches known: Admin `/flags` or `FF_*=false` on Vercel
- [ ] Support contact published (FAQ / CMS)

## During launch

1. Invite cohort in controlled batches (track denominator for KPI).
2. Watch: open reports, suspend rate, chat abuse, booking volume.
3. If abuse spike: turn off `ff_discovery` / `ff_chat` / `ff_concierge` as needed — do not delete data.

## Stop criteria (pull invite / pause discovery)

- P0 security / data leak
- Moderation capacity exceeded
- Cost runaway (storage / map / outbound)

## Post-wave

- Record cohort size + mutual + couple activation in evidence note
- Schedule quarterly DR soft-check (`npm run` → `node scripts/dr-soft-check.mjs`)

## Not in this G6

- Paid billing / Stripe
- Dedicated production Supabase project (recommended before charge)
- Sentry DSN (optional until Founder pastes DSN)
