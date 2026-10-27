# iOS / TestFlight Readiness

**Date:** 2026-10-27  
**GA / store submit:** **NO**  

## Code / config audit

| Item | Status |
|------|--------|
| Bundle ID | `com.datingvn.deepmatch` |
| buildNumber | `1` |
| Display name | DeepMatch |
| Privacy manifest | Present in `app.json` / config |
| Usage strings | Camera / Photos (VN) |
| EAS preview-simulator | **FINISHED** `72114bb8-a637-4170-a413-11963a839b94` |
| Artifact | `.tar.gz` simulator app (not device / not TestFlight) |
| `eas.json` submit.production.ios.ascAppId | `REPLACE_ASC_APP_ID` |
| Push / Sentry mobile | Not configured (BLOCKED_EXTERNAL for crash RC) |

## Credentials

| Check | Result |
|-------|--------|
| `eas credentials -p ios` | Interactive / not fully auditable non-interactively on this host |
| ASC App ID | **MISSING** → FAR-13 |
| Device distribution build | **BLOCKED_EXTERNAL** (Apple membership + certs + ASC) |
| TestFlight upload | **HOLD** — needs Founder approval + FAR-10 |

## What eng completed

- Simulator preview build available for Mac Simulator smoke.
- Store pack drafts point at privacy/support/deletion URLs on staging domain.

## Founder actions (exact)

1. Confirm Apple Developer membership active.  
2. Create ASC app; set `ascAppId` in `eas.json` (FAR-13).  
3. Ensure distribution cert + provisioning on EAS.  
4. `eas build -p ios --profile preview` (device) — Founder/approved eng.  
5. TestFlight upload only after explicit Founder GO (not App Store public).  
