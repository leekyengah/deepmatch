# DM-015 — Information Architecture / Sitemap

| Field | Value |
|---|---|
| Updated | 2026-10-12 |
| Sources | UI Spec V1, Prototype HTML, Master Tracker, repo routes |
| Note | Tổng quan captured 2026-10-12 → `docs/brand/TONG_QUAN_THUONG_HIEU_SAN_PHAM.md` |

## Modes

1. Solo / discovery-first (Tìm nhau → mutual → chat → optional couple invite)
2. Couple-first (invite code; skip dating profile depth)
3. Concierge overlay (Đồng hành; feature-flagged)

## User app (`apps/web`)

| Route | UI Spec | Purpose |
|---|---|---|
| `/` | UI-01 | Landing / ba hành trình |
| `/login` `/signup` | UI-20 | Auth (recover TBD) |
| `/onboarding` | UI-21 | Age/ToS + mode solo\|couple |
| `/discover` | UI-02, UI-23, UI-24 | Gợi ý, lý do, thích/bỏ qua, filter |
| `/likes` | UI-03 | Cùng thích / kết nối |
| `/chat` | UI-04 | Hội thoại 1:1 sau mutual |
| `/couple` | UI-05 | Trang chủ không gian cặp |
| `/couple/invite` | UI-25 | Lời mời tạo/nhận |
| `/couple/map` | UI-06, UI-26 | Bản đồ 3 lớp ghim |
| `/couple/memories` | UI-07, UI-27 | Dòng thời gian / kỷ niệm |
| `/couple/add` | UI-26 | Tạo ghim / kỷ niệm |
| `/couple/promises` | UI-08 | Wishlist nơi muốn đến |
| `/couple/us` | UI-05 | Hai đứa / ngắt kết nối |
| `/services` | UI-09 | Đồng hành — 4 dịch vụ |
| `/bookings` | UI-10, UI-28 | Lịch hẹn dịch vụ |
| `/me` | UI-11 | Bảng cá nhân |
| `/me/edit` | UI-11 | Chỉnh sửa hồ sơ |
| `/me/deep` | UI-22 | Hồ sơ hẹn hò chuyên sâu |
| `/me/privacy` | UI-12 | Quyền riêng tư / đồng ý |
| `/me/account` | UI-29 | Bảo mật, thiết bị, thông báo |
| `/me/history` | UI-11 | Lịch sử kết nối |

Hard rules reflected in IA: chat only after mutual; mutual ≠ auto couple space; journals private by default.

## Admin (`apps/admin`)

| Route | UI Spec | Purpose |
|---|---|---|
| `/` | UI-13 | Dashboard |
| `/users` | UI-14 | Người dùng |
| `/moderation` | UI-15 | Duyệt hồ sơ/ảnh + báo cáo |
| `/matching` | UI-16 | Vận hành ghép đôi |
| `/safety` | UI-15 | An toàn chat (scoped) |
| `/services` | UI-17 | Chuyên viên / dịch vụ |
| `/cms` | UI-31 | Nội dung / FAQ / ToS |
| `/analytics` | UI-18 | KPI |
| `/flags` | UI-19 | Cờ tính năng / cấu hình |

## Gap matrix (2026-10-12)

Status: **Scaffold** = thin page; **Partial** = some behavior/API; **Missing** = no route; **OK** = usable baseline.

| Code | Screen | Route | Status |
|---|---|---|---|
| UI-01 | Landing | `/` | Scaffold |
| UI-02 | Discover | `/discover` | Partial (candidates + likes API wired) |
| UI-03 | Likes / connections | `/likes` | Partial (wired to `/api/v1/matches`) |
| UI-04 | Chat | `/chat` | Partial (`ChatShell` + `/api/v1`) |
| UI-05 | Couple home | `/couple` | Scaffold (+ CoupleNav) |
| UI-06 | Love map | `/couple/map` | Scaffold |
| UI-07 | Timeline | `/couple/memories` | Scaffold (empty) |
| UI-08 | Wishlist | `/couple/promises` | Scaffold (empty) |
| UI-09 | Services | `/services` | Scaffold |
| UI-10 | Bookings | `/bookings` | Missing |
| UI-11 | Personal board | `/me` | Partial |
| UI-12 | Privacy | `/me/privacy` | Partial |
| UI-13 | Admin home | `/` (admin) | Scaffold |
| UI-14 | Admin users | `/users` | Scaffold |
| UI-15 | Moderation | `/moderation`, `/safety` | Scaffold |
| UI-16 | Admin matching | `/matching` | Missing (linked 404) |
| UI-17 | Admin services | `/services` | Missing (linked 404) |
| UI-18 | Analytics | `/analytics` | Missing (linked 404) |
| UI-19 | Settings/flags | `/flags` | Scaffold |
| UI-20 | Auth flows | `/login`, `/signup` | Partial (no recover) |
| UI-21 | Onboarding | `/onboarding` | Scaffold |
| UI-22 | Deep profile Qs | `/me/deep` | Scaffold |
| UI-23 | Candidate profile | (modal/route) | Missing |
| UI-24 | Filters empty | discover filter | Missing |
| UI-25 | Couple invite states | `/couple/invite` | Partial (create/accept API) |
| UI-26 | Pin editor | `/couple/add` | Scaffold (form, no fake save) |
| UI-27 | Journal share | memories | Scaffold |
| UI-28 | Booking detail | `/bookings` | Scaffold (empty) |
| UI-29 | Account/devices | `/me/account` | Scaffold |
| UI-30 | Admin case detail | moderation | Missing |
| UI-31 | CMS | `/cms` | Missing |
| UI-32 | System error surfaces | shared | Missing (Wave 1 adds primitives) |

See also: [`DM-016-wireframes.md`](./DM-016-wireframes.md), [`DM-017-design-tokens.md`](./DM-017-design-tokens.md).
