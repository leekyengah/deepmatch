# DeepMatch — Baseline Architecture Audit

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Complete (read-only) |
| Date | 2026-10-11 |
| Branch | `master` @ `f2a50c8` |
| Auditor | Cursor Agent (Principal Architect role) |
| Scope | Production Architecture Master v1.0 vs local repo |

**Classification legend:** `IMPLEMENTED_VERIFIED` | `IMPLEMENTED_UNVERIFIED` | `PARTIAL` | `MISSING` | `CONFLICT` | `BLOCKED` | `NOT_APPLICABLE`

## 1. Repository & tooling

| Check | Result | Evidence |
|---|---|---|
| Git remote | IMPLEMENTED_VERIFIED | `github.com/leekyengah/deepmatch` |
| Monorepo workspaces | IMPLEMENTED_VERIFIED | `apps/*`, `packages/*` |
| Package manager | IMPLEMENTED_VERIFIED | npm workspaces, Node ≥20 |
| CI workflow | IMPLEMENTED_VERIFIED | `.github/workflows/ci.yml` (lint/type/test/build + secrets guard) |
| Secrets in git | IMPLEMENTED_VERIFIED (guard) | `.env.local` untracked; CI greps service role patterns |
| NestJS / Expo apps | NOT_APPLICABLE | Deferred/rejected per ADR |

## 2. Database & RLS

| Check | Result | Evidence |
|---|---|---|
| ERD tables | PARTIAL | 21 tables in init migration |
| RLS enabled | PARTIAL | 17/21 tables; gaps listed in security doc |
| Policies | PARTIAL | 24 policies; media/reports/admin thin |
| Mutual ≠ pair | IMPLEMENTED_VERIFIED | SQL comment + likes handler `createsPairSpace: false` |
| Invite hash | IMPLEMENTED_VERIFIED | `pair_invites.code_hash` + RPC migrations |
| Outbox | MISSING | — |
| Payments | MISSING | — |
| RLS deny suite | MISSING | `tests/integration` placeholder only |

## 3. Auth & identity

| Check | Result | Evidence |
|---|---|---|
| Supabase Auth | IMPLEMENTED_UNVERIFIED | Cloud project linked; E2E signup NOT_RUN in this audit |
| Profile on signup | IMPLEMENTED_VERIFIED | `auth_profile_trigger` migration |
| Consent events | PARTIAL | table + insert policy; no full `/me/consents` API |
| Age 18+ | IMPLEMENTED_VERIFIED (unit) | `packages/shared/src/age.ts` + tests |

## 4. API & contracts

| Check | Result | Evidence |
|---|---|---|
| BFF routes | PARTIAL | 7 routes under `/api/*` |
| OpenAPI | MISSING → targeted Pha B | — |
| `/api/v1` | MISSING → targeted Pha B | — |
| Idempotency-Key likes | PARTIAL | upsert by actor/target; header not required |
| Unified error envelope | MISSING | ad-hoc `{ error: string }` |

## 5. Matching / chat / couple

| Check | Result | Evidence |
|---|---|---|
| Hard/soft rank + reasons | IMPLEMENTED_VERIFIED | engine + explain + unit tests |
| Forbidden signals list | IMPLEMENTED_VERIFIED | `FORBIDDEN_RANK_SIGNALS` |
| Chat ACL helper | IMPLEMENTED_VERIFIED | `packages/shared/src/chat/acl.ts` |
| Realtime wiring | PARTIAL | schema ready; product E2E NOT_RUN |
| Couple invite/accept | PARTIAL | APIs + RPC; disconnect API MISSING |
| Memory map UI | PARTIAL | pages exist; full pin API MISSING |

## 6. Security & ops

| Check | Result | Evidence |
|---|---|---|
| Threat model doc | PARTIAL | DM-014 + architecture doc |
| Sentry/OTel | MISSING | — |
| DR drill | MISSING | — |
| Staging deploy | IMPLEMENTED_VERIFIED | health 200 on vercel + datingvn.com |
| Production GO | BLOCKED | G7 + `productionDeploy=false` |

## 7. Documentation set (Master §XII)

| Deliverable | Result |
|---|---|
| `docs/architecture/*` (10) | Created this pass |
| `docs/audits/DEEPMATCH_BASELINE_AUDIT.md` | This file |
| `docs/plans/DEEPMATCH_EXECUTION_BACKLOG.md` | Created this pass |
| Prior `docs/p0`–`p5` | Retained; architecture docs are SOTs going forward |

## 8. Tracker CONFLICT note

Master Tracker may mark DM-011–014 as accepting/GO while local docs say In review. **Do not flip Sheet state** from this audit alone. Evidence: migrations + CI exist; adversarial RLS/E2E still MISSING → recommend Tracker status **PARTIAL / In verification**.

## 9. Risk register (top)

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | RLS gaps on media/reports | High | Policies + deny tests |
| R2 | No OpenAPI → contract drift | Medium | OpenAPI + `/api/v1` |
| R3 | No observability | High | Sentry before G5 |
| R4 | Docs/Tracker status mismatch | Medium | Evidence-driven Sheet updates |
| R5 | Premature production claim | Critical | Keep G7 human gate |

## 10. Next eligible task

**ARCH-04 / DM-020 hardening:** ship OpenAPI v1 + `/api/v1` aliases + error helper, then **ARCH-03** RLS deny tests on staging (requires credentials). Parallel: couple disconnect + reports API (domain).
