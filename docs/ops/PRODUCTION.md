# DeepMatch Production

| Field | Staging | Production |
|---|---|---|
| Web | https://datingvn.com (`deepmatch`) | https://deepmatch-prod.vercel.app (`deepmatch-prod`) |
| Admin | https://deepmatch-admin.vercel.app | https://deepmatch-admin-prod.vercel.app (`deepmatch-admin-prod`) |
| Supabase | `zzqpvjdyvjarpphqhaze` | `iofrimcbvqrhefqkkyrx` (`deepmatch-prod`) |
| `NEXT_PUBLIC_APP_ENV` | `staging` | `production` |
| `productionDeploy` (health) | `false` | `true` |

## Secrets (gitignored)

- `.ai/prod.env.ps1` — Supabase URL/keys for prod  
- `.ai/prod-db-password.txt` — DB password used at project create  

## Billing (thu phí)

**Staging (datingvn.com) — chuyển khoản HD Bank (live):**

| Field | Value |
|---|---|
| Bank | HD Bank |
| STK | 0964859937 |
| Chủ TK | NGUYEN THI TUYET NHUNG |
| Giá | 99.000₫ / tháng |
| User | `/me/premium` → tạo lệnh CK |
| Admin | `/billing` → xác nhận đã nhận tiền |

Stripe vẫn optional cho production sau này (`ff_billing` + keys trên `deepmatch-prod`).

## DNS cutover (optional)

Khi muốn `datingvn.com` trỏ production:

1. Vercel `deepmatch-prod` → Domains → add `datingvn.com` + `www`  
2. Giữ staging trên `staging.datingvn.com` gắn project `deepmatch`  
3. Update Supabase Auth site_url / redirects cho domain mới  

## Deploy commands

```powershell
# Web prod
npx vercel link --yes --project deepmatch-prod --scope tradingbase
npx vercel deploy --prod --yes

# Restore staging link after
npx vercel link --yes --project deepmatch --scope tradingbase
```

## Grant admin owner on prod

Sau khi Founder đăng ký trên prod:

```powershell
# with .ai/prod.env.ps1 loaded
node --env-file=... scripts/grant-admin-owner.mjs
```
