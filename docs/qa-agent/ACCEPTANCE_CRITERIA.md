# Acceptance Criteria — Universal QA Core V1 (DeepMatch pilot)

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | No unauthorized production write | Safety unit tests + policy forbidProductionWrites |
| 2 | Existing suites intact | Playwright/accept/seed paths wrapped, not replaced |
| 3 | Synthetic fixture cleanup path documented | seed via seed-qa-pair; cleanup optional backlog |
| 4 | Auth/RLS/IDOR negatives reproducible | DM-QA-A-001 + historical probes |
| 5 | Couple memories happy path + deny | accept suite + pin visibility matrix |
| 6 | pair_pins_three_layers root-cause + rerun | Historical A=0 B=0 = seed; classifier in accept_pair_pins; live rerun in evidence |
| 7 | QA agent unit/integration tests pass | `npm run test:qa-core` |
| 8 | CI includes QA packages in test/typecheck | package.json + ci.yml via `npm run ci` |
| 9 | Evidence reproducible | `docs/evidence/qa-agent/{runId}.*` |
| 10 | No auto VERIFIED / GA GO | status-machine tests; gaStance always NO-GO |

## Architecture AC

- DeepMatch runs through shared `@tradingbase/qa-core`
- Second adapter can register without editing core (stubs prove interface)
- Per-project credential/evidence isolation
- Onboarding docs: RUNBOOK + TRADINGBASE_PROMOTION
- Sheets optional; proposed updates only by default
