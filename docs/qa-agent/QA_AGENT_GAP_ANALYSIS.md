# QA Agent Gap Analysis — 2026-10-26

## What exists today

| Capability | Status | Gap |
|------------|--------|-----|
| Ad-hoc staging accept (`accept-staging.mjs`) | Working | No orchestrator, no outcome taxonomy, overwrites fixed evidence path |
| `qa-master-run.mjs` | Working | Not independent lifecycle; mixes seed + assert |
| Playwright e2e | Partial | Default `E2E_BASE_URL` points at datingvn.com; not gated by QA allowlist |
| CI verify | Working | No QA agent unit job; no staging E2E in CI (correct for secrets) |
| Evidence folders | Working | Inconsistent schemas; no run_id / classification |
| Sheet 52/53 | Readable via connector | No automated narrow-write; QA column mostly `NOT_RETESTED` |
| pair_pins_three_layers | Pass after reseed (13/13) | First fail A=0 B=0 = seed/pair drift; not encoded as root-cause classifier |
| RLS / IDOR | Partial | Historical probes; not catalogued under FIX26 IDs |
| Multi-project QA | Missing | No adapter interface; TradingBase apps untested by design |

## Required for Universal QA Core V1

1. Shared orchestration + safety gate independent of product code.
2. ProjectAdapter so a second app can onboard without editing core.
3. Evidence JSON/MD under `docs/evidence/qa-agent/` with redaction.
4. Status machine blocking auto-VERIFIED / GA GO.
5. Catalog mapping AUD26/FIX26 → runnable cases (P0 first).
6. CI job for **QA core unit tests only** (non-destructive).
7. Stubs for ELENAZA / Kiến Nghị Việt / VDEA / ElenaNguyen.com — config only, never executed.

## Out of scope this wave

- Paid observability vendors, LIVE PSP, production writes, full restore drill.
- Implementing other project adapters beyond stubs.
- Claiming DONE_VERIFIED on any FIX26 row.
