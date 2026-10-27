# Store Submission Pack — engineering-complete (no external accounts)

**Date:** 2026-10-27 · **Status:** READY_FOR_FOUNDER_FILL · **Not submitted**

## Identifiers (code-complete)

| Field | Value | Gap |
|-------|-------|-----|
| App name | DeepMatch | — |
| iOS bundle | `com.datingvn.deepmatch` | ASC App ID = FAR-13 |
| Android package | `com.datingvn.deepmatch` | Play Console listing |
| version / buildNumber / versionCode | `1.0.0` / `1` / `1` | Auto-increment prod later |
| EAS project | `af381d32-4497-4ad7-bdf7-e75089def85b` | — |
| Staging API | `https://datingvn.com` | Prod URL in production profile |
| Privacy Policy URL | `https://datingvn.com/privacy` | Swap prod domain at submit |
| Support URL | `https://datingvn.com/support` | — |
| Account deletion | `https://datingvn.com/account-deletion` + in-app | Apple 5.1.1 / Play |
| Encryption export | `ITSAppUsesNonExemptEncryption: false` | — |
| Age | 18+ only | No child accounts |
| Category (suggested) | Lifestyle / Social Networking | Founder pick |
| IAP product id | `premium_monthly` | App Store Connect product |

## Assets checklist (in repo)

| Asset | Path | Status |
|-------|------|--------|
| Icon | `apps/mobile/assets/images/icon.png` | Present |
| Splash | `apps/mobile/assets/images/splash-icon.png` | Present |
| Adaptive Android | foreground/background/monochrome | Present |
| Favicon | `apps/mobile/assets/images/favicon.png` | Present |

**Still Founder:** screenshots (6.5"/5.5" iOS; phone/tablet Play), feature graphic, promo text localization.

## Forms

| Form | Draft | Submit |
|------|-------|--------|
| Apple App Privacy | `APPLE_APP_PRIVACY.md` | FAR-05 |
| Google Data Safety | `GOOGLE_PLAY_DATA_SAFETY.md` | FAR-06 |
| Reviewer notes | `REVIEWER_GUIDE.md` | FAR-07 accounts |

## EAS / secrets policy

- Preview `eas.json` embeds **public** URL only (`EXPO_PUBLIC_SUPABASE_URL`).  
- **Anon key** → EAS secret / project env (FAR-02) — never service role.  
- `app.config.js` fails EAS/CI build if public env missing.  
- `submit.production.ios.ascAppId` remains `REPLACE_ASC_APP_ID` until FAR-13.

## Review notes template (paste into ASC/Play)

```
DeepMatch staging demo for reviewers.
Base URL: https://datingvn.com
Demo accounts: see sealed note from Founder (FAR-07).
Payments: sandbox / bank-transfer instructions only — LIVE PSP disabled.
Maps: OSM editorial; no continuous GPS tracking.
AI: optional; revoke from Me → Privacy.
Account deletion: Me → Delete account /account-deletion.
```
