# W4 — Commercial Completion

**Date:** 2026-10-26  
**Wave status:** `IN_PROGRESS` → code landed (sandbox)  
**Acceptance:** **NOT VERIFIED** (automated unit only; no DONE_VERIFIED)  
**GA:** **NO-GO**  
**LIVE PSP:** **OFF** (hard rule)

## Delivered this tranche

| Area | Artifact | Status |
|------|----------|--------|
| Cancel/refund state machine | `packages/shared/src/commerce/lifecycle.ts` + unit tests | IMPLEMENTED |
| Idempotency / authz / transition validation | Booking + order PATCH use SM; optimistic status match | IMPLEMENTED |
| Audit log | `commerce_audit_log` + outbox events; staff RPCs | MIGRATION READY (staging/prod apply pending Founder) |
| Admin UI | `/commerce` refund queue, sandbox revenue, SKU split, audit | IMPLEMENTED |
| Sandbox revenue / reconciliation | Admin commerce counters from `checkout_orders` | IMPLEMENTED (sandbox) |
| 7 Premium Services + product split | `COMMERCE_SKU_CLASSES` (CMP-01..04 + MAT-01..03 + digital premium) | IMPLEMENTED |
| Digital vs IRL Store split | `iap_required` / `iap_forbidden` / `hybrid_review` | IMPLEMENTED (policy map) |
| Checkout order cancel + `request_refund` | `apps/web/.../checkout/orders/[id]/route.ts` | IMPLEMENTED |
| Booking cancel + `request_refund` | `apps/web/.../services/bookings/route.ts` | IMPLEMENTED |
| Unit tests | `@deepmatch/shared` commerce lifecycle — **37/37 pass** suite incl. new cases | QA_PASSED_AUTOMATED |

## Six checkout screens (inventory)

| Screen | Route / surface | Notes |
|--------|-----------------|-------|
| Confirm | `/checkout/confirm` | Package confirm |
| Method | `/checkout/method` | Card/QR/wallet picker |
| QR / pay | `/checkout/qr` | Sandbox bank/QR |
| Processing | `/checkout/processing` | In-flight |
| Success | CheckoutClient success branch | Sandbox succeed |
| Orders / premium | `/me/orders`, `/me/premium` | History + premium bank path |

## Not done / blocked

| Item | Blocker |
|------|---------|
| Apply migration `20261026180000_commerce_refund_states.sql` on staging | Founder/ops `db push` approval |
| Sandbox E2E cancel→refund→approve | Needs migration + staging deploy |
| Security negatives (cross-user refund) | API suite after deploy |
| LIVE refund / PSP | **FORBIDDEN** until Founder GO |
| Store IAP shared secrets | BLOCKED_EXTERNAL ASC/Play |

## Rules honored

- No LIVE charge / refund  
- No production project writes  
- No DONE_VERIFIED self-claim  
