# 02 — W2–W5 Closure Matrix

| Wave | Implementation | Automated QA | Independent VERIFIED | Status label |
|------|----------------|--------------|----------------------|--------------|
| W1 | Closed w/ residuals | CI + RLS audit | No | IMPLEMENTATION_CLOSED_WITH_RESIDUALS |
| W2 | WP1–7 code; WP8 thin E2E | Accept 13/13; suite w2 7P | No | IMPLEMENTATION_CLOSED_WITH_RESIDUALS |
| W3 | OSM click-pin; couple media; AI revoke; Lifestyle DEMO | Unit + accept pins/media | No | IN_PROGRESS / READY_FOR_QA deltas |
| W4 | Cancel/refund SM sandbox; admin commerce; 7 offerings | Sandbox E2E **18/18** | No | IN_PROGRESS · LIVE_PSP=false |
| W5 | Mobile discover filters; unmatch; EAS profiles | No device binary | No | STARTED · RC_READY=**NO** |

## SKIPPED classification (critical)

When running `--suite w2` or `--suite security`, catalog cases from **other suites** appear as SKIPPED with reason **`suite filter`**.

| Observation | Meaning |
|-------------|---------|
| w2: 10 SKIPPED | P0/security/e2e/w3 cases not in suite `w2` — **not disabled tests** |
| security: 16 SKIPPED | Same filter artifact — only `DM-QA-A-001` in suite |
| p0: 10 SKIPPED | Non-p0 cases filtered |

**Rule:** SKIPPED ≠ PASS. Re-run each suite (`p0`, `w2`, `security`, `w3`, `accept`) separately; use accept + commerce harness for staging depth.

## Key evidence paths

- Accept: `accept-staging.log` (this pack) · prior `ACCEPT-STAGING-13-13.json`  
- Commerce: `docs/evidence/w4-commercial-2026-10-26/SANDBOX_E2E_*.json`  
- W2 closure: `docs/evidence/w2-core-member-2026-10-26/W2_IMPLEMENTATION_CLOSURE.md`  
- W5: `docs/evidence/w5-mobile-2026-10-26/W5_MOBILE_RELEASE_CANDIDATE.md`
