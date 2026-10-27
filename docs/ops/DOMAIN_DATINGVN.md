# Domain: datingvn.com → Vercel deepmatch

## DNS lấy ở đâu? (tóm tắt)

| Việc | Nơi làm |
|---|---|
| Mua / giữ tên miền `datingvn.com` | **Matbao** (nhà đăng ký) |
| Sửa bản ghi A / CNAME / NS | Panel DNS Matbao *hoặc* đổi NS sang Vercel |
| Giá trị IP / CNAME trỏ app | **Vercel** → Project `deepmatch` → Settings → Domains (copy A/CNAME hiện tại) |

Chi tiết Option A/B bên dưới. Staging đã gắn domain trên Vercel; DNS phải khớp thì user mới vào được `https://datingvn.com`.

## Status (2026-10-12)

| Item | Status |
|---|---|
| Attached to project `tradingbase/deepmatch` | Done |
| `datingvn.com` verified in Vercel | Yes (project-side) |
| `www.datingvn.com` verified in Vercel | Yes (project-side) |
| DNS (Founder cập nhật 2026-10-12) | **Live** — `datingvn.com` A → `216.150.1.1`, HTTPS health 200 |

Verified: `Resolve-DnsName datingvn.com` → Vercel anycast; `GET https://datingvn.com/api/v1/health` → 200 (`ff_premium` + `ff_billing` on).

## Option A — Đổi Nameserver sang Vercel (đơn giản)

Tại nhà đăng ký **Matbao**, đổi NS thành:

1. `ns1.vercel-dns.com`
2. `ns2.vercel-dns.com`

Chờ propagate (thường 5 phút – 48 giờ).

## Option B — Giữ NS Matbao, trỏ record (khuyến nghị nếu không đổi NS)

Tại Matbao DNS quản lý:

| Type | Name | Value |
|---|---|---|
| A | `@` | `216.150.1.1` |
| A | `@` | `216.150.16.1` |
| CNAME | `www` | `e34d2819c4f1efcd.vercel-dns-016.com` |
| CNAME | `admin` | `cname.vercel-dns.com` (project `deepmatch-admin` — đã gắn `admin.datingvn.com`) |

Fallback (rank 2): A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`

## After DNS works

1. Supabase Auth URL:
   - Site URL: `https://datingvn.com`
   - Redirects: `https://datingvn.com/**`, `https://www.datingvn.com/**`, `http://localhost:3000/**`
2. Redeploy if needed so `NEXT_PUBLIC_APP_URL=https://datingvn.com`.
