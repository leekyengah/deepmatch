# 05 — iOS / Android Build Report

**RELEASE_CANDIDATE_READY:** **NO**  
**Expo Go ≠ RC** (explicit rule)

## Identifiers / config (repo)

| Item | Value / status |
|------|----------------|
| EAS profiles | `development`, `preview-simulator`, `preview`, `production` in `apps/mobile/eas.json` |
| Staging API | `EXPO_PUBLIC_API_URL=https://datingvn.com` |
| IAP product env | `premium_monthly` placeholder |
| ASC App ID | `REPLACE_ASC_APP_ID` — **BLOCKED_EXTERNAL** |
| Android keystore | EAS-managed planned; **not produced this session** |
| Sentry | DSN not installed |

## Builds executed this closure

| Platform | Profile | Result |
|----------|---------|--------|
| iOS | — | **NOT_RUN** · missing ASC/credentials |
| Android | preview APK | **NOT_RUN** · Founder must run on trusted machine |

## How Founder builds safely (no secrets in chat)

1. On trusted workstation with Expo account: `cd apps/mobile && npx eas build -p android --profile preview`  
2. Accept EAS-managed keystore in Expo UI.  
3. For iOS: create ASC app; upload API key/certs **via EAS UI only**.  
4. Never paste keys into Cursor chat / git / Master cells.

## Evidence

- `apps/mobile/eas.json`  
- `docs/evidence/w5-mobile-2026-10-26/*`  
- Founder checklist: `docs/evidence/w4-commercial-2026-10-26/FOUNDER_RELEASE_ACTION_CHECKLIST.md`
