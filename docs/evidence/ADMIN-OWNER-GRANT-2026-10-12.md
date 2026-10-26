# Evidence — Admin owner grant (`leekyengah@gmail.com`)

| Field | Value |
|---|---|
| Date | 2026-10-12 |
| Email | `leekyengah@gmail.com` |
| Role | `owner` (full platform ownership per DM-079) |

## Changes

1. Migration `supabase/migrations/20261012020000_admin_owner_seed.sql`
   - RLS on `admin_roles` (self-select only)
   - `has_admin_role()` helper
   - `grant_admin_role_by_email(email, role)` (service_role)
   - Seeds `owner` for `leekyengah@gmail.com` when auth user exists
2. Script `npm run grant:owner` → `scripts/grant-admin-owner.mjs`
3. Admin app gate: login + allowlist / `admin_roles` owner|admin
4. `.env.example` → `ADMIN_OWNER_EMAILS=leekyengah@gmail.com`

## Apply on staging

```bash
# 1) Push migration (or supabase db push / linked migrate)
# 2) Ensure the user has signed up once
npm run grant:owner
# or: node --env-file=.env.local scripts/grant-admin-owner.mjs --email=leekyengah@gmail.com
```

## Verify

```sql
select ar.role, u.email
from public.admin_roles ar
join auth.users u on u.id = ar.user_id
where lower(u.email) = 'leekyengah@gmail.com';
-- expect: owner
```

## Live grant (staging via `.env.local`)

```
OK: leekyengah@gmail.com → admin_roles.owner (user_id=cf4b957b-6197-4c06-b61a-97c44db90e20)
```

Re-confirmed 2026-10-12 (Founder request): staging grant OK; Vercel `deepmatch-admin` → `ADMIN_OWNER_EMAILS=leekyengah@gmail.com` (prod/preview/dev) + redeploy.

**Prod** (`deepmatch-prod` / `iofrimcbvqrhefqkkyrx`): chưa có auth user cho email này — đăng ký một lần trên https://deepmatch-prod.vercel.app rồi chạy lại `grant-admin-owner.mjs` với `.ai/prod.env.ps1`.
