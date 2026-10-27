# Android APK QA Report

**Date:** 2026-10-27  
**APK under test:** `artifacts/android-preview/deepmatch-preview-fe0ad595.apk`  
**Build ID:** `fe0ad595-3bce-4624-b8c5-9b0fea50e56a`  
**SHA-256:** `DCD2A0AE9212730162FB74E7A83FAA0520BDB96780193F05813A3BE2AD42B4C7`  

## Device / emulator

| Item | Result |
|------|--------|
| `adb` on PATH | **MISSING** |
| Android SDK emulator | **MISSING** (`NO_SDK_EMULATOR`) |
| Connected device | **NONE** |
| Device QA verdict | **`DEVICE_TEST_BLOCKED`** |

Do **not** claim login/onboarding/match/chat/device smoke PASS — no install session was possible on this host.

## Artifact static checks (PASS)

| Check | Result |
|-------|--------|
| File exists | PASS |
| Size > 0 | PASS (`98821026` bytes) |
| ZIP/APK magic `PK\x03\x04` | PASS |
| SHA-256 recorded | PASS |

## Automation / CI gates (host)

| Gate | Result |
|------|--------|
| Expo Doctor | PASS 20/20 |
| Mobile typecheck | PASS |
| Unit tests | PASS |
| Prior web/security QA packs | See release-unblock evidence (not re-run as device substitute) |

## Founder / QA next (device)

1. Install APK from local path or EAS build page (allow unknown sources / internal track).  
2. Use **staging** synthetic accounts only.  
3. Smoke: cold start, login/logout, age gate, onboarding, profile, discover, match/unmatch, chat, love map, media, error/retry.  
4. Append results to this file or Independent QA pack — Cursor will not self-VERIFIED.  
