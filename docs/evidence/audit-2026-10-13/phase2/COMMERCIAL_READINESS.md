# Commercial readiness matrix — Phase 2 (2026-10-13)

**Env:** https://datingvn.com (staging)  
**Branch/SHA at matrix draft:** `audit/prod-readiness-2026-10-13` (local HEAD; see PHASE2 report for commit after fixes)

| Area | Expected | Evidence / status |
|---|---|---|
| 7 service packages + entitlements | Catalog + entitlement gates | PARTIAL — `/services` UI PASS_PARTIAL (J09); LIVE fulfillment BLOCKED |
| 6 payment screens | Checkout/premium/bank/sandbox/IAP/admin | PARTIAL — J10 premium/checkout; LIVE PSP **BLOCKED_EXTERNAL** |
| Booking + order mgmt | Create/list/cancel | PARTIAL — `/bookings` loads; provider LIVE BLOCKED |
| Payment sandbox | HMAC webhook + bank transfer | VERIFIED probes — bad sig 400; Stripe unconfigured 503 |
| Couple Space | Invite/join/home | PASS_PARTIAL (J07) |
| DateMap | Map + places | PASS_PARTIAL (J08); Google Maps billing **BLOCKED_EXTERNAL** |
| Cloudflare R2 | Signed upload/read | PARTIAL — media intents present; foreign media **403** (probe PASS) |
| AI Concierge | Consent + hub | PASS_PARTIAL (J06) |
| Admin + CS | Ops deny + support | J13 deny/ops; J11 support+subscriptions PASS |
| Store signing keys | iOS/Android release | **BLOCKED_EXTERNAL** |

## Explicit BLOCKED (do not mark VERIFIED)

- Maps LIVE keys / billing  
- LIVE PSP / Store billing  
- Store signing / App Privacy questionnaires  
