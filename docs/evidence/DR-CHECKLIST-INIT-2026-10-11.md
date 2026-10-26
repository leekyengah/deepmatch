# DR Checklist Init Evidence — 2026-10-11

| Item | Status |
|---|---|
| DR checklist published | PASS — `docs/ops/DR_CHECKLIST.md` |
| Observability doc updated | PASS — Sentry wiring + DSN env |
| Full restore drill executed | NOT_RUN (schedule quarterly; needs Founder window) |
| Supabase PITR confirmed for plan | UNVERIFIED — check dashboard Billing/Settings |
| Sentry project DSN in Vercel | PENDING Founder — create project, set env |
| RPO/RTO measured | NOT_RUN |

## Next drill owner action

1. Create Sentry project → paste DSN into Vercel env `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN`.
2. Confirm Supabase backup/PITR for `zzqpvjdyvjarpphqhaze`.
3. Book staging DR drill; fill `docs/evidence/DR-DRILL-YYYY-MM-DD.md`.
