# FAR-03 — EAS Android preview APK

**Date:** 2026-10-27  
**Status:** **DONE**  
**Stance:** no store submit · GA NO-GO

## Artifact (build #5)

| Field | Value |
|-------|--------|
| Build ID | `fe0ad595-3bce-4624-b8c5-9b0fea50e56a` |
| Status | FINISHED |
| Profile | `preview` · Android APK · internal |
| Install / logs | https://expo.dev/accounts/kyengah/projects/deepmatch/builds/fe0ad595-3bce-4624-b8c5-9b0fea50e56a |
| APK | https://expo.dev/artifacts/eas/hYl74cZ7b20Gm7O-Be8wdHdNIzs2GNlmaiNnVo2T_qc.apk |
| App versionCode | 1 |

Env on build: EAS preview `EXPO_PUBLIC_SUPABASE_ANON_KEY` (publishable) + profile URL/API (staging datingvn / zzqpvjdyvjarpphqhaze).

## Failed attempts (root cause trail)

| # | Build | Result |
|---|-------|--------|
| 1–2 | local | blocked — missing `expo-dev-client` / profile `developmentClient` |
| 3 | `8594f390-…` | ERRORED — EAGER_BUNDLE `Cannot find module '@expo/json-file'` |
| 4 | `ed7a53ba-…` | ERRORED — same; nest **symlink** died after post-prebuild `npm install` pruned root `@expo/*` (whole-scope `@expo` junction aggravated prune) |
| 5 | `fe0ad595-…` | **FINISHED** |

## Fix that unblocked #5

- Stop linking whole `apps/mobile/node_modules/@expo` scope
- Direct deps: `@expo/json-file` on mobile + root `devDependencies`
- `link-mobile-expo-modules.mjs`: **copy** `@expo/json-file` under `expo/node_modules/@expo/` (survives prune); reinstall with `--ignore-scripts` if root missing
- `eas.json` preview: `developmentClient: false`; drop unused `channel`; `EXPO_NO_TELEMETRY=1`

## Next

- FAR-04 iOS preview — **Founder / Apple Developer** (certs, ASC)
- Optional: sideload APK smoke on device (Founder/QA) — not store
- FAR-01 merge still BLOCKED_EXTERNAL (Independent QA)
