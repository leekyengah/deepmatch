# 03 — QA Test Results

**Commit under test:** `1b78258` (PR #3 tip)  
**Env:** dm-staging / https://datingvn.com  
**Actor:** automated Cursor + DeepMatch QA Core (not Independent QA)

## Aggregates (2026-10-26 re-run)

| Suite / harness | PASS | FAIL | SKIPPED | BLOCKED | Notes |
|-----------------|-----:|-----:|--------:|--------:|-------|
| accept-staging | 13 | 0 | 0 | 0 | Pins 3+3; chat; concierge×7; RLS denials |
| commerce-sandbox-e2e | 18 | 0 | 0 | 0 | Prior same day; cancel/refund/idempotency |
| qa --suite w2 | 7 | 0 | 10 | 0 | SKIPPED = suite filter |
| qa --suite p0 | 7 | 0 | 10 | 0 | SKIPPED = suite filter |
| qa --suite security | 1 | 0 | 16 | 0 | rls_deny PASS; filter artifact |
| @deepmatch/shared unit | 37 | 0 | 0 | 0 | age/intents/media/AI/chat |
| @deepmatch/web auth unit | 8 | 0 | 0 | 0 | email-verified paths |

**Lifecycle ceiling:** `QA_PASSED_AUTOMATED`  
**Independent VERIFIED:** **none**  
**GA stance:** **NO-GO**

## Accept cases (13)

health · discovery_candidates_rls · rls_peer_profile_mutual · rls_private_note_deny · pair_pins_three_layers · chat_messages_readable · chat_send_message · mutual_match_exists · media_signed_upload · concierge_offerings · concierge_bookings_own · concierge_booking_rls_deny · consent_self_select

## Not executed / residual

| Gap | Why |
|-----|-----|
| Full Playwright journey (verify→delete) | Thin automation; needs Independent/device |
| Destructive unmatch happy-path | Preserves live QA mutual fixture |
| Device E2E iOS/Android | No signed binary / farm |
| LEAK-01..34 full matrix | Historical/partial only |

## Evidence files

- `qa-w2.log` · `qa-p0.log` · `qa-security.log` · `accept-staging.log` (this directory)  
- `docs/evidence/qa-agent/qa-2026-10-26T12-26-42-103Z-a0bafc30.*`  
- `docs/evidence/qa-agent/qa-2026-10-26T12-27-07-368Z-0158a195.*`  
- `docs/evidence/qa-agent/qa-2026-10-26T12-27-00-100Z-f6fb7784.*`
