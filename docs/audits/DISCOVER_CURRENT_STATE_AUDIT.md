# DISCOVER_CURRENT_STATE_AUDIT — Discover V2.0 Phase 0

**Date:** 2026-10-13  
**Branch:** `feature/discover-v2`  
**Target:** https://datingvn.com/discover

## Architecture (evidence)

| Layer | Path |
|---|---|
| Page | `apps/web/src/app/(app)/discover/page.tsx` |
| Client UI | `apps/web/src/components/discover/DiscoverClient.tsx` |
| Candidates API | `apps/web/src/app/api/v1/discovery/candidates/route.ts` |
| Likes API | `apps/web/src/app/api/likes/route.ts` → `/api/v1/likes` |
| Rank engine | `packages/shared/src/matching/engine.ts` |
| Flags | `ff_discovery` ∧ `ff_matching` |
| Mobile | `apps/mobile/app/(tabs)/likes.tsx` (matches only; no native discover feed) |

## Empty-state “Chưa có hồ sơ phù hợp” — root-cause matrix

| Hypothesis | Evidence | Verdict |
|---|---|---|
| Flags off | Page shows ErrorState if either flag false | Possible (env/DB) |
| User discovery_opt_in=false | API returns FORBIDDEN `flagDiscoveryUserOff` → UI error, not empty | Distinct path |
| Pool empty in DB | Query requires `discovery_opt_in=true`, `hidden_from_discovery=false`, `suspended=false` | Possible data |
| Hard filters too tight | `passesHardFilters`: age prefs, **regions exact match**, **requiredGoals every** | **Likely** when prefs set |
| Prior like/pass excluded | All `likes` targets excluded from pool | Possible after use |
| RLS blocks read | Select on profiles with discovery_opt_in — standard authenticated | Unlikely alone |
| API error | UI shows ErrorState, not emptyTitle | Distinct |
| Rendering bug | Candidates without photos → looks “empty” | **Confirmed UX gap** |
| No avatar in API/UI | Select omits `avatar_path`; UI uses gradient only | **Confirmed** |
| Pagination bug | Single page `slice(0, pageSize)` | Low |

**Conclusion:** Empty title appears when API succeeds with `candidates=[]`. Most probable product causes: tight `match_preferences` (regions/goals), opted-out pool, or exhausted like/pass set. Separately, UI fails to show photos even when candidates exist — primary visual complaint.

## Gaps vs V2 mockup

- No 3–4 column premium grid / filter sidebar / goal tabs wired to query  
- No compatibility breakdown with confidence  
- No save-list (likes enum is only `like`|`pass`)  
- No collections panel  
- Mockup PNG assets: **not attached in task** → `MOCKUP_ASSETS_PENDING`

## Constraints

- No production DB migration without approval  
- No fake profiles / online counts / compatibility science claims  
- Reuse `rankCandidates` + likes mutual chat rules (no auto pair space)
