# DeepMatch — Observability & Disaster Recovery

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Owner | DevOps / SRE |
| Updated | 2026-10-11 |

## Targets (Master §VIII)

| Capability | Target | Status |
|---|---|---|
| Availability SLO | 99.9% post-stabilize | NOT_MEASURED |
| API p95 | <300ms simple | NOT_MEASURED |
| Discovery p95 | <800ms | NOT_MEASURED |
| Message delivery | at-least-once + client dedupe | PARTIAL (dedupe key) |
| RPO | ≤15 min (PITR) | UNVERIFIED (Supabase plan check) |
| RTO | ≤4 h after DR drill | NOT_RUN |
| Logs | structured + PII redaction | MISSING |
| Alerts | errors, latency, auth abuse | MISSING |
| Sentry + OpenTelemetry | required | PARTIAL — Sentry optional init (`apps/web/src/lib/sentry.ts`); OTel TBD |

## Current signals

- `GET /api/health` — liveness + flags + `productionDeploy`
- Vercel runtime logs (platform)
- Supabase dashboard metrics

## DR checklist

See operational checklist: [`docs/ops/DR_CHECKLIST.md`](../ops/DR_CHECKLIST.md).

1. Confirm Supabase PITR / backup retention for project plan.
2. Document restore runbook (DB + Storage).
3. Quarterly restore drill; record RPO/RTO evidence under `docs/evidence/`.
4. Vercel rollback = redeploy previous deployment ID.
5. Feature-flag kill switches for matching/chat/media.

Init evidence: `docs/evidence/DR-CHECKLIST-INIT-2026-10-11.md`.

## Outbox (target)

Transactional `outbox_events` + worker for notifications/moderation — **MISSING** in schema; required before claiming reliable async delivery (Master ADR-008).
