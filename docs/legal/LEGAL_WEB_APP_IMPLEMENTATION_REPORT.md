# DEEPMATCH — Legal Web/App Implementation Report (policy pack v1.1)

**Date:** 2026-10-12  
**Source used:** User-provided Vietnamese policy pack v1.1 (chat paste).  
**Not used as public copy:** Legal Master Google Doc (inaccessible — auth/403).  
**Authoritative UI locale for policy body:** `vi-VN` only. English UI chrome may link to VI pages; no EN policy body published as approved.

## Status

| Gate | Status |
|---|---|
| IMPLEMENTED | YES — Legal Center, content package, consent split, mobile hub, links |
| VERIFIED | YES for package integrity + web typecheck + i18n parity; live URL checks after staging deploy |
| DEPLOYED_TO_STAGING | YES after `vercel deploy --prod` to `deepmatch` / datingvn.com (staging topology) |
| BLOCKED_FOR_PRODUCTION | **YES** — see gaps below |
| DEPLOYED_TO_PRODUCTION | NO (blocked) |

`datingvn.com` is staging topology (`NEXT_PUBLIC_APP_ENV=staging`). Do not treat this as counsel-cleared production publication until Legal Master fields and functional gaps are closed.

---

## 1. What was implemented

### Web
- Shared content: `@deepmatch/legal-content` (v1.1 VI text, structured docs).
- Legal Center: `/legal` + `/legal/{terms,privacy,community,child-safety,couple-data,subscriptions,ai,services,delete-account}`.
- Support: `/support` (policy text + real in-product paths; contact only if `NEXT_PUBLIC_SUPPORT_CONTACT` set).
- Redirects: `/terms` → `/legal/terms`, `/privacy` → `/legal/privacy`.
- Footer, signup (split consents), premium, couple home, AI clients, account deletion, sitemap/robots updated.
- Version display: **Phiên bản 1.1 · Ngày cập nhật nội dung: 12/10/2026** — explicitly **not** labeled as effective/launch date.

### App (Expo)
- Me → **Pháp lý & Quyền riêng tư** hub opening web policy URLs, privacy settings, support, subscriptions, delete.
- Signup: separate age / terms accept / privacy acknowledgment switches (not pre-checked, not bundled with ads/location/AI).

### Consent
- Signup ledger keys: `age_eligible`, `terms_accept`, `privacy_notice_ack` @ `v1.1` (replaces bundled `tos_privacy` for **new** signups).
- Existing users are **not** backfilled as having accepted v1.1.
- DeepMind: removed hard-coded `consent: true`; requires unchecked-by-default checkbox like Assist.

---

## 2. Files / commit

Primary paths:
- `packages/legal-content/**`
- `apps/web/src/app/legal/**`, `apps/web/src/app/support/page.tsx`
- `apps/web/src/components/legal/**`
- `apps/web/next.config.ts`, signup, AI clients, footer, account-deletion, couple, premium, me/account
- `apps/mobile/constants/theme.ts`, `app/(tabs)/me.tsx`, `app/(auth)/signup.tsx`
- `packages/i18n/locales/*/auth|marketing|ai|commerce|profile|couple.json`
- `docs/legal/LEGAL_WEB_APP_IMPLEMENTATION_REPORT.md`

Commits:
- `2d3c40c` feat(legal): ship user policy pack v1.1 Legal Center on web and app
- `3ceb3ae` fix(web): align react and react-dom to 19.3.0 for Vercel build

---

## 3. URLs to verify

| URL | Expect |
|---|---|
| https://datingvn.com/legal | Hub, TOC, version 1.1 |
| https://datingvn.com/legal/terms | Part I |
| https://datingvn.com/legal/privacy | Part II |
| https://datingvn.com/support | Part VIII support |
| https://datingvn.com/terms | 308 → `/legal/terms` |
| https://datingvn.com/privacy | 308 → `/legal/privacy` |
| https://datingvn.com/account-deletion | Interactive delete (auth) |
| https://datingvn.com/signup | Two separate legal checkboxes |

---

## 4. Tests run

| Check | Result |
|---|---|
| `npm run test -w @deepmatch/legal-content` | PASS (5/5) |
| `npm run typecheck -w @deepmatch/legal-content` | PASS |
| `npm run typecheck -w @deepmatch/web` | PASS |
| `npm run i18n:parity` | PASS (1064 keys × 2 locales) |
| Live unauthenticated GET legal URLs | PASS 200 on `/legal*` + `/support` (datingvn.com); v1.1 present; no placeholder/HUMAN_REVIEW/Legal Master in HTML |
| Placeholder / internal label scan in pack | PASS (integrity test) |

Do not mark PASS for checks not executed.

---

## 5. Gaps / blockers (Legal Master + product match)

### Publication blockers (BLOCKED_FOR_PRODUCTION)
1. **Operator legal identity & public contact** — v1.1 requires disclosure before signup; not present in source pack text; `NEXT_PUBLIC_SUPPORT_CONTACT` unset; Legal Master Doc unread (`1_wz1bSLbzcKDq25gFeARHyJMvwG2WM5u8idSQRpq0n8`).
2. **Vendor/SDK inventory, processing locations, retention schedules** — policy requires concrete lists before apply; not invented.
3. **Counsel / founder sign-off** that staging copy may replace prior short `/terms`/`/privacy` as public policy.
4. **Google Doc Legal Master** not readable in this environment (Drive MCP auth timeout; Docs export 403).

### Functional mismatches (issues — do not paper over in copy)
| Claim / rule | Product reality | Issue |
|---|---|---|
| Dual consent for AI on shared couple content; revoke stops new sends | Partial: per-user AI consent / revoke on `/me/privacy`; no complete dual-party shared-scope ledger UI for couple AI | `LEGAL-GAP-AI-DUAL` |
| Cookie/SDK category manager with optional tools gated | Essential session cookies only in practice; no full CMP UI | `LEGAL-GAP-COOKIE-CMP` |
| Support channel outside account always published | `/support` explains in-app paths; public contact blocked until configured | `LEGAL-GAP-SUPPORT-CONTACT` |
| 24/7 intake staffing | Process claim in policy; no ops evidence wired in product | Confirm via Legal Master / ops — do not assert in UI chrome |
| Partner therapy/concierge pre-booking disclosures | Lifestyle/DEMO flows exist; full partner identity/fee disclosure varies by offering | `LEGAL-GAP-PARTNER-DISCLOSURE` |
| Personalized ads consent | No ads personalization toggle shipped | OK if feature off; must not enable ads SDK without consent UI |

### Confirmed matches (examples)
- Age 18+ gate at signup.
- Separate terms accept vs privacy acknowledgment (web + mobile).
- Account deletion path web `/account-deletion` + API delete + mobile delete.
- Subscription delete note: account delete ≠ store cancel.
- AI Assist requires consent checkbox; DeepMind fixed to match.

---

## 6. What we did **not** do
- Invent legal entity name, address, phone, email, licenses, prices, retention days.
- Publish EN policy as approved translation.
- Label pages “official / approved / effective as of 12/10/2026”.
- Put Legal Master, survey answers, or release gates in public UI.
- Submit App Store / Data Safety declarations.
- Auto-lock or re-consent-force all existing users solely due to UI update.

---

## 7. Next actions for unblock
1. Export Legal Master + confirm operator identity + support contact → set `NEXT_PUBLIC_SUPPORT_CONTACT` (and related notice fields).
2. Publish vendor/SDK/retention annex or inject from verified config only.
3. Close `LEGAL-GAP-AI-DUAL` before marketing couple AI on shared memories.
4. Founder/counsel sign-off → then promote to production project / DNS cutover per `docs/ops/PRODUCTION.md`.
