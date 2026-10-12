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

## Auth URL configuration (pushed via `supabase config push`)

- Site URL: `https://datingvn.com`
- Redirect allowlist includes:
  - `https://datingvn.com/**`
  - `https://datingvn.com/auth/callback`
  - `https://www.datingvn.com/**`
  - `https://deepmatch-eight.vercel.app/**`
  - `https://deepmatch-admin.vercel.app/**`
  - `http://localhost:3000/**`
  - `http://127.0.0.1:3000/**`
- Email confirmations: ON · MFA TOTP enroll: ON

## Vercel

| App | Project | URL |
|---|---|---|
| Web | `deepmatch` | https://datingvn.com |
| Admin | `deepmatch-admin` | https://deepmatch-admin.vercel.app |

Deploy web from repo root (`vercel.json` = web). Admin: swap `vercel.admin.json` → `vercel.json`, link `deepmatch-admin`, deploy, restore.

## Production GO

Still **NO-GO** for public launch until G5/G6/G7 Founder + Safety signoff.
