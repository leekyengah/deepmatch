# DeepMatch — Audit Phase 2 Executive Report

**Date (UTC):** 2026-10-13  
**Branch:** `audit/prod-readiness-2026-10-13`  
**Baseline:** `11a4f43` → fixes `8762dc0` / `e979412` + Phase-2 follow-ups  
**Live target:** https://datingvn.com (`NEXT_PUBLIC_APP_ENV=staging`)  
**Master:** https://docs.google.com/spreadsheets/d/1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8/edit  

## Release verdict

# **NO-GO** (production / GA / store LIVE)

| Gate target | Verdict |
|---|---|
| Staging closed QA | **CONDITIONAL GO** — API + Playwright shell journeys green; Next 15.5.27 lockfile not yet live (deploy blocked) |
| Closed beta | **NO-GO** — store tracks + LIVE PSP + Maps keys BLOCKED |
| General availability | **NO-GO** |
| Web | **CONDITIONAL** staging / **NO-GO** GA |
| iOS | **NO-GO** (device E2E NOT_TESTED + store BLOCKED) |
| Android | **NO-GO** (device E2E NOT_TESTED + store BLOCKED) |

## A. Security remediation

### npm vulnerabilities

| Metric | Before (omit=dev) | After Next pin |
|---|---|---|
| Total | 35 | 33 |
| Critical | 1 (`next`) | **0** |
| High | 23 | 21 |
| Moderate | 11 | 12 |

**Disposition**

| Disposition | Count | Action |
|---|---|---|
| FIXED | 1 package cluster (`next` critical/high advisories incl. middleware bypass + RCE) | Pinned `next@15.5.27` in web/admin + lockfile |
| ACCEPTED / BLOCKED_MAJOR | 31 | Expo/RN/metro/sharp — no `--force` (would install Expo 44 / RN 0.72) |
| FIXABLE_SAFE residual | 2 | `metro-transform-worker`, `@expo/prebuild-config` — toolchain; optional later |

Evidence: `NPM_VULN_CLASSIFICATION.md`, `VULN_DISPOSITION.md`, `npm-audit-after-next.json`.

**Deploy note:** Vercel production deploy of Next 15.5.27 **FAILED** (`Module not found: @deepmatch/shared|i18n` when building app-only). Live datingvn.com still needs a monorepo-aware deploy before critical Next advisories are mitigated in production runtime. Lockfile fix is VERIFIED locally (`typecheck`+unit PASS).

### Auth / IDOR / webhook probes (live)

| Probe | Result | Evidence |
|---|---|---|
| Private HTML → `/login?next=` | **PASS** (13 routes HTTP 307) | `live-private-routes.json` |
| Playwright private gate + refresh + history | **PASS** 14/14 | `e2e/playwright-phase2-final.log` |
| Unauth `/api/v1/me/profile` | **PASS** 401 | `security-probes.json` |
| Foreign media URL | **PASS** 403 | `security-probes.json` |
| Sandbox webhook bad sig | **PASS** 400 | `security-probes.json` |
| Stripe webhook unconfigured | **PASS** 503 (fail-closed) | `security-probes.json` |
| Checkout IDOR (C→A) | **PASS** | `QA-STAGING-2026-10-13T1651.json` |
| Chat without mutual | **PASS** deny | same |
| Couple pin outsider deny | **PASS** | same |
| RLS/API matrix | **23/23 PASS** | same |

**Code hardening this wave:** logout cookie clear + `Cache-Control: private, no-store` on gated HTML (middleware).

## B. 14 E2E journeys (Playwright)

Run ID: `playwright-phase2-final` · SHA at run: local branch head · Env: datingvn.com · **30/30 PASS** (16 journey tests + 14 private-route tests).

| Journey | Status | Notes |
|---|---|---|
| J01 Registration UI + age gate | PASS / PASS_PARTIAL | Split consents + under-18 UI block; OTP email NOT_TESTED |
| J02 Onboarding / profile | PASS_PARTIAL | Me/edit reachable |
| J03 Media library | PASS_PARTIAL | Page gate; multi-upload fixture NOT_TESTED |
| J04 Discover + likes | PASS_PARTIAL | Screens + copy; mutual not forced in UI |
| J05 Chat shell | PASS_PARTIAL | Shell; deep block/report via API matrix |
| J06 AI Concierge | PASS_PARTIAL | Hub loads |
| J07 Couple Space | PASS_PARTIAL | Home loads |
| J08 DateMap | PASS_PARTIAL | Places UI; Google LIVE BLOCKED |
| J09 Services / bookings | PASS_PARTIAL | UI; LIVE provider BLOCKED |
| J10 Checkout sandbox | PASS_PARTIAL | Premium OK; LIVE PSP BLOCKED |
| J11 Support + subscription policy | **PASS** | |
| J12 Privacy + deletion UI | PASS_PARTIAL | Destructive delete not executed |
| J13 Admin deny (non-staff) | PASS_PARTIAL | Ops deny/partial |
| J14 Guest gate + logout session | **PASS** | |

Evidence: `e2e/journey-results.json`, `e2e/playwright-phase2-final.log`, screenshots `j05-chat.png`, `j06-ai.png`.

**Master QA01–QA14 (tab 05):** Covered via API matrix + Playwright shells; full OTP/social/store paths remain NOT_RUN/BLOCKED as before.

## C. Mobile readiness

See `MOBILE_READINESS.md`.

- 12 product screens inventoried; Expo Router auth gate present.  
- Android / iOS device runs: **NOT_TESTED / BLOCKED** (no emulator/simulator in session).  
- Store signing / TestFlight / Play closed: **BLOCKED_EXTERNAL**.

## D. Commercial readiness

See `COMMERCIAL_READINESS.md`.

| Area | Status |
|---|---|
| 7 packages / entitlements | PARTIAL (sandbox entitlement PASS via API) |
| 6 payment screens | PARTIAL |
| Booking / orders | PARTIAL |
| Payment sandbox | VERIFIED probes (HMAC/replay) |
| Couple + DateMap | PASS_PARTIAL UI; Maps LIVE BLOCKED |
| Cloudflare R2 | PARTIAL (foreign deny PASS) |
| AI Concierge | PASS_PARTIAL |
| Admin / CS | PASS_PARTIAL |
| Maps / LIVE PSP / Store keys | **BLOCKED_EXTERNAL** |

## E. Fixes verified

| Finding | Fix | Regression | Live reverify |
|---|---|---|---|
| AUD-AUTH-01 private HTML | middleware session gate (`8762dc0`) | public-paths + Playwright | **PASS** on datingvn.com |
| AUD-AUTH-02 logout jar | clear auth cookies (`e979412`+) | J14 logout Playwright | **PASS** |
| AUD-DEP-01 next critical | pin 15.5.27 | typecheck/unit | **LOCAL PASS / LIVE DEPLOY FAIL** |
| Cache gated HTML | `Cache-Control: private, no-store` | unit + pending deploy | PENDING_DEPLOY |

## F. Capability status (43) — evidence policy

Do **not** auto-promote IMPLEMENTED→VERIFIED without live/E2E evidence.

| Bucket | Count (Phase-2 assessment) |
|---|---|
| VERIFIED (live+API/E2E this wave) | ~6–8 (health, legal, auth gate, selected security journeys, sandbox webhook probes) |
| IMPLEMENTED / PASS_PARTIAL | majority of product surface |
| PARTIAL | mobile parity, R2 full path, admin depth, visual fidelity |
| BLOCKED | Store LIVE, Maps LIVE keys, LIVE PSP |

Full static inventory remains in `../product-capability-inventory.json`; Master tab 48 holds snapshot rows — detailed CAP rows stay inventory-backed.

## G. P0/P1 remaining

| ID | Sev | Status |
|---|---|---|
| AUD-PAY-01 LIVE PSP / Store billing | P0 | BLOCKED_EXTERNAL |
| AUD-MAP-01 Google Maps billing/keys | P0 | BLOCKED_EXTERNAL |
| AUD-DEP-02 Next 15.5.27 not live | P0 | Deploy blocked (workspace packages) |
| AUD-LEGAL-01 Legal Master contact/identity | P1 | BLOCKED_FOR_PRODUCTION |
| AUD-MOB-01 Device E2E iOS/Android | P1 | NOT_TESTED |
| AUD-E2E-02 Deep OTP/upload/mutual UI | P1 | PARTIAL |

## GO/NO-GO summary

- **Staging (read/write QA synthetic):** CONDITIONAL GO for continued QA (not GA).  
- **Closed beta:** NO-GO.  
- **Production GA:** **NO-GO** until mandatory gates independently signed (deploy Next patch, Maps, LIVE PSP policy, store, legal, device matrix).  
