# DEEPMATCH SECURITY / PRIVACY REPORT — 2026-10-12

## Fixed leaks (verified local)

| ID | Issue | Fix | Result |
|---|---|---|---|
| LEAK-01 | Staging footer on `/` | Removed public staging footer | PASS |
| LEAK-01/17 | FAQ `docs/ops/...` | Sanitized `faq.a6` | PASS |
| LEAK-07 | robots/sitemap | Added `robots.ts`, `sitemap.ts` | PASS |
| LEAK-17 | `.env` / `.git` probes | 404 | PASS |

## Gate

- Script: `scripts/no-leak-public.mjs` (`npm run test:no-leak`)
- Doc: `docs/audits/HOME_SECURITY_GATE.md`
- CI wire-up remaining (EXT-066)

## Remaining

- LEAK-03 full public API matrix (EXT-038)
- LEAK-04 production bundle canary in CI
- LEAK-08 admin unauth matrix retest
- EXT-040 LIVE providers: BLOCKED_EXTERNAL_AUTHORIZATION
