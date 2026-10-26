# Mobile readiness audit — Phase 2 (2026-10-13)

**Branch:** `audit/prod-readiness-2026-10-13`  
**Tooling available:** Expo SDK ~57 / RN 0.86 source audit; **no** attached iOS Simulator / Android emulator run in this session → device E2E = **NOT_TESTED / BLOCKED**.

## Screens inventoried (15 route files; 12 product surfaces)

| Screen file | Role | Auth | API parity notes | Status |
|---|---|---|---|---|
| `app/(auth)/login.tsx` | Login | public | Supabase auth | IMPLEMENTED / NOT_TESTED_DEVICE |
| `app/(auth)/signup.tsx` | Signup + split consents | public | Age/terms/privacy switches | IMPLEMENTED / NOT_TESTED_DEVICE |
| `app/(tabs)/index.tsx` | Home tab | session | Thin vs web `/home` | PARTIAL |
| `app/(tabs)/discover.tsx` | Discover | session | Uses shared API client | PARTIAL |
| `app/(tabs)/likes.tsx` | Likes | session | | PARTIAL |
| `app/(tabs)/chat.tsx` | Chat list | session | | PARTIAL |
| `app/chat/[id].tsx` | Chat thread | session | | PARTIAL |
| `app/(tabs)/couple.tsx` | Couple | session | Missing full DateMap/memories | PARTIAL |
| `app/(tabs)/companion.tsx` | Companion/services | session | | PARTIAL |
| `app/(tabs)/me.tsx` | Me + legal hub + IAP | session | Opens web legal URLs | PARTIAL |
| `app/(tabs)/_layout.tsx` | Tab nav | | safe-area via RN screens | IMPLEMENTED |
| `app/_layout.tsx` | Root | | | IMPLEMENTED |
| `+not-found` / `+html` | System | | | N/A |

## Checklist

| Item | Result |
|---|---|
| Expo `app.json` / EAS present | YES (`apps/mobile/eas.json`) |
| Navigation (Expo Router) | YES |
| Auth screens | YES |
| API base `EXPO_PUBLIC_API_URL` | Defaults datingvn.com |
| Permission prompts (camera/location/push) | **NOT_TESTED** on device |
| Push notifications | **NOT_TESTED / likely incomplete** |
| Media upload native picker | **PARTIAL / NOT_TESTED** |
| Deep links | **NOT_TESTED** |
| Safe areas | Layout uses RN safe-area context — **NOT_TESTED** visually |
| Offline / error states | **PARTIAL** (Alert patterns) |
| Store signing / App Privacy | **BLOCKED_EXTERNAL** |
| Android instrumented run | **BLOCKED** (no emulator in session) |
| iOS Simulator run | **BLOCKED** (no simulator in session) |

## Verdict

- **Web-mobile parity:** PARTIAL (mobile thinner)  
- **iOS readiness:** NO-GO / BLOCKED device+store  
- **Android readiness:** NO-GO / BLOCKED device+store  
