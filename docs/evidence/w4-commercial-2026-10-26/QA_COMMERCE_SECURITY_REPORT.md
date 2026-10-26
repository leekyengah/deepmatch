# QA — Commerce & Security (Sandbox)

**Date:** 2026-10-26  
**Commits:** `901738e` / `008ca3f`  
**Deploy:** `dpl_C6PSEBneFBUFFuK64QsjoM99wAuJ` → `https://datingvn.com`  
**DB:** staging `zzqpvjdyvjarpphqhaze`  
**LIVE PSP:** **OFF** · **DONE_VERIFIED:** no · **GA:** NO-GO

## Automated results

### Shared unit (commerce lifecycle)

`packages/shared` suite including lifecycle — prior **37/37 PASS**.

### Staging sandbox E2E (`scripts/commerce-sandbox-e2e.mjs`)

Evidence: `SANDBOX_E2E_2026-10-26T10-53-40-201Z.json`  
**PASS=18 FAIL=0**

| Case | Result |
|------|--------|
| env.staging_project | PASS |
| env.live_psp_off | PASS |
| schema.commerce_audit_log | PASS |
| schema.staff_transition_booking (service_role → forbidden w/o staff JWT) | PASS |
| booking.create → cancel | PASS |
| booking.cancel idempotent | PASS |
| booking.illegal_refund_from_cancelled | PASS (400) |
| booking.cross_user_deny (user B) | PASS (400) |
| booking.request_refund from completed | PASS → `refund_requested` |
| order.create → cancel | PASS |
| order.request_refund from paid seed | PASS → `refund_requested` |
| auth.guest_deny | PASS (401) |
| audit.rows_readable | PASS (count≥4 after run) |

### QA Core unit

`npm run test:qa-core` — **PASS** (core + adapters + deepmatch sheet53-narrow).

### PR #3 CI (`008ca3f`)

| Check | Result |
|-------|--------|
| verify | pass |
| QA Core unit | pass |
| Vercel | pass |

## Security notes

- Cross-user booking mutation denied.  
- Guest cancel denied (401).  
- Illegal transitions rejected at API SM.  
- Staff RPCs are security definer + `has_admin_role`; bare service_role call without JWT uid → `forbidden` (expected).  
- Admin approve/deny sandbox refund requires staff session via `/commerce` (not exercised with staff JWT in this harness).  
- No LIVE PSP charge attempted or possible while `SERVICES_PAYMENT_LIVE` unset/false.

## Not claimed

- DONE_VERIFIED / human VERIFIED  
- Staff UI approve_sandbox_refund E2E  
- Production migration  
- Store IAP live  
