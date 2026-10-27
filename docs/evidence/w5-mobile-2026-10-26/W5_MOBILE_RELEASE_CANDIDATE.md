# W5 — Mobile & Store Release Candidate

**Date:** 2026-10-27  
**Wave status:** `ENGINEERING_BINARY_PARTIAL`  
**RELEASE_CANDIDATE_READY:** **NO**  
**GA:** **NO-GO**  
**Android preview APK:** **YES** (`ANDROID_PREVIEW_BUILD_COMPLETED`)  
**Device QA:** **`READY_FOR_INDEPENDENT_DEVICE_QA`** (package ready; eng host still no adb)

## Checklist

| Item | Status | Notes |
|------|--------|-------|
| Mobile Unmatch UI | IMPLEMENTED | likes.tsx confirm + API |
| Discover filters Web–Mobile | PARITY (code) | device QA pending |
| Onboarding / email / age / profile / match / chat / couple | PARTIAL | screens exist; device matrix blocked on this host |
| Loading / empty / error / retry | PARTIAL | code-level; device pending |
| Navigation / permissions | PARTIAL | Expo Router; deep-link matrix pending |
| EAS Android preview APK | **DONE** | Build `fe0ad595` · handoff under `artifacts/android-preview/` |
| EAS iOS simulator | **DONE** | Build `72114bb8` · device/TestFlight still OPEN |
| iOS device / TestFlight | BLOCKED_EXTERNAL | Apple Dev + ASC App ID (`FAR-13`) |
| Play Internal / store | HOLD | no submit · FAR-06 draft only |
| Crash reporting | BLOCKED_EXTERNAL | Sentry DSN empty |
| Independent QA | OPEN | FAR-08 |

## Binary

| Platform | Artifact |
|----------|----------|
| Android preview APK | Local `artifacts/android-preview/deepmatch-preview-fe0ad595.apk` + EAS URL in `ANDROID_PREVIEW_BUILD_REPORT.md` |
| iOS simulator | EAS `72114bb8` `.tar.gz` (not TestFlight) |

## Founder remaining (blocked)

1. Device smoke install of Android APK (or Independent QA)  
2. ASC App ID + Apple creds for iOS device / TestFlight  
3. Privacy / Data Safety counsel sign (`FAR-05` / `FAR-06`)  
4. Independent QA signoff (`FAR-08`) then PR #3 merge (`FAR-01`) — never auto-merge  
5. Do **not** enable LIVE PSP · do **not** Play/App Store submit until GO  
