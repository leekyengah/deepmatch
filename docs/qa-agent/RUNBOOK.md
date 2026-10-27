# QA Runbook — DeepMatch via Universal QA Core

## Prerequisites

- Node ≥20, repo deps installed (`npm install`)
- For staging suites: `.env.local` + `.ai/qa.env.ps1` from `npm run seed:qa`
- Never point at production write endpoints

## Commands

```bash
# Unit self-tests (safe, no network secrets required)
npm run test:qa-core
npx tsx packages/deepmatch-qa/src/cli.ts --suite unit

# P0 / W2 / W3 staging (allowlisted datingvn.com)
npm run seed:qa
npx tsx packages/deepmatch-qa/src/cli.ts --seed --suite p0 --env dm-staging
npx tsx packages/deepmatch-qa/src/cli.ts --suite w2 --env dm-staging --sheet-snapshot docs/evidence/qa-agent/sheet53-snapshot.json
npx tsx packages/deepmatch-qa/src/cli.ts --suite w3 --env dm-local

# Security / e2e (SKIPPED under --suite p0 — run explicitly)
npx tsx packages/deepmatch-qa/src/cli.ts --suite security --env dm-staging
npx tsx packages/deepmatch-qa/src/cli.ts --suite e2e --env dm-staging

# CI
# - .github/workflows/qa-core.yml (PR)
# - .github/workflows/qa-staging.yml (workflow_dispatch)
```

## Evidence

Written to `docs/evidence/qa-agent/`:
- `{runId}.json` / `{runId}.md`
- `LATEST.json`
- `EXECUTIVE_LATEST.md`
- `{runId}-sheet53-proposed.json` (no live Sheets write by default)

## Failure handling

1. Classify: `application_defect` → report to Developer (do not silent-fix product).
2. `seed_fixture` (e.g. pair_pins A=0 B=0) → re-seed, rerun; attach both fail+pass evidence.
3. `environment_blocked` / `BLOCKED_CONNECTOR` → stop; request credentials/approval.
4. Automated PASS = `QA_PASSED_AUTOMATED` only.

## Sheet 53

Review proposed JSON; human applies narrow QA fields. Do not set `DONE_VERIFIED` from automation.
