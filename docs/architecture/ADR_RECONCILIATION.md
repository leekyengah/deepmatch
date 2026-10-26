# DeepMatch — ADR Reconciliation

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Owner | Architecture |
| Updated | 2026-10-11 |

Master ADR-001…012 mapped to repo ADR-01…09 / G0. **No silent overwrite of Accepted decisions.**

| Master | Decision | Repo counterpart | Status |
|---|---|---|---|
| ADR-001 Modular Monolith | Next BFF + shared packages | ADR-02 stack | ALIGNED — Accepted |
| ADR-002 TypeScript-first | monorepo TS | ADR-02 | ALIGNED — Accepted |
| ADR-003 Supabase PG + RLS | migrations + policies | ADR-02 + DM-013/014 | ALIGNED — Accepted |
| ADR-004 Couple ≠ Mutual | `mutual_matches` ⟂ `pairs` | ADR / QA11 + code | ALIGNED — verified in likes API |
| ADR-005 Privacy journals | `private_notes` default private | ADR-03 breakup + RLS | ALIGNED / PARTIAL tests |
| ADR-006 Rule-based matching | `packages/shared/matching` | ADR-05 open weights | ALIGNED intent; weights Open |
| ADR-007 Realtime + durable DB | Supabase Realtime + messages | ADR-06 chat | PARTIAL — transport policy Blocking historically; code path exists |
| ADR-008 Transactional outbox | outbox table + workers | — | MISSING / CONFLICT with target |
| ADR-009 Signed media | Storage private + short TTL | ADR-08 | PARTIAL |
| ADR-010 Human release gates | G0–G7 docs | `G0-SIGNOFF.md` | ALIGNED process; G1–G7 evidence incomplete |
| ADR-011 Admin case-scoped | admin_roles + audit | ADR-07 | PARTIAL |
| ADR-012 Feature-flagged launch | `feature_flags` | flags module | ALIGNED |

## Platform / Nest / Expo

| Proposal | Decision |
|---|---|
| NestJS backend | **Rejected for v1** — keep Next BFF (ADR-02 Accepted) |
| Expo mobile | **Deferred** — ADR-01 Accepted Web/PWA first |

## Conflicts to resolve (Founder)

1. Tracker “GO” vs docs “In review” for DM-011–014 — treat as **CONFLICT** until evidence pack linked.
2. Chat retention / admin evidence break-glass (ADR-06/07) still need formal policy text even if engineering proceeds on staging.
3. Outbox introduction requires new ADR note under repo numbering (propose ADR-10 Outbox) before prod claim.
