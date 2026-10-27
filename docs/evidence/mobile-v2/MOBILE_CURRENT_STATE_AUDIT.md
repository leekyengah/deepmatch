# Mobile V2.0 — Current State Audit (Phase 0)

**Date:** 2026-10-14  
**Branch:** `audit/prod-readiness-2026-10-13` @ `139292e`  
**Visual baseline:** `docs/design/references/mobile-v2-20-screens-mockup.png`  
**Prior audits:** `docs/evidence/audit-2026-10-13/phase2|phase3/`

## Stack (actual)

| Layer | Version |
|---|---|
| Expo | ~57.0.27 |
| expo-router | ~57.0.25 |
| React Native | 0.86.3 |
| React (mobile) | 19.2.3 |
| Next.js web/admin | 15.5.27 |
| Supabase JS | ^2.47.10 |
| design-tokens | 0.1.0 (approved wine/cream) |

## Architecture summary

- **Web** = feature-complete member surface (59 pages, 68 APIs).  
- **Admin** = Next ops console (users, moderation, services, billing sandbox, flags).  
- **Mobile** = thin Expo shell: auth, discover, likes, chat thread, me; Couple/Companion are **WebBrowser deep-links**.  
- Auth: Supabase + SecureStore; API via Bearer to `EXPO_PUBLIC_API_URL` (default datingvn.com).  
- No parallel DB; reuse existing RLS/APIs.

## Brand tokens

Approved tokens in `@deepmatch/design-tokens` take precedence over mockup hex deltas (`#641C35` ≈ `#6B2D3C`, etc.). Mockup used as **layout/UX baseline**, not a second palette source of truth.

## Blockers (external)

| Blocker | Impact |
|---|---|
| Maps / Mapbox billing keys | M07 interactive map |
| LIVE PSP / Store billing | M10 LIVE charges |
| Store signing / ASC IDs | Store + IAP |
| Physical device / emulator QA | G6/G7 gates |
| Admin support queue API | A06 depth |

## Verdict

Mobile is **not** Web-parity. V2.0 must replace deep-link shells with native modules, add missing M02/M04/M07–M12 and Admin mobile, keep sandbox/LIVE gates honest.
