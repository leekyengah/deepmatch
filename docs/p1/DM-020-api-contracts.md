# DM-020 — API Contracts & Test Strategy

## HTTP (BFF)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | liveness + flag defaults | public |
| POST | `/api/matching/rank` | rank candidates | session (TODO wire) |
| POST | `/api/chat/access` | ACL check | session (TODO wire) |

## Planned (P2+)

- `POST /api/auth/consent`
- `POST /api/pairs/invites` / `POST /api/pairs/accept`
- `POST /api/likes` (idempotent)
- `POST /api/messages` (dedupe key)
- `POST /api/reports`
- Admin RPCs with role checks

## Test strategy

| Layer | Location | Focus |
|---|---|---|
| Unit | `packages/shared/**/*.test.ts` | age, rank, mutual≠pair, chat ACL |
| Integration | `tests/integration` | RLS against staging (requires credentials) |
| E2E | `tests/e2e` | QA16 journey (Playwright — after staging) |

Negative suites mandatory: QA01–QA14, QA16–QA17.
