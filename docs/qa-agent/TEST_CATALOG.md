# DeepMatch Test Catalog (Adapter V1.0)

Source of truth file: `packages/deepmatch-qa/catalog/catalog.json`

| ID | Suite | Pri | Runner | FIX/AUD |
|----|-------|-----|--------|---------|
| DM-QA-P0-001 | p0 | P0 | accept_pair_pins | FIX26-011 / AUD26-011 |
| DM-QA-P0-002 | p0 | P0 | probe_pin_id | FIX26-011 |
| DM-QA-P0-003 | p0 | P0 | probe_pin_visibility | FIX26-011 |
| DM-QA-P0-004 | p0 | P0 | no_leak_public | FIX26-018 |
| DM-QA-P0-005 | p0 | P0 | ext_evidence_eval | FIX26-003 |
| DM-QA-P0-006 | unit | P0 | qa_core_unit | QA-GATE-7 |
| DM-QA-P0-007 | staging-accept | P0 | accept_staging | FIX26-011 |
| DM-QA-A-001 | security | P1 | rls_deny | FIX26-018 |
| DM-QA-H-001 | e2e | P1 | playwright_smoke | coverage-H |

## Coverage map (A–L) — status

| Area | Status V1 |
|------|-----------|
| A Auth/RBAC/RLS/IDOR | Partial — rls_deny + no-leak; full LEAK matrix backlog |
| B Onboarding/media | Catalog stub — use existing e2e/qa-master-run |
| C Discover/match/block | Partial — accept discovery checks |
| D Chat/privacy | Partial — accept chat checks |
| E Couple memories / pin_id / three-layer | **P0 wired** |
| F AI Concierge consent | Partial — accept consent_self_select |
| G Services/booking/sandbox | Partial — accept concierge offerings |
| H Responsive/a11y/visual | Backlog — visual-smoke.mjs exists |
| I Mobile Expo | Backlog — readiness only |
| J Admin | Backlog |
| K Backup/restore / observability | Evidence docs only; drill BLOCKED |
| L Legal/store/release gates | Evidence completeness via EXT eval |

PASS requires behavior assertions, not mere screen render.
