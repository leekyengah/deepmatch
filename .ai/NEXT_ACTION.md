# NEXT ACTION

## Done

- [x] Supabase cloud project `deepmatch` (`zzqpvjdyvjarpphqhaze`, ap-southeast-1)
- [x] Linked + `db push` migrations
- [x] Local `.env.local` written (gitignored) for root/web/admin

## Need Founder (1 phút)

Vercel CLI token hiện invalid / login cần TTY. Làm **một** trong hai:

1. Trong terminal repo: `npx vercel login` → Continue with GitHub → rồi báo mình  
2. Hoặc tạo token tại https://vercel.com/account/tokens → gửi token (hoặc set `$env:VERCEL_TOKEN`) — mình sẽ tạo `deepmatch-web` + `deepmatch-admin` và gắn env

## After Vercel login

```bash
npx vercel --cwd apps/web --yes
npx vercel --cwd apps/admin --yes
```
