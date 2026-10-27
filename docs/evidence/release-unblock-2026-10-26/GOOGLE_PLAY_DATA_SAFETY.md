# Google Play Data Safety — Draft (engineering truth table)

**Status:** DRAFT for Founder/Legal — not submitted  
**Package:** `com.datingvn.deepmatch` · versionCode `1` · versionName `1.0.0`  
**Delete request path (must match Play policy):** in-app Account deletion + web `https://datingvn.com/account-deletion`

## Data safety summary answers (suggested)

| Question | Answer |
|----------|--------|
| Does the app collect/share user data? | **Yes** — collect; share limited to service providers (Supabase/hosting) for app functionality |
| Is all data encrypted in transit? | **Yes** (HTTPS / TLS) |
| Can users request deletion? | **Yes** — in-app + web account-deletion |
| Independent security review? | **No** claim until Independent QA signed |

## Data types

| Category | Collected | Shared | Purpose | Optional? |
|----------|-----------|--------|---------|-----------|
| Personal info — Email | Yes | With auth provider | Account | Required for signup |
| Personal info — Name | Yes | Backend only | Profile | User-provided |
| Photos / Videos | Yes | Storage provider | Profile / discover gate | Required for discover (≥3) |
| App activity | Yes (first-party) | No ads | Functionality / diagnostics | System |
| Financial info | Order/payment refs only | PSP/CK when enabled | Purchases | When user buys |
| Location | Fuzzy region only | Backend | Matching filters | Optional — **no precise GPS** |
| Device / IDs for ads | **No** | — | — | — |
| Crash logs (Sentry) | **No until DSN set** | — | — | Do not declare early |

## Security practices (Play checkboxes)

- [x] Data encrypted in transit  
- [ ] Users can request deletion — **Yes** (implement path live; SLA ops capacity Founder FAR-12)  
- [ ] Committed to Play Families / Designed for families — **No** (18+)  
- [ ] Independent review — leave unchecked until signed  

## Sensitive permissions

| Permission | Why |
|------------|-----|
| CAMERA / READ_MEDIA_IMAGES | Profile photos |
| INTERNET | API |

No SMS, contacts, or background location declared.

## Founder checklist

- [ ] Align Play Console Data Safety form 1:1 with this draft after counsel review  
- [ ] Confirm delete URL reachable from unauthenticated marketing surface  
- [ ] Do not claim push notifications until FCM live  
- [ ] Keep LIVE PSP off until FAR-09 cleared  
