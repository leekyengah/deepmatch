# QA — Personal Member Center redesign

**Date:** 2026-10-13  
**Branch:** `feat/me-member-center-redesign`  
**Scope:** Web `/me` 4-layer Member Center + 5 management groups

## Checks

| Area | Result | Notes |
|---|---|---|
| Desktop layout (4 layers) | PASS (code) | Identity → Dashboard → Management → Next Actions |
| Tablet / mobile grid | PASS (code) | `sm`/`md`/`xl` breakpoints on stats + groups |
| Account states (live + fixture blend) | PASS (code) | `resolveHomeState` drives CTA/badges; fixtures fill visuals |
| Loading / empty / error | PARTIAL | Leaf pages unchanged; hub always has fixture stats (no blank dashboard) |
| URL aliases | PASS (config) | See `ME_ROUTE_MAPPING_2026-10-13.md` + `next.config.ts` |
| Auth gate | PASS | Unauthenticated → `/login` |
| Staff vs member | PASS | Staff aside role/email gated; hidden for members |
| APIs/DB preserved | PASS | No schema drops; entitlements/orders/profile APIs untouched |
| Lint / typecheck | PASS | `npx tsc --noEmit` in `apps/web` exit 0 (2026-10-13) |

| Rollback | Revert deploy to prior production commit; redirects only additive |

## Known residual risks

1. Dashboard connection/date counts are **presentation fixtures** until live aggregates are wired — intentional per brief mockup data.
2. `/matches` alias → `/likes` (canonical likes page).
3. Visual regression vs mockup PNG not pixel-diffed in this pass — manual browser check recommended post-deploy.

## Deploy evidence

| Item | Value |
|---|---|
| Branch | `feat/me-member-center-redesign` |
| Commit | `e72cfa7` |
| Production | https://datingvn.com |
| Deployment | `dpl_HmFqdU1a5aizPdjD9sa7z7sRNFUN` |
| Inspect | https://vercel.com/tradingbase/deepmatch/HmFqdU1a5aizPdjD9sa7z7sRNFUN |
| Gate | G-PMC-LIVE pending Founder / human QA signoff |

## Rollback plan

1. Redeploy previous Vercel production deployment, or revert `e72cfa7` on the branch that production tracks.
2. Redirects are additive — safe to leave or remove with revert.
3. No migrations in this change set — DB rollback not required.

