# DEEPMATCH Language & Content Audit

**Date:** 2026-10-12  
**Scope:** web, admin, mobile, shared AI, API-facing user messages  
**Baseline:** No i18n package existed; ~87 TSX files contained Vietnamese UI strings; mobile tabs mixed EN labels with VI alerts.

## Classification legend

| Tag | Meaning |
|---|---|
| CORRECT | Fits brand voice / glossary; no change required at audit time |
| IMPROVE | Understandable but should be rewritten or localized |
| INCONSISTENT | Same concept, multiple wordings |
| UNTRANSLATED | Locale missing or EN/VI mix without intent |
| MISSING | No string / no key for required UI state |
| SENSITIVE_REVIEW | Legal, safety, mental-health adjacent — HUMAN_REVIEW_REQUIRED |

> Items marked **FIXED** below were changed in source during this wave. Items without FIXED remain open.

## Architecture findings

| Finding | Class | Status |
|---|---|---|
| No shared message catalogs | MISSING | FIXED — `@deepmatch/i18n` |
| No locale detection / persistence | MISSING | FIXED — cookie + SecureStore |
| No language switcher | MISSING | FIXED — web/admin/mobile |
| Hardcoded VI in web nav / shell | IMPROVE | FIXED — `nav.*` keys |
| Mobile tabs EN + body VI mix | INCONSISTENT / UNTRANSLATED | FIXED — core tabs/auth/chat |
| AI disclaimer only VI | UNTRANSLATED | FIXED — `ai.disclaimer` + locale input |
| Legal pages (terms/privacy) | SENSITIVE_REVIEW | FIXED wire → `legal.*` + HUMAN_REVIEW_REQUIRED badge; content not legally certified |
| Many secondary web screens still hardcoded VI | UNTRANSLATED | FIXED wave 4 — UI TSX inventory 0 VI literals |
| API error `message` often English/VI ad hoc | INCONSISTENT | FIXED wave 5 — localized `jsonError` + `error.key`; clients map via `errors.*` |

## Terminology conflicts (resolved for nav)

| Concept | Pre-audit variants | Decision |
|---|---|---|
| Discovery | Tìm nhau · Discover · Khám phá | **Nav:** Tìm nhau / Discover (brand pillar). Verb “khám phá” OK in body. |
| Couple | Chúng mình · Đôi · Couple | **Nav:** Chúng mình / Our Space; full: Không gian của chúng mình |
| Mutual | Cùng thích · Match! | **Cùng thích / Mutual Match**; removed “Match!” urgency |
| Concierge | Đồng hành · Services | **Đồng hành / Concierge** |

## Sample inventory (representative)

| Surface | Sample | Class | Status |
|---|---|---|---|
| Web landing hero | Brand tagline | CORRECT | FIXED → `marketing.*` |
| Web Discover | “Quan tâm / Bỏ qua”, mutual toast | IMPROVE | FIXED → `discovery.*` |
| Web Likes | Mixed empty copy | IMPROVE | FIXED → `matching.*` |
| Web CoupleNav | Hardcoded VI | UNTRANSLATED | FIXED → `couple.*` |
| Web login/onboarding/forms | Hardcoded VI | UNTRANSLATED | FIXED waves 2–3 |
| Web lifestyle/commerce | DEMO labels mixed | IMPROVE | FIXED wave 4 → `commerce.*` |
| Web safety | DeepSafe copy | SENSITIVE_REVIEW | FIXED → `safety.*` |
| Admin shell/nav | Hardcoded VI | UNTRANSLATED | FIXED → `admin.*` |
| Admin page bodies | Hardcoded VI | UNTRANSLATED | FIXED wave 4 → `admin.*` |
| Mobile Discover Like/Pass EN | INCONSISTENT | FIXED |
| Mobile Me / IAP | VI + EN alerts | INCONSISTENT | FIXED |
| Shared AI stub | VI-only | UNTRANSLATED | FIXED bilingual + keys |
| Push/email templates | Mostly absent | MISSING | `notifications.*` scaffold only |
| Accessibility labels | Partial | IMPROVE | `accessibility.*` + switcher aria |

## Counts (approximate)

| Bucket | Approx. |
|---|---|
| TSX files with Vietnamese (pre-wave) | 87 |
| Priority surfaces migrated wave 1 | Landing, AppShell/nav, Discover, Likes, CoupleNav, Admin shell/nav, Mobile auth+tabs+chat+me, AI disclaimer |
| Priority surfaces migrated wave 2 | Web auth/signup/forgot/reset, onboarding, Me hub, ChatShell, Couple home+invite, DeepSafe page+client, Premium |
| Priority surfaces migrated wave 3 | Me edit/privacy/account/history/deep, AvatarUpload, Couple map/us/add, Lifestyle hub, Admin login/denied/home |
| Priority surfaces migrated wave 4 | Couple map clients/canvases, services/bookings, billing/bank, lifestyle cart/orders/detail, AI clients, FAQ/legal, admin ops pages |
| Remaining hardcoded UI files (web/admin TSX) | 0 VI diacritic literals (API routes excluded) |
| Catalog keys per locale | 977 (see `npm run i18n:parity`) |

## Sensitive content queue

| Item | Tag |
|---|---|
| `/terms`, `/privacy`, account deletion copy | SENSITIVE_REVIEW · HUMAN_REVIEW_REQUIRED |
| AI deepmind / self-reflection | SENSITIVE_REVIEW · staged copy OK |
| Safety “no absolute guarantee” messaging | SENSITIVE_REVIEW |
| Refund / bank-transfer billing disclosures | SENSITIVE_REVIEW |

## Next migration priority

1. HUMAN_REVIEW legal pack sign-off — `docs/content/LEGAL_HUMAN_REVIEW_PACK.md`  
2. Push/email templates when notification channels ship  
3. Mobile ExternalLink typecheck fix (unrelated)
