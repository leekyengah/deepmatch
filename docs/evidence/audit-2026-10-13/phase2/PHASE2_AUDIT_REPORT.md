# DeepMatch — Audit Phase 2 Report

**Date (UTC):** 2026-10-13  
**Branch:** `audit/prod-readiness-2026-10-13`  
**Commits:** baseline `11a4f43` → auth `8762dc0` → Phase2 `e979412`  
**Live target:** https://datingvn.com (`NEXT_PUBLIC_APP_ENV=staging`, `productionDeploy=false`)  
**Deploy:** `dpl_5zqrwge87NWU55SopZQetTFM1su7` aliased to datingvn.com  

## Release verdict

# **NO-GO** (production / GA / closed-beta store)

| Track | Verdict |
|---|---|
| Staging continue-dev | **CONDITIONAL GO** (auth gate + security probes green; residual E2E/mobile/external blockers) |
| Closed beta (web) | **NO-GO** until Maps/PSP policy + full journey green + legal identity |
| General availability | **NO-GO** |
| Web storefront (datingvn.com) | Staging only — not GA |
| iOS | **NO-GO / BLOCKED** (device NOT_TESTED + store keys) |
| Android | **NO-GO / BLOCKED** (device NOT_TESTED + store keys) |

## A. Security

### npm vulnerabilities

| Metric | Before | After Next 15.5.27 |
|---|---|---|
| Total | 35 | 33 |
| Critical | 1 | **0** |
| High | 23 | 21 |
| Moderate | 11 | 12 |

Disposition detail: `VULN_DISPOSITION.md` / `NPM_VULN_CLASSIFICATION.md`.

| Disposition | Count |
|---|---|
| FIXED | next critical cluster (same-major → 15.5.27) |
| BLOCKED_MAJOR / ACCEPTED | 29 Expo/RN/metro/sharp force paths |
| Residual OPEN | next moderate + tooling |

### Auth / IDOR / webhooks (live probes)

| Probe | Result |
|---|---|
| `/discover` unauth → 307 `/login?next=` | PASS |
| `/legal` public 200 | PASS |
| `/api/v1/me/profile` unauth 401 | PASS |
| Sandbox webhook bad sig 400 | PASS |
| Stripe webhook unconfigured/bad 503 | PASS |
| QA login + media library 200 + foreign media URL 403 | PASS |

Evidence: `security-probes.json`, `security-probes-postdeploy.console.txt`.

### Fixes shipped this phase

1. **AUD-AUTH-02** — `logoutAction` clears `sb-*` / auth cookies (`e979412`) + unit test.  
2. **AUD-DEP-01 partial** — Next.js `15.1.11` → `15.5.27` (web+admin).  
3. Prior **AUD-AUTH-01** remains live-verified (middleware private HTML gate).

## B. E2E (14 journeys + age-gate)

| Run | SHA / deploy | Result |
|---|---|---|
| Pre-deploy | pre-`e979412` | 14 passed / 2 failed (J04 flake; J14 logout cookie) |
| Post-deploy | `e979412` @ datingvn.com | **16/16 passed** (`PW_EXIT=0`) |

Journey statuses (user-visible, not HTTP-only): see `e2e/journey-results.json`.  
Hard PASS: J14-guest, J11, J14-logout, J01b-age-gate.  
PASS_PARTIAL (UI/path OK; deep mutual/upload/LIVE not forced): J01–J10, J12–J13.

## C. Mobile

12 product surfaces inventoried → **NOT_TESTED on device** (no emulator/simulator). Store signing **BLOCKED_EXTERNAL**. See `MOBILE_READINESS.md`.

## D. Commercial

| Area | Status |
|---|---|
| 7 packages / entitlements | PARTIAL |
| 6 payment screens | PARTIAL; LIVE PSP **BLOCKED** |
| Booking/orders | PARTIAL |
| Payment sandbox | probes PASS |
| Couple / DateMap | PASS_PARTIAL; Maps LIVE **BLOCKED** |
| R2 / private media | foreign URL 403 PASS |
| AI Concierge | PASS_PARTIAL |
| Admin/CS | J13/J11 evidence |
| Store keys | **BLOCKED** |

## E. P0/P1 remaining

| ID | Sev | Status |
|---|---|---|
| AUD-PAY-01 | P0 | BLOCKED_EXTERNAL |
| AUD-MAP-01 | P0 | BLOCKED_EXTERNAL |
| AUD-STORE-01 | P0 | BLOCKED_EXTERNAL |
| AUD-E2E-01 | P1 | MITIGATED — 16/16 Playwright green post-deploy; deep mutual/upload/LIVE still PARTIAL |
| AUD-MOB-01 | P1 | NOT_TESTED device |
| AUD-LEGAL-01 | P1 | BLOCKED_FOR_PRODUCTION (identity/contact) |
| AUD-DEP-01 | P2 | PARTIAL (critical cleared; Expo majors accepted) |

## F. Master sync

Updated tabs: 00, 21 (pending append), 24, 36, 48, 50, 51. Evidence register under `docs/evidence/audit-2026-10-13/phase2/`.

## G. Do-not

- No merge to main/master  
- No LIVE PSP activation  
- No real-user data mutation  
- Production GA remains **NO-GO** until independent gate sign-off  
