# Supabase + Vercel (DeepMatch staging)

## Supabase

| Field | Value |
|---|---|
| Project name | `deepmatch` |
| Ref | `zzqpvjdyvjarpphqhaze` |
| Region | `ap-southeast-1` |
| API URL | `https://zzqpvjdyvjarpphqhaze.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/zzqpvjdyvjarpphqhaze |
| Status | ACTIVE_HEALTHY |
| Migrations | Pushed 2026-10-11 (init + auth trigger + RLS + invite RPC + matching/chat policies) |

Local link: `npx supabase link --project-ref zzqpvjdyvjarpphqhaze`  
Env: `.env.local` / `apps/web/.env.local` / `apps/admin/.env.local` (**gitignored**)

## Vercel

Requires interactive login (CLI token invalid / non-TTY):

```bash
npx vercel login
# then from repo:
npx vercel link --yes
npx vercel --cwd apps/web --yes
npx vercel --cwd apps/admin --yes
```

Suggested project names:

- `deepmatch-web` (root directory `apps/web`)
- `deepmatch-admin` (root directory `apps/admin`)

Env vars to set on both (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_ENV=staging`
- feature flags as in `.env.example`
- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in client-exposed Vercel envs unless server-only and required; prefer Edge-safe anon key for web.

## Production

Still **NO-GO** until G5/G6 Founder + Safety signoff.
