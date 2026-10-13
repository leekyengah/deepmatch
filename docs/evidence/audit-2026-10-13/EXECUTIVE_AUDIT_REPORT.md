# DeepMatch — Master Production Readiness Audit (Executive)

**Audit branch:** `audit/prod-readiness-2026-10-13`  
**Baseline branch:** `feature/web-mobile-sync` @ `9a90624`  
**Date (UTC):** 2026-10-13  
**Live target audited:** https://datingvn.com (`NEXT_PUBLIC_APP_ENV=staging`, `productionDeploy=false`)  
**Master:** https://docs.google.com/spreadsheets/d/1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8/edit  

## Release verdict

# **NO-GO**

Mandatory gates incomplete: store/LIVE PSP/Map keys blocked; full E2E/journey matrix not fully executed this run; historical G6 not re-verified for new GA; P1 auth-shell gap found and patched on audit branch (not yet proven on live until deploy).

## Stack baseline

| Layer | Technology |
|---|---|
| Web | Next.js 15.1 / React 19 / Vercel `deepmatch` |
| Admin | Next.js 15 / Vercel `deepmatch-admin` |
| Mobile | Expo ~57 / RN 0.86 / EAS |
| Backend | Next Route Handlers + Supabase Auth/DB/RLS |
| Storage | Supabase storage + R2 media intents (partial) |
| Payments | Bank transfer staging; Apple IAP partial; Stripe webhook present; sandbox checkout |
| CI | npm workspaces scripts (`ci`, Playwright, RLS tests) |

## Static inventory (evidence, not E2E VERIFIED)

| Metric | Count |
|---|---|
| Web pages | 59 |
| API routes | 68 |
| Mobile screen files | 12 |
| Migrations | 36 |
| Capabilities scored | 43 |
| IMPLEMENTED (static) | 20 |
| VERIFIED (static+live smoke) | 2 |
| PARTIAL | 20 |
| BLOCKED | 1 (store LIVE) |

Source: `product-capability-inventory.json`.

## Commands executed

| Check | Exit | Evidence |
|---|---|---|
| `npm run typecheck` | 0 | `typecheck.log` |
| `npm run test:unit` | 0 | `unit.log` |
| `npm audit --omit=dev` | 1 (35 vulns reported) | `npm-audit.log` |
| Live `/api/v1/health` | ok staging | `live-health.json` |
| Live public pages `/ /legal /login /signup /support /faq` | 200 | shell log |
| Live `/api/v1/me/profile` unauth | 401 | shell log |
| Live `/discover` unauth (pre-fix) | **200 — P1** | shell log |
| `public-paths` unit tests | 0 | local tsx |
| `i18n:parity` | 0 | 1823 keys |
| Playwright full journeys | **NOT_TESTED** (time/env) | — |
| Mobile device E2E | **NOT_TESTED** | — |
| `test:no-leak` | **INCONCLUSIVE/hang risk** | `no-leak.log` if present |
| Integration RLS live | **NOT_TESTED** this run | needs seeded env |

## Findings (this run)

| ID | Sev | Finding | Action |
|---|---|---|---|
| AUD-AUTH-01 | **P1** | `(app)` routes (e.g. `/discover`) rendered without session; middleware only refreshed cookies | **FIXED on audit branch:** middleware redirects unauthenticated users; `isPublicPath` + tests |
| AUD-UX-01 | P2 | AppShell search/notifications hardcoded VI | **FIXED:** i18n keys `nav.search*` / `nav.notificationsAria` |
| AUD-DEP-01 | P2 | npm audit 35 vulns (many Expo transitive) | Track; no major upgrade without validation |
| AUD-PAY-01 | P0/P1 (existing) | LIVE PSP / Store billing keys | BLOCKED external |
| AUD-MAP-01 | P0/P1 (existing Master) | Google Maps billing + restricted keys | BLOCKED external |
| AUD-E2E-01 | P1 | Full 14 journeys not re-run in this audit | Schedule QA matrix execution |
| AUD-LEGAL-01 | P1 | Legal Master identity/contact still incomplete for prod publication | BLOCKED_FOR_PRODUCTION (prior legal report) |

## Remediation changelog

1. `apps/web/src/lib/auth/public-paths.ts` (+ test)  
2. `apps/web/src/lib/supabase/middleware.ts` — auth redirect for private HTML routes  
3. `AppShell` + i18n nav strings  

## Gates (this audit)

| Gate | Result |
|---|---|
| G1 Source & Build Integrity | **PASS** (typecheck + unit) |
| G2 Core Business Journeys | **NOT_TESTED / FAIL incomplete** |
| G3 Security & Privacy | **CONDITIONAL** — API 401 OK; page auth gap patched locally; RLS not re-run |
| G4 Payment & Financial Integrity | **BLOCKED** |
| G5 UX & Accessibility | **PARTIAL** — inventory only; no full visual regression |
| G6 Performance & Reliability | **NOT_TESTED** |
| G7 Mobile App Readiness | **PARTIAL / BLOCKED store** |
| G8 Operational Readiness | **PARTIAL** |

## Completeness note

Do **not** treat static IMPLEMENTED counts as product completeness for commercial GA. Evidence-backed VERIFIED ratio this run is low relative to surface area.

## Remaining decisions for Founder/Release

1. Deploy auth middleware fix to staging and re-verify `/discover` → login redirect.  
2. Fund/configure Maps + payment keys or formally defer features.  
3. Authorize full Playwright + mobile QA matrix with test accounts.  
4. Legal Master contact/identity before treating legal pack as production-final.  
