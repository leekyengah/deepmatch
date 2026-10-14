# DeepMatch — Phase 3 Executive Report

**Date (UTC):** 2026-10-13  
**Branch:** `audit/prod-readiness-2026-10-13`  
**Fix commit:** `a5d5366`  
**Baseline:** `4fa55a5` (Phase 2)  
**Master:** https://docs.google.com/spreadsheets/d/1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8/edit  

## 1. AUD-043 root cause

Vercel executed `@deepmatch/web`'s bare `next build` without a monorepo-root `npm install` that links npm workspaces. `@deepmatch/shared` and `@deepmatch/i18n` were therefore unresolved. Not a tsconfig-alias failure.

Evidence: `AUD043_ROOT_CAUSE.md`, Phase 2 `vercel-deploy-web.log`.

## 2. Files changed + commits

**Commit `a5d5366` — fix(build): restore Vercel monorepo workspace resolution (AUD-043)**

- `package.json` — `vercel-build*`, `check:workspaces`, CI gate  
- `scripts/vercel-build-web.mjs`, `vercel-build-admin.mjs`, `check-workspace-resolution.mjs`  
- `apps/web/vercel.json` — `cd ../.. && npm install` + `vercel-build:web`  
- `apps/admin/vercel.json`, root/`vercel.*.json` aligned  
- workspace `exports["./package.json"]` for tooling  
- Vercel project settings: Framework=Next.js, Build=`npm run vercel-build:web`, Output=`apps/web/.next`

## 3. Local build results

| Check | Result |
|---|---|
| `check:workspaces` | PASS |
| `typecheck` | PASS |
| `lint` | PASS (web/admin deferred echo) |
| `test:unit` + web auth tests | PASS |
| `i18n:parity` | PASS (1823 keys) |
| `vercel-build:web` / `next build` | **Compiled successfully** (Next 15.5.27, middleware traced) |

## 4–5. Vercel Preview deployment

| Field | Value |
|---|---|
| Deployment ID | `dpl_7HcytJFy3FavrLo7VDv5sZYe4dhd` |
| URL | https://deepmatch-8soug4uz1-tradingbase.vercel.app |
| Target | **preview** (not production) |
| ReadyState | READY |
| Commit | `a5d5366` |
| Next.js | **15.5.27** (build log) |
| Build command used | `npm run vercel-build:web` |
| Workspace resolve on Vercel | PASS (`resolved post-build: @deepmatch/shared|i18n|legal-content`) |
| Runtime probes (`vercel curl`) | **7/7 PASS** — health 200; `/discover|/chat|/me` → 307 `/login?next=` |
| Production alias | **unchanged** (datingvn.com not promoted) |

Inspector: https://vercel.com/tradingbase/deepmatch/7HcytJFy3FavrLo7VDv5sZYe4dhd  

## 6. Vulnerabilities (omit=dev)

| | Count |
|---|---|
| Total | **33** |
| Critical | **0** |
| High | 21 |
| Moderate | 12 |
| FIXED (this program) | `next` critical cluster (Phase 2 → 15.5.27) now **live on Preview** |
| BLOCKED_MAJOR / ACCEPTED | 31 (Expo/RN/metro/sharp force paths) |
| FIXABLE_SAFE residual | 2 (toolchain) |

Plan: `EXPO_RN_MIGRATION_PLAN.md`. No `--force`.

## 7. 14 E2E journeys

| Surface | Result |
|---|---|
| Staging datingvn.com Playwright | **30/30 PASS** (`phase3/e2e-staging.log`) |
| Journey matrix J01–J14 | PASS / PASS_PARTIAL (depth unchanged; no auto-VERIFIED inflation) |
| Preview full Playwright | **NOT_TESTED** — Deployment Protection (Vercel auth); use `vercel curl` probes instead |
| Security probes (staging) | **6/6 PASS** (auth redirect, unauth 401, webhook fail-closed, foreign media 403) |

## 8. Mobile readiness

See `MOBILE_READINESS.md` — device/store **BLOCKED / NOT_TESTED**. No store submit.

## 9. External dependencies

| Dependency | Status |
|---|---|
| Maps LIVE keys / billing | BLOCKED_EXTERNAL |
| LIVE PSP / Store billing | BLOCKED_EXTERNAL |
| Store signing | BLOCKED_EXTERNAL |
| Legal Master contact identity | BLOCKED_FOR_PRODUCTION (prior) |

## 10. Master sync summary

Updated Phase 3 rows on tabs 00, 21–25, 36–37, 48–51 for AUD-043 FIXED on Preview; GA remains NO-GO. (See `MASTER_SYNC_PHASE3.md`.)

## 11. Release gates

| Gate | Verdict |
|---|---|
| AUD-043 build recovery | **GO** (Preview READY + probes) |
| Staging closed QA | **CONDITIONAL GO** |
| Closed beta (store) | **NO-GO** |
| Web GA | **NO-GO** |
| iOS / Android | **NO-GO** |
| Production deploy / alias | **NOT DONE** (explicit) |

**Overall:** Keep **NO-GO** for Web GA / iOS / Android until mandatory gates (Maps, LIVE PSP policy, store, legal, device matrix) pass independently. Preview proves Next 15.5.27 + workspace resolution; do not claim production LIVE until a deliberate, separately authorized promote.
