# Android Preview APK — Pre-flight

**Date:** 2026-10-27  
**Branch:** `feat/w2-core-member-wp1-3`  
**HEAD (docs):** `a3e46cc`  
**Overall pre-flight:** **PASS**  
**GA / DONE_VERIFIED:** **NO** · no Play submit · no production changes  

## Checks

| Check | Result | Evidence |
|-------|--------|----------|
| expo-router resolve | **PASS** | `node_modules/expo-router/build/index.js` + mobile junction present |
| Expo Doctor | **PASS 20/20** | `docs/evidence/release-unblock-2026-10-27/expo-doctor-apk-handoff.log` |
| Mobile typecheck | **PASS** | `mobile-typecheck-apk-handoff.log` EXIT=0 |
| Unit tests (qa-core / adapters / deepmatch-qa) | **PASS** | `npm run test:unit` EXIT=0 |
| EAS preview env (names) | **PASS** | `EXPO_PUBLIC_API_URL`, `APP_ENV`, `IAP_PRODUCT_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` present — values not logged |
| eas.json preview | **PASS** | `distribution=internal`, `android.buildType=apk`, staging API + Supabase URL |
| Application ID | **PASS** | `com.datingvn.deepmatch` |
| PR #3 | OPEN · mergeStateStatus=BLOCKED | no auto-merge |

## Explicit non-claims

- No production Supabase / Vercel / LIVE PSP  
- No Google Play submit  
- No secret / keystore material in git or sheets  
