# W4 — Commercial Completion

**Date:** 2026-10-26  
**Wave status:** `IN_PROGRESS`  
**Acceptance:** **NOT VERIFIED**  
**GA:** **NO-GO**  
**LIVE PSP:** **OFF** (hard rule)

## Inventory (code vs Master)

| Area | Code today | Status |
|------|------------|--------|
| Seven service packages | `service_offerings` + Concierge UI; accept suite count≥7 | READY_FOR_QA (data) |
| Booking / appointments | `service_bookings` API + RLS deny in accept | PARTIAL |
| Checkout / sandbox payment | Checkout routes + HD Bank transfer staging path; Stripe optional | PARTIAL — **sandbox/CK only** |
| Subscription management | Premium bank-transfer flow `/me/premium` | PARTIAL |
| Admin CRM / reports | Admin billing confirm; venues | PARTIAL |
| Cancellation / refund | Workflows thin | TODO |
| Store billing compliance | Apple IAP verify route stub; no LIVE | PARTIAL / BLOCKED_EXTERNAL for store |

## This wave actions

- Confirmed `SERVICES_PAYMENT_LIVE` must stay false in QA safety gate  
- No LIVE charge tests executed  
- Next WP: refund/cancel state machine + admin report exports (sandbox fixtures)

## Blockers

- LIVE PSP Founder GO (4B) — do not activate  
- Store IAP shared secrets — BLOCKED_EXTERNAL until ASC/Play  
