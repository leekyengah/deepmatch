# W2 — Core Member Completion (partial delivery)

**Date:** 2026-10-26  
**Wave status:** `IN_PROGRESS` (WP1–WP3 shipped; remainder open)  
**Acceptance:** **NOT VERIFIED** (developer tests only; no Independent QA)  
**Baseline:** W1 tip `c05e6a7` · branch `feat/w2-core-member-wp1-3`

---

## 1. Delivered this session

| WP | FIX26 / DM | Change | Tests |
|----|------------|--------|-------|
| WP1 Intent + media gate | FIX26-022, FIX26-023 | Web onboarding intents → `friendship\|dating\|marriage`; legacy map; Discover returns `emptyReason=MEDIA_GATE` when viewer &lt;3 photos | `@deepmatch/shared` intents + discover-gate unit **PASS** |
| WP2 Unmatch | FIX26-028 / DM matching | `POST /api/v1/matches/unmatch` (service role after participant check) + Likes UI | Unit N/A; API wired; staging E2E pending |
| WP3 Live `/me` | FIX26-027 / DM-272 | MemberCenter uses live avatar, bio, age, match counts, couple dates; no fixture person-as-self | web typecheck PASS |
| WP4 Home honesty | FIX26-027 / home | Live match/like/unread counts; live Discover suggests when available; fixture suggests/activity labeled **DEMO** | web typecheck |

**No production writes. No LIVE PSP. No store publish.**

---

## 2. Area rollup (updated)

| Area | Status |
|------|--------|
| Auth email/session | PARTIAL (verify UX / Phone OTP open) |
| Onboarding 3 intents | **READY_FOR_QA** (web aligned; mobile friends→friendship via needs) |
| Profile 3–10 media | PARTIAL (gate enforced on Discover GET) |
| Discover filters | PARTIAL (web OK; mobile filters still thin) |
| Unmatch | **READY_FOR_QA** (API+web UI) |
| Chat / report / block | PARTIAL (prior) |
| `/me` honesty | **READY_FOR_QA** (live aggregates) |
| Fake home suggests | PARTIAL (live when possible; else DEMO-labeled) |

---

## 3. Residuals (next packages)

**P0**
1. HomeDashboard / suggest cards — live or labeled DEMO (stop hardcode-as-real).
2. Age-gate E2E under-18 blocked.
3. Block → chat ACL journey on staging.
4. Mobile discover filters parity.
5. Email verify + resend UX.

**P1**
- field_visibility UI; sessions list honesty; deleted-account post-login state.

**BLOCKED_EXTERNAL**
- Phone OTP, Push (APNs/FCM), Store, Sentry DSN, LIVE PSP.

---

## 4. Evidence index

- Shared tests: intents + discover-gate (23 shared suite pass including new).
- Code: `packages/shared/src/onboarding/intents.ts`, `media/discover-gate.ts`
- API: `apps/web/src/app/api/v1/discovery/candidates/route.ts`, `matches/unmatch/route.ts`
- UI: onboarding, DiscoverHub MEDIA_GATE, LikesClient unmatch, MemberCenter live
- W1 closure: `docs/evidence/remediation-w1-2026-10-26/W1_IMPLEMENTATION_CLOSURE.md`

---

## 5. Verdict

| Gate | Result |
|------|--------|
| W2 complete | **NO** — partial WP1–3 only |
| Continue W3–W5 | Allowed for **independent** packages; do not claim W2 done |
| GA | **NO-GO** |
| DONE_VERIFIED | **0** |
