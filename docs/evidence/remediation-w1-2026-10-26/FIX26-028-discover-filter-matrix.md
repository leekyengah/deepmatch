# FIX26-028 — Discover UI↔API filter matrix (bonus unblocked W2) 2026-10-26

**Status:** DONE_PENDING_QA  
**Code:** `apps/web/src/app/api/v1/discovery/candidates/route.ts` · `packages/shared/src/matching/engine.ts`

| UI / query param | API behavior | Engine hard/soft |
|------------------|--------------|------------------|
| `min_age` / `max_age` | Overrides prefs when numeric | Hard age gate always |
| `region` | Single-region filter list | Hard unless `softMode` (strict=0) |
| `intent` | Maps via `INTENT_GOALS` → intentBoost / requiredGoals when strict | Soft boost + optional hard goals |
| `strict=1` | softMode false; applies prefs regions + intent goals | Hard region+goals |
| `q` | Client-side name/region/interest contains | Post-rank filter |
| `page_size` | Cap 50 | Pagination only |
| blocks / opt-out | Excluded in candidate query | Hard (DB) |
| paid boost | — | **NOT_STARTED** |

**AC residual:** UI control inventory screenshot + each control hits param — needs QA device pass.
