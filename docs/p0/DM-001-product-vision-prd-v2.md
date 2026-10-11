# DM-001 — Product Vision & PRD v2 (Draft — In review)

**Status:** In review (Cursor draft; Founder signoff required for G0)  
**Source:** Master Tracker Control Center + MASTER BACKLOG; Tổng quan Google Doc blocked (Drive auth timeout / 403)  
**Date:** 2026-10-11  
**Brand tokens:** `#E95383` | `#F6C1D2` | `#FFF8FA` | `#822D4C`

## 1. Vision

DeepMatch là nền tảng quan hệ xanh (greenfield) giúp người dùng:
1. **Tìm nhau** — khám phá opt-in, matching rule-based explainable, mutual like, chat realtime 1:1.
2. **Chúng mình** — không gian cặp đôi riêng (bản đồ kỷ niệm 3 lớp, media, góc nhìn cá nhân).
3. **Đồng hành** — dịch vụ tư vấn có phạm vi quyền rõ, consent từng phần.
4. **Bảng cá nhân** — hồ sơ, privacy, phiên, lịch sử kết nối.
5. **Admin** — vận hành an toàn, moderation, CMS, analytics, feature flags.

## 2. First-release scope (approved product intent)

| Phân hệ | In scope | Out of scope (unless separate ADR) |
|---|---|---|
| Tìm nhau | Hard filters + ranking explainable, likes, mutual, anti-abuse | % tình yêu, EQ/AI chẩn đoán, GPS chính xác |
| Chat | 1:1 sau mutual, media giới hạn, block/report/mute | Group chat, E2EE full (ADR-06 boundary) |
| Chúng mình | Invite mutual, map 3 layers, private notes default | Public couple feed, auto-pair từ mutual like |
| Đồng hành | Booking, advisor ACL, case notes scoped | Unscoped counselor browse of diaries |
| Cá nhân | Dashboard, progressive profile, privacy toggles | Forced dating-profile for couple mode |
| Admin | RBAC owner/admin/moderator/advisor/support, audit | Default chat/journal browsing |
| Monetization | Safety free; premium deferred (P6 / DM-057) | Paywall on block/report |

## 3. Non-negotiable product rules

1. Mutual like **không** tạo không gian Chúng mình.
2. Pair chỉ sau lời mời + chấp thuận hai phía.
3. Ranker **không** dùng nhật ký riêng / vị trí chính xác / ghi chú tư vấn.
4. Matching lý do = dữ liệu tự khai; không hàm ý khoa học tương thích.
5. Admin least privilege + audit; break-glass có lý do.
6. Feature flags / kill switches cho matching, chat, media.
7. Không tự deploy production không có Founder + Safety GO.

## 4. Personas (summary — detail DM-004)

- **Solo seeker** — muốn khám phá có kiểm soát privacy.
- **Early dating** — mutual → chat → có thể mời pair sau.
- **Established couple** — vào Chúng mình bằng mã mời, không bắt hồ sơ hẹn hò.
- **Advisor** — chỉ case được gán.
- **Admin/Moderator/Support** — vận hành & an toàn.

## 5. Success definition (beta measurement — no fake KPI targets)

Đo tại closed beta: đăng ký→opt-in discovery→mutual→chat→pair invite→map pin; report SLA; cross-pair leakage = 0 trong test suite. Không đặt chỉ tiêu số bịa trước baseline.

## 6. Traceability

Xem [DM-001-traceability-matrix.md](./DM-001-traceability-matrix.md).

## 7. Open architecture decisions

Xem [DM-001-adr-open-questions.md](./DM-001-adr-open-questions.md) và `docs/adr/`.

## 8. Acceptance (DoD for DM-001)

- [x] PRD phản ánh 5 phân hệ + phân quyền + lộ trình phases
- [x] Traceability matrix DM-ID ↔ phân hệ ↔ gate
- [x] ADR checklist mở
- [ ] Founder Product signoff (G0) — **pending**

## 9. Proposed status

**Proposed:** In review  
**Next READY:** DM-002 (research protocol), DM-003, DM-004 (parallel after DM-001 draft exists)  
**Blockers:** B1 Tổng quan Doc unread; Founder G0
