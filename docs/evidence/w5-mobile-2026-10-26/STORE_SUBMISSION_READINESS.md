# Store Submission Readiness

**Date:** 2026-10-27  
**RELEASE_CANDIDATE_READY:** **NO**  
**GA:** **NO-GO**  
**Android preview internal APK:** available (not a store binary)

## Mandatory blockers (Founder)

1. **Apple ASC App ID + distribution credentials** for iOS device / TestFlight (`FAR-13` / `FAR-04` device)  
2. **Privacy / Data Safety forms** — Legal/Founder sign-off (`FAR-05` / `FAR-06`)  
3. **Account deletion device proof** — iOS + Android screenshots/video  
4. **Crash reporting** — live Sentry DSN on preview/production profiles  
5. **Independent QA VERIFIED** — human (`FAR-08`); Cursor must not self-VERIFIED  
6. **No LIVE PSP** on store builds  
7. **Device smoke** of Android preview APK — eng package `READY_FOR_INDEPENDENT_DEVICE_QA` (see `final-release-preparation/ANDROID_DEVICE_QA_PACKAGE.md`); host still no adb  
8. **Play Console** listing + upload key policy before any Play Internal track  
9. **Independent QA signoff** before any `RELEASE_CANDIDATE_READY` claim  

## Present (engineering)

- EAS Android **preview** APK FINISHED (`fe0ad595`) + local handoff `artifacts/android-preview/`  
- EAS iOS **simulator** FINISHED (`72114bb8`) — not TestFlight  
- Expo Doctor 20/20 · mobile typecheck PASS · unit tests PASS  
- Staging public env names on EAS preview (anon present; not logged)  
- Store packs drafted under release-unblock evidence  

## Rule

Do **not** submit to TestFlight / Play until blockers clear and Founder written GO.  
Do **not** enable LIVE PSP.  
Do **not** set `RELEASE_CANDIDATE_READY = YES` without Independent QA + store forms.  
