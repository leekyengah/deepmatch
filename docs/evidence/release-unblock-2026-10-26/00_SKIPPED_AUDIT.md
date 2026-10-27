# SKIPPED Audit — Release Unblock Sprint

**Baseline:** `6449e06`  
**Root cause of “10 W2 SKIPPED” / “16 security SKIPPED”:** orchestrator emitted `SKIPPED` for **suite filter** (cases outside selected suite). These were **not** disabled product tests.

## Fix

- Suite filter now **excludes** cases from the report (`filteredOut` count).  
- `SKIPPED` reserved for intentional in-suite skips (missing env/capability).  
- Expanded suite matchers: `security` / `e2e` / `p0` (all P0 priority) / `w2` / `w3`.  
- `DM-QA-A-001` returns **SKIPPED** when `RLS_TEST_USER_*_JWT` absent (was false PASS on gate-only).

## Re-run results (dm-staging)

| Suite | PASS | FAIL | SKIPPED | BLOCKED | filteredOut | Verdict |
|-------|-----:|-----:|--------:|--------:|------------:|---------|
| w2 | 7 | 0 | 0 | 0 | 10 | PASS |
| p0 | 13 | 0 | 0 | 0 | 4 | PASS |
| security | 1 | 0 | 1 | 0 | 15 | PARTIAL (A-001 SKIPPED — JWTs) |
| all (first) | 15 | 2 | 0 | 0 | 0 | FAIL — accept env flake + Playwright locale |
| accept-staging (retry) | 13 | 0 | 0 | 0 | — | PASS |
| Playwright smoke (fixed) | 5 | 0 | 0 | 0 | — | PASS |

## Case-level notes

| ID | Outcome | Cause / fix |
|----|---------|-------------|
| Prior “10 SKIPPED” on w2 | N/A | Filter artifact — fixed |
| Prior “16 SKIPPED” on security | N/A | Filter artifact — fixed |
| DM-QA-A-001 | SKIPPED | Need FAR-11 JWTs |
| DM-QA-H-001 | was FAIL → PASS | Locale EN vs VI + BrandLogo empty alt — smoke asserts bilingual |
| DM-QA-P0-007 | was FAIL → PASS on retry | AuthRetryableFetch / connect timeout — classified BLOCKED when fetch fails |

**Independent VERIFIED:** none  
**GA:** NO-GO  
