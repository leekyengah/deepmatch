# FIX26-010 — DEV / STAGING / PROD matrix (2026-10-26)

**Status:** DONE_PENDING_QA  
**AC:** signed env matrix; no ambiguous `--prod` alias (documented risk; Founder must acknowledge)

| Layer | DEV | STAGING | PROD |
|-------|-----|---------|------|
| Web URL | localhost:3000 | https://datingvn.com | https://deepmatch-prod.vercel.app (custom domain cutover optional) |
| Vercel project | — | `deepmatch` | `deepmatch-prod` |
| Admin URL | localhost admin | https://deepmatch-admin.vercel.app | https://deepmatch-admin-prod.vercel.app |
| Supabase ref | local/linked | `zzqpvjdyvjarpphqhaze` | `iofrimcbvqrhefqkkyrx` |
| NEXT_PUBLIC_APP_ENV | development | staging | production |
| health.productionDeploy | false | false | true (expect) |
| Billing | sandbox | HD Bank staging path (see PRODUCTION.md; do not treat as GA LIVE PSP GO) | Stripe optional / gated |
| Mobile | Expo Go LAN | API → staging | Store binary NOT READY |

## Cross-env risks (evidence)
1. `vercel deploy --prod` on linked `deepmatch` publishes to Vercel “Production” of **staging project** (datingvn.com) — operators must re-link carefully (PRODUCTION.md).  
2. Prod web brand tokens differ from staging (pink vs burgundy) — config drift.  
3. DNS cutover steps documented but **not** executed this session (no prod DNS change).

**No production deploy / DNS / LIVE PSP performed.**
