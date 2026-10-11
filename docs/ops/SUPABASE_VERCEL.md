# Supabase + Vercel (DeepMatch staging)

## Supabase

| Field | Value |
|---|---|
| Project name | `deepmatch` |
| Ref | `zzqpvjdyvjarpphqhaze` |
| Region | `ap-southeast-1` |
| API URL | `https://zzqpvjdyvjarpphqhaze.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/zzqpvjdyvjarpphqhaze |
| Migrations | Pushed |

## Vercel (web)

| Field | Value |
|---|---|
| Team | `tradingbase` |
| Project | `deepmatch` |
| Production URL | https://deepmatch-eight.vercel.app |
| Inspect | https://vercel.com/tradingbase/deepmatch |
| Note | Deployment Protection may require Vercel login to view |

### Auth redirect (do in Supabase Dashboard → Authentication → URL configuration)

Add:

- `https://deepmatch-eight.vercel.app/**`
- `http://localhost:3000/**`

Site URL: `https://deepmatch-eight.vercel.app`

## Admin

Create/link `deepmatch-admin` with root deploy config for `apps/admin` (pending second project).

## Production GO

Still **NO-GO** for public launch until G5/G6 Founder + Safety signoff. Current URL is staging under tradingbase.
