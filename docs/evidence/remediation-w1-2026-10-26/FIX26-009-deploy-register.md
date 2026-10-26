# FIX26-009 — Deploy register (staging + prod health) 2026-10-26

**Status:** PARTIAL / DONE_PENDING_QA  
**AC:** deploy register current (SHA↔dpl↔time) — **partial**: Vercel list age/URL captured; git SHA↔dpl ID mapping not fully resolved (whoami worker flaky)

## Git
| Field | Value |
|-------|-------|
| Branch | `audit/prod-readiness-2026-10-13` |
| HEAD | `6ec50c72d658925994db94d4f6341eede33cf960` |
| Last commit | 2026-10-14 · feat(mobile): V2 member/admin screens… |
| Git tags | none observed for release |

## Vercel `tradingbase/deepmatch` (staging project) — `vercel ls` 2026-10-26
Latest Ready Production-labeled deploy: `https://deepmatch-hrsmxr3aw-tradingbase.vercel.app` · Age ~12d · user `khanhbang2409-7422`  
Note: Vercel **Environment=Production** on project that serves **datingvn.com staging** (`health.env=staging`) — naming collision.

## Live health (proxy for deployed app identity)
| Target | health.env | productionDeploy | Brand primary |
|--------|------------|------------------|---------------|
| datingvn.com | staging | false | `#6B2D3C` |
| deepmatch-prod.vercel.app | production | (flags present) | `#E95383` (legacy) |

## Residual to close AC
1. `vercel inspect <deployment> --json` → meta.gitCommitSha for staging + prod projects  
2. Tag releases on main after GA  
3. Founder confirm which Vercel project is canonical for datingvn.com
