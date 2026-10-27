# Mobile Build Prep — without production credentials

**Date:** 2026-10-26  
**Overall:** CONFIG improved · **Founder build still BLOCKED** on secrets + doctor host

## Completed this sprint (no secrets committed)

| Item | Change |
|------|--------|
| `eas.json` preview / preview-simulator / preview-store | Added `EXPO_PUBLIC_SUPABASE_URL` (public staging project URL) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **Not** in repo — FAR-02 EAS secret |
| `app.json` iOS | Privacy Manifest API reasons; photo add usage string |
| `app.json` Android | `versionCode: 1`; CAMERA / READ_MEDIA_IMAGES / INTERNET |
| `package.json` scripts | `eas:preview:android`, `eas:preview:ios-sim`, `doctor`, `preflight:preview` |

## Still Founder-only

1. Clean install + `npx expo-doctor` + `npm run typecheck` on trusted machine (agent host had incomplete `expo-router`).  
2. `eas secret:create` for anon key.  
3. `npx eas build -p android --profile preview` (accept EAS keystore).  
4. iOS: Apple Developer + ASC app + certs; `preview` or `preview-simulator`.  
5. **Do not** `eas submit` / production profile for GA.

## Identifiers

| Field | Value |
|-------|-------|
| iOS bundle | `com.datingvn.deepmatch` |
| Android package | `com.datingvn.deepmatch` |
| EAS projectId | `af381d32-4497-4ad7-bdf7-e75089def85b` |
| Staging API | `https://datingvn.com` |
