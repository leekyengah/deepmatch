# Android Device QA Package — READY_FOR_INDEPENDENT_DEVICE_QA

**Status:** `READY_FOR_INDEPENDENT_DEVICE_QA`  
**Date:** 2026-10-27  
**Host eng:** no adb/SDK → device install **not** executed here (do not claim device PASS)

## Artifact under test

| Field | Value |
|-------|--------|
| EAS Build ID | `fe0ad595-3bce-4624-b8c5-9b0fea50e56a` |
| Profile | `preview` · internal APK |
| Package | `com.datingvn.deepmatch` |
| version / versionCode | `1.0.0` / `1` |
| Local path | `artifacts/android-preview/deepmatch-preview-fe0ad595.apk` |
| SHA-256 | `DCD2A0AE9212730162FB74E7A83FAA0520BDB96780193F05813A3BE2AD42B4C7` |
| Bytes | `98821026` |
| Official URL | https://expo.dev/artifacts/eas/hYl74cZ7b20Gm7O-Be8wdHdNIzs2GNlmaiNnVo2T_qc.apk |
| Build page | https://expo.dev/accounts/kyengah/projects/deepmatch/builds/fe0ad595-3bce-4624-b8c5-9b0fea50e56a |
| Staging API | `https://datingvn.com` |
| Supabase | project `zzqpvjdyvjarpphqhaze` (anon via EAS preview env — not logged) |
| Signing | EAS-managed Android keystore (APK Signing Block / v2+; classic JAR META-INF RSA may be absent) |

**SHA verified on handoff host:** matches MANIFEST.txt.

## Install (Founder / Independent QA device)

```text
1. Enable install from unknown sources / internal distribution.
2. Copy APK or open EAS build page → Install.
3. Confirm package com.datingvn.deepmatch.
4. Use ONLY synthetic staging accounts (credentials via secure channel — FAR-07).
5. Never use production passwords or LIVE PSP.
```

## Device checklist (fill on device)

| # | Journey | Pass? | Notes / screenshot ID |
|---|---------|-------|------------------------|
| 1 | Cold launch — no crash | ☐ | |
| 2 | Login / logout | ☐ | post-login should land on tabs (`d98cb1c`) |
| 3 | Email verification surface | ☐ | |
| 4 | Age gate 18+ | ☐ | |
| 5 | Onboarding | ☐ | |
| 6 | Profile edit | ☐ | |
| 7 | Discover filters | ☐ | |
| 8 | Match / Unmatch | ☐ | |
| 9 | Chat send/receive | ☐ | |
| 10 | AI Concierge (consent) | ☐ | |
| 11 | Love Map / places | ☐ | |
| 12 | Couple media upload | ☐ | |
| 13 | Booking sandbox | ☐ | no live charge |
| 14 | Privacy / account deletion entry | ☐ | Me → Delete |
| 15 | Error / retry / offline | ☐ | |

## Automation already done (not a device substitute)

| Gate | Result | Evidence |
|------|--------|----------|
| Expo Doctor | 20/20 | prior handoff |
| Mobile typecheck | PASS | + after `d98cb1c` |
| Accept staging | 13/13 | `accept-staging.log` |
| Security (no-leak + A-001) | 2/2 PASS | `qa-2026-10-27T06-45-51-005Z-d64bc81b` |
| Playwright smoke | 5/5 | `playwright-smoke.log` |
| Critical-path API | PASS | `critical-path-smoke.log` |

## Signoff (Independent QA)

| Field | Value |
|-------|-------|
| Reviewer | |
| Device model / OS | |
| APK SHA-256 confirmed | ☐ |
| Checklist result | ☐ PASS ☐ FAIL |
| P0 defects opened | |
| Recommend Founder UAT | ☐ Yes ☐ No |
| Signature / date | |

**Forbidden:** Cursor self-VERIFIED · Play submit · LIVE PSP  
