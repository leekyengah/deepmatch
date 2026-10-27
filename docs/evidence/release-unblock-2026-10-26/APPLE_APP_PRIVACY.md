# Apple App Privacy — Draft (engineering truth table)

**Status:** DRAFT for Founder/Legal — not submitted  
**App:** DeepMatch · `com.datingvn.deepmatch` · Expo  
**Basis:** Current staging behavior / SDK inventory as of 2026-10-26  
**Do not claim** capabilities that are not live (push, Sentry, LIVE PSP).

## Data collected (Nutrition Label mapping)

| Data type | Collected? | Linked to user? | Used for tracking? | Purpose (App Store categories) | Notes |
|-----------|------------|-----------------|--------------------|--------------------------------|-------|
| Email address | Yes | Yes | No | App Functionality; Account | Auth (Supabase) |
| Name / display name | Yes | Yes | No | App Functionality | Profile |
| User ID | Yes | Yes | No | App Functionality | UUID |
| Photos / Videos | Yes | Yes | No | App Functionality | Profile media; gated discover ≥3 photos |
| Other contact info | Optional | Yes | No | App Functionality | Bio / job / fuzzy region — no precise GPS in ranking |
| Precise location | No | — | — | — | OSM-only maps; no continuous GPS collection claimed |
| Coarse location | Optional / fuzzy | Yes | No | App Functionality | Fuzzy region only if user sets |
| Payment info | Via Apple IAP / bank transfer instructions | Yes (transaction) | No | App Functionality; Purchases | LIVE PSP **off**; CK/sandbox only until Founder enables |
| Product interaction | Yes (product logs) | Yes | No | Analytics (product) / App Functionality | First-party; no ad SDK bundled |
| Crash data | **Not currently** | — | — | — | Sentry DSN empty — **do not declare** until enabled |
| Performance data | **Not currently** | — | — | — | Same |
| Device ID for ads | No | — | No | — | No ad network |
| Contact list / calendar | No | — | — | — | |
| Health / Sensitive | No | — | — | — | Dating intent only; AI non-clinical |

## Privacy nutrition answers (suggested)

1. **Do you or your third parties collect data?** Yes (first-party + Supabase auth/storage).  
2. **Used for tracking?** **No** (no ATT / no ad ID / no cross-app tracking SDK).  
3. **Privacy Policy URL:** `https://datingvn.com/privacy` (staging; replace with production domain at submit).  
4. **Account deletion:** In-app `/account-deletion` + `POST /api/v1/me/delete` (confirm=`DELETE`) — required for 5.1.1.  
5. **Encryption:** `ITSAppUsesNonExemptEncryption: false` in Info.plist.

## Third parties (declare only if linked)

| Partner | Role | Data |
|---------|------|------|
| Supabase | Auth, DB, storage | Account, profile, media paths |
| Vercel (hosting) | Edge/logs | Request metadata |
| Expo / EAS | Updates (if enabled) | Runtime update channel |
| Payment | Sandbox/CK only until LIVE | Order metadata |

## Founder checklist before ASC submit

- [ ] Counsel signs this table vs live binary  
- [ ] Re-scan `package.json` for new analytics/ads  
- [ ] If Sentry/push enabled later → amend labels before ship  
- [ ] Age 18+ only — no Child accounts  
