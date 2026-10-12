# RLS Deny Live Evidence — 2026-10-11

| Item | Result |
|---|---|
| Seed script | `npm run seed:rls` → 2 users + unshared private note |
| Command | `npm run test:integration` with staging JWTs |
| `user B cannot read user A private notes` | **PASS** |
| `user B cannot read audit_logs` | **PASS** |
| Suites | 3 tests, 0 fail |

Secrets (JWTs) stored only in gitignored `.ai/rls-test.env.ps1` — not committed.
