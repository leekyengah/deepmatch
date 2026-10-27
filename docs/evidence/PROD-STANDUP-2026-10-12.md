# Evidence — Dedicated production standup 2026-10-12

## Goal

Separate production from staging; `NEXT_PUBLIC_APP_ENV=production`; billing scaffold off until Stripe keys.

## Created

| Resource | ID / URL |
|---|---|
| Supabase project | `deepmatch-prod` / `iofrimcbvqrhefqkkyrx` (ap-southeast-1) |
| Vercel web | `deepmatch-prod` → https://deepmatch-prod.vercel.app |
| Vercel admin | `deepmatch-admin-prod` → https://deepmatch-admin-prod.vercel.app |
| Secrets (local, gitignored) | `.ai/prod.env.ps1`, `.ai/prod-db-password.txt` |

## Verified

```json
GET https://deepmatch-prod.vercel.app/api/v1/health
{
  "ok": true,
  "env": "production",
  "productionDeploy": true,
  "flags": { "ff_billing": false, "ff_premium": false }
}
```

- Admin prod login page HTTP 200 (SSO protection disabled).
- Staging remains https://datingvn.com with `env=staging` / `productionDeploy=false`.
- Local CLI re-linked to Vercel project `deepmatch` after prod ops.

## Billing

- Migration `20261012151000_payments_billing.sql` on prod.
- Routes: `/api/v1/payments/checkout`, `/api/v1/payments/webhooks/stripe`.
- UI: `/me/account` (gated by `ff_billing`).
- **Not charging** until Founder sets Stripe keys + enables `FF_BILLING` / flag.

## Ops doc

`docs/ops/PRODUCTION.md`
