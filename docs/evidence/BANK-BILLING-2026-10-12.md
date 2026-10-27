# Bank transfer billing — HD Bank (2026-10-12)

## DNS

- Founder confirmed DNS updated
- Verified: `datingvn.com` A → `216.150.1.1`, `GET /api/v1/health` → 200

## Receiving account (Founder)

| Field | Value |
|---|---|
| Bank | HD Bank |
| Account | 0964859937 |
| Holder | NGUYEN THI TUYET NHUNG |
| Plan | Premium 99.000₫ / tháng |

## Flow

1. User `/me/premium` → **Tạo lệnh chuyển khoản** → mã `DMxxxxxxxx`  
2. Transfer with content `{code} PREMIUM`  
3. Admin `/billing` → **Xác nhận đã nhận tiền** → subscription active 30 days  

## Code

- Migration `20261012170000_bank_transfer_billing.sql`
- API `GET/POST /api/v1/payments/bank-transfer`
- RPC `create_bank_transfer_payment`, `staff_confirm_bank_payment`
- Flags: `ff_premium` + `ff_billing` on

## Deploy verify (2026-10-12)

| Check | Result |
|---|---|
| `GET https://datingvn.com/api/v1/health` | 200, `ff_premium`+`ff_billing` true |
| `/me/premium` | 200 — 99.000₫, badge HD Bank, nút tạo lệnh CK |
| Admin | https://deepmatch-admin.vercel.app → `/billing` (auth redirect OK) |
| Master sheet DM-057 | Hoàn thành |

