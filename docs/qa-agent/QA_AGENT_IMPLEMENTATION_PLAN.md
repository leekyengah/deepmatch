# Implementation Plan — Universal QA Core V1 (DeepMatch pilot)

## Commits (reviewable)

1. **docs** — Architecture, gap, plan, security, acceptance, runbook stubs  
2. **core** — `@tradingbase/qa-core` + unit tests  
3. **adapters + deepmatch** — interface, stubs, DeepMatch catalog/runners  
4. **ci + evidence** — workflow job + first real run artifacts  

## P0 catalog priority

| Case ID | Maps to | Runner |
|---------|---------|--------|
| DM-QA-P0-001 | FIX26-011 / pair_pins_three_layers | accept-staging + pin visibility probe |
| DM-QA-P0-002 | FIX26-011 pin_id auth | probe-pin-id-staging |
| DM-QA-P0-003 | FIX26 matching_rule_versions RLS | read-only policy/probe (no prod write) |
| DM-QA-P0-004 | FIX26-013 CI verify | local `npm run ci` or artifact reference |
| DM-QA-P0-005 | FIX26-003 EXT evidence | eval-ext-done-evidence (read-only) |
| DM-QA-P0-006 | G-HOME-SEC no-leak | no-leak-public against allowlisted staging |

## Success for this wave

- `npm run test -w @tradingbase/qa-core` PASS  
- `npm run qa:deepmatch -- --suite unit` PASS (core self-test via CLI)  
- Staging suite `p0` runs only if allowlist + QA creds present; else BLOCKED with evidence  
- pair_pins historical root-cause documented; live rerun attempted  
- GA recommendation remains **NO-GO**  
