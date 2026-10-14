# PUBLIC SURFACE DATA LEAK AUDIT — 2026-10-12

## Findings fixed this wave

| ID | Finding | Fix |
|---|---|---|
| LEAK-01 | Staging footer on `/` | Removed `marketing.footerStaging` from public page |
| LEAK-01/17 | FAQ linked `docs/ops/DOMAIN_DATINGVN.md` | FAQ uses i18n public copy only |
| LEAK-07 | Missing robots/sitemap control | Added `robots.ts` + `sitemap.ts` (staging disallow-all when flagged) |

## Scripts

- `scripts/no-leak-public.mjs` — guest HTML + sensitive path probes
- `tests/e2e/no-leak-public.spec.ts` — Playwright JOURNEY 12

## Remaining

| ID | Status |
|---|---|
| LEAK-02 hydration deep dump | Partial — homepage is server marketing only |
| LEAK-03 public API matrix | Partial — continue with ACL pack EXT-038 |
| LEAK-04 bundle scan | Script canaries; full CI artifact scan pending |
| LEAK-08 admin surface | Existing separate admin app — retest unauth |
| LEAK-09 couple memories | Relies on RLS — covered by prior RLS tests |
| LEAK-18 CI gate wiring | Doc + script ready; wire into CI workflow next |
