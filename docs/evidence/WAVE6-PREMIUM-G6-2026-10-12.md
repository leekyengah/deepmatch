# Wave 6 — Premium stub + G6 runbook (2026-10-12)

## Shipped

| Item | Detail |
|---|---|
| `ff_premium` | DB + shared default **false** |
| UI | `/me/premium` gated; link from `/me` |
| G6 runbook | `docs/ops/G6_PUBLIC_LAUNCH.md` |
| Gates sheet | G5/G6 ĐƯỢC PHÉP (align FOUNDER-G5-G6-G7) |
| DM-058 / DM-090 | Hoàn thành (staging public GO) |
| DM-057 | Đang nghiệm thu (stub, no billing) |

## Verify

| Check | Result |
|---|---|
| typecheck shared/web | PASS |
| unit tests shared | 13/13 |
| Playwright | 8/8 |
| DR soft-check | 4/5 (admin edge fetch flaky local) |
| Deploy | datingvn.com READY |

## Residual

- Paste Sentry DSN when ready
- Enable `ff_premium` only after pricing + payment provider
