# PREMIUM JOURNEY FLOWS (EXT-070 / DM-094)

## Three axes

1. **Tìm nhau** — discover → mutual → chat (never auto-creates Sánh đôi)
2. **Sánh đôi** — bilateral invite → map / memories / privacy
3. **Đồng hành** — optional services + lifestyle DEMO (sandbox labels)

## State matrix (web)

| State | Entry | Primary CTA | Denied |
|---|---|---|---|
| Guest | `/` | Bắt đầu / Đăng ký | `/discover`, couple data |
| Auth onboarding | `/onboarding` | Tiếp tục | Match chat |
| Dating | `/discover` | Quan tâm | Partner journals |
| Matched | `/chat` | Gửi tin | Unmatched threads |
| Sánh đôi | `/couple/*` | Thêm kỷ niệm | Ex-partner data |
| Lifestyle DEMO | `/lifestyle` | Browse DEMO | Real checkout |
| Suspended | `/me` | Support | Discovery |

## Navigation

ADR-11 mobile tabs: Khám phá · Sánh đôi · Đồng hành · Tin nhắn · Cá nhân.

## Deep links preserved

`/couple/join`, `/login`, `/signup`, `/discover`, `/chat`, `/services`, `/me/privacy`.
