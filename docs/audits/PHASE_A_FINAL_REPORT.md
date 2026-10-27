# Phase A Final Report — Architecture Contract

| Field | Value |
|---|---|
| Date | 2026-10-11 |
| Baseline commit | `f2a50c8` |
| Decision | **Architecture Contract v1 drafted** — proceed Pha B foundation harden |

## 1. Verified as-is

Modular monolith Next.js + Supabase on staging/domain; rule-based matching with reasons; mutual≠couple; pair invites; likes/messages BFF; CI + secrets guard; 21 tables / 24 RLS policies (incomplete coverage).

## 2. Gap analysis (summary)

| Area | Gap |
|---|---|
| Contracts | No OpenAPI; no `/api/v1`; inconsistent errors |
| Security tests | No live RLS deny suite |
| Async | No outbox/workers |
| Observability/DR | No Sentry/OTel; DR NOT_RUN |
| Domains | Discovery list, disconnect, pins/journals REST, reports API, billing, notifications |
| Mobile/Nest | N/A deferred/rejected |

## 3. Risk register

See `DEEPMATCH_BASELINE_AUDIT.md` §9 (R1–R5).

## 4. Recommended changes

1. OpenAPI + `/api/v1` aliases + error envelope (ARCH-04).
2. RLS policies for media/reports + deny tests (ARCH-03).
3. Couple disconnect + reports + discovery candidates APIs.
4. Outbox migration before notification scale.
5. Keep production BLOCKED until G4–G7 evidence.

## 5. Affected paths

- Docs: `docs/architecture/*`, `docs/audits/*`, `docs/plans/*`
- Code (Pha B/C): `apps/web/src/app/api/v1/**`, `openapi/`, `tests/integration/**`, `supabase/migrations/*`, selected domain routes

## 6. Ordered backlog

`docs/plans/DEEPMATCH_EXECUTION_BACKLOG.md`

## 7. Release gates

G0 process accepted in repo; G1 Architecture Contract = this pack (Founder countersign still human). G2–G7 open.

## 8. Test / evidence matrix

| Suite | Result |
|---|---|
| Unit shared | Runnable (`npm test`) — expected PASS |
| Lint/type/build | Via `npm run ci` |
| RLS integration | NOT_RUN |
| E2E | NOT_RUN |
| DR drill | NOT_RUN |

## 9. Rollback

Docs-only rollback = git revert docs commits. Code Pha B uses additive routes/flags.

## 10. Next eligible execution

**Pha B:** OpenAPI + `/api/v1` + RLS deny harness + CI evidence for DM-011–014.
