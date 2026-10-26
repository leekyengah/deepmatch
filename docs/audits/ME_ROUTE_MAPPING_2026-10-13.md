# Route mapping — Personal Member Center

**Date:** 2026-10-13

## Management groups (5)

| Group | Leaf routes (unchanged) |
|---|---|
| Hồ sơ của tôi | `/me/edit`, `/me/media`, `/me/deep`, `/me/understand` |
| Ghép đôi & hành trình | `/me/preferences`, `/me/journey`, `/discover`, `/likes` |

| Thành viên & thanh toán | `/me/premium`, `/me/orders`, `/checkout/confirm` |
| An toàn & quyền riêng tư | `/safe`, `/me/privacy` |
| Tài khoản & cài đặt | `/me/account`, `/me/history`, language (client), staff (role-gated) |

## Alias / redirect (old → canonical)

| Old URL | New canonical | Type |
|---|---|---|
| `/me/profile` | `/me/edit` | permanent redirect |
| `/me/settings` | `/me/account` | permanent redirect |
| `/me/billing` | `/me/orders` | permanent redirect |
| `/me/safety` | `/safe` | permanent redirect |
| `/me/membership` | `/me/premium` | permanent redirect |
| `/matches` | `/likes` | permanent redirect |
| `/profile` | `/me` | permanent redirect |
| `/account` | `/me/account` | permanent redirect |

Leaf pages above remain live; hub only reorganizes navigation.
