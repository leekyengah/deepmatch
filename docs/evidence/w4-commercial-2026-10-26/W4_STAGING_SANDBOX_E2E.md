# W4 — Staging Sandbox Commerce E2E

**Date:** 2026-10-26  
**Commits:** `901738e` → `008ca3f`  
**Deploy SHA/alias:** `dpl_C6PSEBneFBUFFuK64QsjoM99wAuJ` → **https://datingvn.com**  
**GA:** **NO-GO** · **DONE_VERIFIED:** no · **LIVE PSP:** OFF  
**Prod Supabase `iofrimcbvqrhefqkkyrx`:** **untouched**

## A. Environment verification

| Check | Result |
|-------|--------|
| Linked CLI project | `zzqpvjdyvjarpphqhaze` (`deepmatch`) |
| App env | `NEXT_PUBLIC_APP_ENV=staging` |
| Staging URL | `https://zzqpvjdyvjarpphqhaze.supabase.co` |
| Prod project | `deepmatch-prod` — not linked, not pushed |
| Vercel staging alias | datingvn.com via `tradingbase/deepmatch` |

## B. Migration safety → APPLIED

| Item | Notes |
|------|-------|
| SQL review | Additive enum; `commerce_audit_log`; RLS; staff RPCs |
| Data impact | No destructive DML |
| PG hazard fixed | Split into 3 migrations (enum commit before use) |
| Backup | Staging daily physical backups; PITR=false |
| Rollback | `MIGRATION_ROLLBACK.sql` |

Applied:

1. `20261026180000_commerce_refund_states.sql`  
2. `20261026180050_commerce_audit_and_booking_rls.sql`  
3. `20261026180100_commerce_refund_rpcs.sql`  

Verified enum: `requested|assigned|completed|cancelled|refund_requested|refunded_sandbox`.

## C. E2E results — **PASS 18 / FAIL 0**

Harness: `scripts/commerce-sandbox-e2e.mjs`  
Evidence: `SANDBOX_E2E_2026-10-26T10-53-40-201Z.json`

Flows covered:

- Booking → cancel → idempotent cancel  
- Illegal refund from cancelled → 400  
- Cross-user deny → 400  
- Completed → request_refund → `refund_requested`  
- Order create → cancel; paid seed → request_refund  
- Guest 401; LIVE flag OFF; audit rows written  

Staff approve/deny via Admin `/commerce` still needs staff JWT UI check (Founder #14).

## D. LIVE PSP

**No charges.** `SERVICES_PAYMENT_LIVE` not true; assertSandboxOnly on order PATCH.
