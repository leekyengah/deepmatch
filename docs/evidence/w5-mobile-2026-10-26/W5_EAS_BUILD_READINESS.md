# W5 — EAS Build Readiness

**Date:** 2026-10-26  
**Commit:** `008ca3f` (+ working tree eas.json)  
**RELEASE_CANDIDATE_READY:** **NO** · **GA:** **NO-GO**  
**Store submit:** **NO**

## Application identifiers

| Platform | ID | Source |
|----------|-----|--------|
| iOS bundle | `com.datingvn.deepmatch` | `apps/mobile/app.json` |
| Android package | `com.datingvn.deepmatch` | `apps/mobile/app.json` |
| EAS project | `af381d32-4497-4ad7-bdf7-e75089def85b` | `extra.eas.projectId` |
| Expo account | `kyengah` (logged in) | `eas whoami` |
| Staging API | `https://datingvn.com` | preview profiles |
| Prod API (config) | `https://deepmatch-prod.vercel.app` | `production` profile (corrected) |

## EAS profiles (`eas.json`)

| Profile | Distribution | Notes |
|---------|--------------|-------|
| `development` | internal | Dev client + iOS simulator |
| `preview-simulator` | internal | iOS simulator |
| `preview` | **internal** + Android **APK** | Staging API; EAS-managed keystore intended |
| `preview-store` | store | For TestFlight/Play internal when signing ready |
| `production` | store | ASC App ID still `REPLACE_ASC_APP_ID` |

## Credentials missing (Founder — do not paste secrets in chat)

| Item | Status | Action |
|------|--------|--------|
| Apple Team / ASC App ID | **MISSING** | Create App in ASC; set `submit.production.ios.ascAppId` |
| Apple Distribution cert + provisioning | **MISSING** | Upload via `eas credentials` (Founder machine) or ASC API key in EAS secrets |
| Apple ASC API key | **MISSING** | EAS Secret for non-interactive iOS |
| Play Console app | **UNKNOWN** | Create app matching `com.datingvn.deepmatch` |
| Play upload keystore | **UNKNOWN** | Prefer **EAS-managed** on first `eas build -p android --profile preview` |
| Google service account JSON | **MISSING** | Needed for Play submit only |
| Sentry DSN | **MISSING** | Mobile + web |
| `node_modules` on agent host | often incomplete | Run `npm install` in `apps/mobile` before local EAS |

## Android preview APK

**Allowed & prepared in config** (`preview` → `buildType: apk`, `distribution: internal`).  
**Not executed this session:** EAS credentials CLI hung / needs interactive consent on first keystore create.  

Founder/CI command (no keys in chat):

```bash
cd apps/mobile
npx eas build -p android --profile preview
```

First run: accept EAS-managed keystore prompt on Founder device.

## iOS / TestFlight

Blocked until ASC App ID + distribution credentials. Use `preview-store` or `production` after secrets. No store submit without written GO.

## Metadata / privacy / reviewer demo

| Item | Status |
|------|--------|
| Legal URLs | Present on staging (`/legal/*`) |
| Privacy nutrition labels | **Founder/Legal** |
| Demo reviewer account | Use synthetic QA emails from seed (rotate password via Founder; **never paste in chat**) |
| Screenshots pack | Incomplete |

## Binary produced

**None this wave.**
