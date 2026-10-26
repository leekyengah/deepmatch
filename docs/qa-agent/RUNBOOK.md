# QA Runbook — DeepMatch via Universal QA Core

## Prerequisites

- Node ≥20, repo deps installed (`npm install`)
- For staging suites: `.env.local` + `.ai/qa.env.ps1` from `npm run seed:qa`
- Never point at production write endpoints

## Commands

```bash
# Unit self-tests (safe, no network secrets required)
npm run test:qa-core
npm run qa:deepmatch -- --suite unit

# P0 staging (allowlisted datingvn.com)
npm run seed:qa
npm run qa:deepmatch -- --seed --suite p0 --env dm-staging

# Full catalog filter
npm run qa:deepmatch -- --suite all --env dm-staging

# List projects (future stubs are non-executable)
npm run qa:deepmatch -- --list-projects
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
