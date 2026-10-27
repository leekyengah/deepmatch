# DeepMatch — Disaster Recovery Checklist

| Field | Value |
|---|---|
| Version | 1.0 |
| Updated | 2026-10-11 |
| Owner | DevOps |
| Related | `docs/architecture/OBSERVABILITY_AND_DR.md` |

## Targets

| Metric | Target |
|---|---|
| RPO | ≤ 15 minutes (Supabase PITR / plan-dependent) |
| RTO | ≤ 4 hours after drill start |

## Pre-requisites

- [ ] Confirm Supabase plan supports PITR / point-in-time recovery
- [ ] Record backup retention days
- [ ] Vercel project rollback known (previous deployment ID)
- [x] Feature-flag kill switches documented (`ff_matching`, `ff_chat`, `ff_media_upload`, `ff_discovery`, `ff_concierge`, `ff_premium`)
- [ ] Secrets stored only in Vercel/Supabase env (not git)
- [ ] Sentry DSN configured for staging (`NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`)

## Drill procedure (quarterly)

1. **Announce** maintenance window (staging first).
2. **Snapshot evidence**: note current migration version, Vercel deployment URL, Supabase project ref.
3. **Simulate failure**: e.g. mark staging DB read-only or deploy known-bad build, then rollback.
4. **Restore DB** (staging): restore to timestamp T−N via Supabase dashboard / PITR; measure clock time → RTO sample.
5. **Verify**: `/api/v1/health` 200; auth login; one mutual chat path; couple pins still ACL-correct.
6. **Rollback app**: Vercel → Promote previous deployment; measure time.
7. **Record** results in `docs/evidence/DR-DRILL-YYYY-MM-DD.md`.

## Rollback quick reference

| Layer | Action |
|---|---|
| App | Vercel dashboard → Deployments → Promote prior READY deploy |
| Feature | Set flag false in `feature_flags` or env `FF_*=false` |
| DB | Forward-fix compensating migration; PITR only with Founder approval |
| DNS | Keep Matbao A/CNAME; do not change NS during incident unless required |

## Pass criteria

- RPO/RTO measured (even if above target — record gap)
- No production mutate without G7
- Evidence file committed
