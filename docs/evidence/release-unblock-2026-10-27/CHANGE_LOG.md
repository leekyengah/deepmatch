# Change log — Release Unblock (saved 2026-10-27)

## Code
- `tradingbase-qa-core`: suite filter → `filteredOut` (not false SKIPPED); CONDITIONAL when in-scope all PASS
- `deepmatch-qa`: env-blocked classify for accept/pin probes; load `.ai/rls-test.env.ps1`; EXECUTIVE write fallback on lock; RLS A-001 SKIPPED without JWTs
- `scripts/mint-rls-test-jwts.mjs`: mint staging JWTs → gitignored `.ai/rls-test.env.ps1`
- `scripts/critical-path-smoke.mjs`: non-destructive critical-path API smoke
- `scripts/accept-staging.mjs`: session bootstrap → BLOCKED_ENV exit 2
- `tests/e2e/smoke.spec.ts`: bilingual EN/VI + BrandLogo wordmark

## Docs / evidence
- `docs/evidence/release-unblock-2026-10-26/` · `…-2026-10-27/` (matrix, FAR packs, store, EAS, JWT guide, execution report)
- QA agent runs including `qa-2026-10-27T04-01-05-084Z-abdc759e` (security 2/2 PASS)

## Master Sheets
- 54 FOUNDER ACTION REGISTER · 55 RELEASE UNBLOCK MATRIX updated (no secrets)

## Not committed
- `.ai/rls-test.env.ps1` (JWTs) · `.env.local` · service-role keys

## Stance
GA **NO-GO** · no merge · no store submit · no LIVE PSP · no self-VERIFIED
