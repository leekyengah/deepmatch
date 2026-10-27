# TradingBase Universal QA Core — Architecture

**Version:** 1.0 (DeepMatch pilot)  
**Stance:** DeepMatch GA remains **NO-GO** until release gates are independently met.  
**Date:** 2026-10-26

## 1. Verified repository topology

| Repo | Path | Workspace | Package scope |
|------|------|-----------|---------------|
| TradingBase | `D:/DỰ ÁN CÔNG NGHỆ/TRADINGBASE` | pnpm (`apps/*`, `packages/*`, `packages/features/*`), turbo, Node 24 | `@trading/*` |
| DeepMatch (pilot) | this repo | npm workspaces (`apps/*`, `packages/*`), Node ≥20 | `@deepmatch/*` |

TradingBase has **no** existing `qa-core` package. DeepMatch already owns Playwright, accept/seed scripts, RLS harnesses, and `docs/evidence/`.

**Pilot hosting decision:** Universal QA packages live in DeepMatch for V1 so staging evidence is reproducible without cross-repo publish. Names use `@tradingbase/*` (portable). Promotion into TradingBase as `@trading/qa-core` is documented in `TRADINGBASE_PROMOTION.md` — not executed in this wave.

## 2. Layering

```
┌─────────────────────────────────────────────────────────┐
│  packages/tradingbase-qa-core  (@tradingbase/qa-core)   │
│  orchestration · safety · evidence · status · reports   │
└──────────────────────────▲──────────────────────────────┘
                           │ ProjectAdapter interface
┌──────────────────────────┴──────────────────────────────┐
│  packages/tradingbase-qa-adapters (@tradingbase/qa-adapters)
│  interface + registry + non-executable project stubs    │
└──────────────────────────▲──────────────────────────────┘
                           │ DeepMatchAdapter V1
┌──────────────────────────┴──────────────────────────────┐
│  packages/deepmatch-qa  (@deepmatch/qa)                 │
│  catalog · env allowlist · fixture hooks · runners      │
│  (wraps scripts/accept-staging, Playwright, unit, probes)│
└─────────────────────────────────────────────────────────┘
```

## 3. Reusable DeepMatch infrastructure (do not duplicate)

| Asset | Path | Role |
|-------|------|------|
| Playwright | `playwright.config.ts`, `tests/e2e/*` | Browser E2E |
| Unit | `packages/*/src/*.test.ts` via `tsx --test` | Package unit |
| RLS deny | `tests/integration/rls-deny.test.ts` | AuthZ negatives |
| Accept suite | `scripts/accept-staging.mjs` | Staging JWT/RLS accept |
| Seed | `scripts/seed-qa-pair.mjs`, `seed-qa-matrix.mjs` | Synthetic QA |
| Master run | `scripts/qa-master-run.mjs` | Broader staging API matrix |
| Probes | `scripts/probe-pin-*.mjs`, `no-leak-public.mjs` | Targeted P0 |
| CI | `.github/workflows/ci.yml` | lint/typecheck/unit/build + no-leak |
| Evidence | `docs/evidence/**` | Historical runs |

## 4. Outcomes vs approval states

**Case outcomes:** `NOT_RUN` | `PASS` | `FAIL` | `BLOCKED` | `SKIPPED` | `INCONCLUSIVE`

**Lifecycle (enforced transitions):**  
`IMPLEMENTED` → `READY_FOR_QA` → `QA_PASSED_AUTOMATED` | `QA_FAILED` → (human) `INDEPENDENT_REVIEW_APPROVED` → (Founder) `FOUNDER_UAT_APPROVED` → (release board) `RELEASE_APPROVED`

Automated runs may set at most `QA_PASSED_AUTOMATED` / `QA_FAILED`. AI must **not** self-sign independent review, Founder UAT, or release approval.

## 5. Safety model (summary)

- Active targets must match project allowlist (DeepMatch: staging hosts only).
- Production URLs / write flags → hard `BLOCKED` before any runner.
- No LIVE PSP; no secret exfiltration into artifacts (redaction).
- Per-project credential isolation: env prefix + evidence path namespace.

## 6. Master tracker

Google Sheets is **one** tracker adapter (Sheet 52/53). Disabled unless credentials + explicit `--write-sheet`. Narrow QA-owned columns only (`QA độc lập`, evidence notes). Never overwrite audit verdict, owner, AC, or human signoff.

## 7. Apps under DeepMatch pilot

Verified in this repo: `apps/web`, `apps/admin`, `apps/mobile`; packages `shared`, `i18n`, `legal-content`, `design-tokens`.
