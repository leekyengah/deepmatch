# FIX26-001 — Monorepo topology + live health (2026-10-26)

**Status:** DONE_PENDING_QA (not DONE_VERIFIED)  
**HEAD:** `6ec50c72d658925994db94d4f6341eede33cf960` · branch `audit/prod-readiness-2026-10-13`  
**AC:** topology table with domains/projects + health probes

## Workspaces (package.json)

| Path | Package | Role |
|------|---------|------|
| `apps/web` | `@deepmatch/web` | Member web + API routes |
| `apps/admin` | `@deepmatch/admin` | Staff admin |
| `apps/mobile` | `@deepmatch/mobile` | Expo SDK 58 |
| `packages/shared` | `@deepmatch/shared` | Matching/AI/chat/media shared |
| `packages/design-tokens` | `@deepmatch/design-tokens` | Brand tokens |
| `packages/i18n` | `@deepmatch/i18n` | i18n |
| `packages/legal-content` | `@deepmatch/legal-content` | Legal copy |

No separate `services/` workspace.

## Environments (from docs/ops/PRODUCTION.md + probes)

| Env | Web domain / project | Admin | Supabase project ref (public) | health.env |
|-----|----------------------|-------|-------------------------------|------------|
| Staging | https://datingvn.com · Vercel `deepmatch` | https://deepmatch-admin.vercel.app | `zzqpvjdyvjarpphqhaze` | `staging`, `productionDeploy:false` |
| Production | https://deepmatch-prod.vercel.app · `deepmatch-prod` | https://deepmatch-admin-prod.vercel.app | `iofrimcbvqrhefqkkyrx` | `production` |
| Mobile | Expo Go LAN / EAS profiles | — | uses web API base | local/dev |

## Health probes 2026-10-26 (read-only GET)

| URL | HTTP | Result |
|-----|------|--------|
| `https://datingvn.com/api/health` | 200 | `ok:true`, `env:staging`, burgundy tokens, flags matching/chat/media/discovery/premium/billing/lifestyle/ai true, `productionDeploy:false` |
| `https://www.datingvn.com/api/health` | 200 | same staging payload |
| `https://deepmatch-prod.vercel.app/api/health` | 200 | `ok:true`, `env:production`, **legacy pink brand** (`#E95383`) — brand drift vs staging |
| `https://deepmatch-admin.vercel.app/api/health` | 200 | HTML app shell (no JSON health) |

## Notes / residual risk
- Vercel CLI `vercel ls deepmatch` shows Environment column **Production** for staging project `deepmatch` (alias naming collision — see FIX26-010).
- Topology table ready for Founder/CTO sign; **QA độc lập chưa ký**.
