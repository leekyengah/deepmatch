# Vercel import (browser — one click)

Code đã push: https://github.com/leekyengah/deepmatch

## Tạo 2 project

1. **deepmatch-web**  
   https://vercel.com/new/clone?repository-url=https://github.com/leekyengah/deepmatch&project-name=deepmatch-web&root-directory=apps/web

2. **deepmatch-admin**  
   https://vercel.com/new/clone?repository-url=https://github.com/leekyengah/deepmatch&project-name=deepmatch-admin&root-directory=apps/admin

## Env (Production + Preview)

Lấy từ `apps/web/.env.local` (đã có sẵn local, không commit):

- `NEXT_PUBLIC_SUPABASE_URL` = `https://zzqpvjdyvjarpphqhaze.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (anon key trong `.env.local`)
- `NEXT_PUBLIC_APP_ENV` = `staging`
- `FF_MATCHING` / `FF_CHAT` / `FF_MEDIA_UPLOAD` / `FF_DISCOVERY` = `true`
- `FF_CONCIERGE` = `false`
- `MIN_AGE` = `18`

**Không** dán `SUPABASE_SERVICE_ROLE_KEY` vào Vercel client env.

## Sau khi deploy

Trong Supabase Auth → URL configuration, thêm:

- `https://<deepmatch-web>.vercel.app/**`
- `http://localhost:3000/**`
