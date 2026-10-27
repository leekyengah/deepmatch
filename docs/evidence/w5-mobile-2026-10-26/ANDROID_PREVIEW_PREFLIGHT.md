# Android Preview APK — Pre-flight + Build Report

**Date:** 2026-10-27  
**Expo app dir:** `apps/mobile` (`@deepmatch/mobile`)  
**Overall:** **PASS** — EAS Android preview APK **FINISHED**  
**GA / VERIFIED:** no · no Play submit · no production changes  

## Artifact

| Field | Value |
|-------|--------|
| Build ID | `fb7c5d4f-b7a3-4619-8e58-87a6c8146dd4` |
| Profile | `preview` (internal APK) |
| Status | **FINISHED** |
| Build page | https://expo.dev/accounts/kyengah/projects/deepmatch/builds/fb7c5d4f-b7a3-4619-8e58-87a6c8146dd4 |
| APK | https://expo.dev/artifacts/eas/cpa4WteXgvGAjyZbV5TNAGKiD2W12zDdtX47P3OO030.apk |
| Package | `com.datingvn.deepmatch` · version `1.0.0` |

## Verdict matrix

| Check | Result | Notes |
|-------|--------|-------|
| EAS preview env (public) | **PASS** | API URL, APP_ENV, IAP, SUPABASE_URL, SUPABASE_ANON_KEY (names only) |
| Android keystore | **PASS** | EAS-managed Default (cloud-generated on this machine) |
| Local `expo export` android | **PASS** | After repairing incomplete `react-native-screens` extract |
| EAS build | **PASS** | Build ID above |

## Fixes applied on this machine (for EAS)

1. Installed `eas-cli`; verified preview env already present.
2. Cloud-generated Android keystore (CLI `--non-interactive` cannot create first keystore).
3. Removed `expo-updates` from mobile preview path (runtime-version phase crash).
4. Softened `app.config.js` strict env throw (EAS early config eval).
5. Root `.npmrc` → `legacy-peer-deps=true`.
6. `link-mobile-expo-modules.mjs`: stop whole-scope `@expo` junction; copy `@expo/json-file` under `expo/node_modules` (EAGER_BUNDLE MODULE_NOT_FOUND).
7. `EXPO_NO_TELEMETRY=1` on preview profile; `eas-build-post-install` re-link.

## Explicit non-claims

- No Play Store / production submit  
- No DONE_VERIFIED / GA GO  
- No production DB or Vercel prod changes  
- Secret/anon values not logged here  
