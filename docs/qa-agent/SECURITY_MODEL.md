# Security Model — TradingBase Universal QA Core

## Hard rules

1. **No production writes** — `kind: production` or production write flags → `SafetyViolation` / `BLOCKED`.
2. **Allowlisted hosts only** — DeepMatch: `datingvn.com`, `localhost`, `127.0.0.1`.
3. **No LIVE PSP** — `SERVICES_PAYMENT_LIVE=true` blocks runs.
4. **Credential isolation** — per-project env + evidence namespace; never share QA JWTs across adapters.
5. **Redaction** — JWTs, service role, live keys stripped from evidence.
6. **Tracker writes off by default** — Sheets updates are proposed JSON only unless `QA_SHEETS_WRITE=1` + `writeEnabled` (still requires connector; otherwise `BLOCKED_CONNECTOR`).
7. **No auto VERIFIED / GA GO** — status machine rejects automated transitions into independent review, Founder UAT, or release approval.
8. **Future projects** — ELENAZA / Kiến Nghị Việt / VDEA / ElenaNguyen manifests `allowExecution: false`.

## Artifact policy

Safe in git: summaries, pass/fail, FIX/AUD IDs, redacted logs.  
Not in git/CI artifacts: raw session tokens, private media, full customer PII, unredacted traces.
