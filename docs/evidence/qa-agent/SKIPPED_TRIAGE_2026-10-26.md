# SKIPPED triage — P0 run `qa-2026-10-26T09-48-01-417Z-b854601b`

**Decision context:** Founder/PMO accepted pilot at `QA_PASSED_AUTOMATED` (not `DONE_VERIFIED`). GA remains **NO-GO**.

| Case | Suite | Pri | Why SKIPPED | Release class | Action |
|------|-------|-----|-------------|---------------|--------|
| **DM-QA-A-001** RLS deny harness | `security` | P1 | Suite filter `p0` excludes non-p0 / non-P0-priority rows with suite≠p0 | **GA-blocking before GO**; **non-blocking for W2/W3 engineering continue** | Run under `--suite security` or `--suite all` on staging; track FIX26-018 |
| **DM-QA-H-001** Playwright smoke | `e2e` | P1 | Same suite filter | **Non-blocking** for GA P0 security gates; required for UX release confidence | Run under `--suite e2e` with allowlisted base; CI stays unit-only (no browser secrets) |

## Classification rules

- **Release-blocking (GA GO):** AuthZ/RLS/IDOR critical suite must be PASS on staging (includes A-001 family + LEAK matrix backlog).
- **Non-blocking (continue W2–W5):** Browser smoke H-001; visual/a11y; store binaries.
- P0 automated pass does **not** clear A-001 — it was intentionally out of suite scope.

## Follow-up

```bash
npx tsx packages/deepmatch-qa/src/cli.ts --suite security --env dm-staging
npx tsx packages/deepmatch-qa/src/cli.ts --suite e2e --env dm-staging
npx tsx packages/deepmatch-qa/src/cli.ts --suite w2 --env dm-staging
```
