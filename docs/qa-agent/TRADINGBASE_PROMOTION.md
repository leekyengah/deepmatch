# Promoting QA Core into TradingBase monorepo

## Audit facts (2026-10-26)

- TradingBase root: `D:/DỰ ÁN CÔNG NGHỆ/TRADINGBASE`
- Package manager: **pnpm@9.15** + turbo; Node **24.x**
- Workspace globs: `apps/*`, `packages/*`, `packages/features/*`
- Naming convention: `@trading/*` (e.g. `@trading/core`)
- No existing QA orchestration package
- Kiến Nghị Việt already present: `apps/kiennghiviet-web`, `packages/kiennghiviet-domain`

## Target layout (future; not executed this wave)

| Pilot (DeepMatch npm) | TradingBase (pnpm) |
|-----------------------|--------------------|
| `packages/tradingbase-qa-core` → `@tradingbase/qa-core` | `packages/qa-core` → `@trading/qa-core` |
| `packages/tradingbase-qa-adapters` → `@tradingbase/qa-adapters` | `packages/qa-adapters` → `@trading/qa-adapters` |
| `packages/deepmatch-qa` → `@deepmatch/qa` | Remain in DeepMatch repo **or** `packages/qa-deepmatch` as thin consumer |

## Rules when promoting

1. Copy core/adapters only after DeepMatch pilot gates pass.
2. Do not enable ELENAZA/VDEA/ElenaNguyen/KNV execution without project-owned allowlists + Founder auth.
3. Keep DeepMatch secrets out of TradingBase CI.
4. Prefer workspace protocol `workspace:*` in pnpm.
