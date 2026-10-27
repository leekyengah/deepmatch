# Android Preview APK — Pre-flight Report

**Date:** 2026-10-27  
**Time (UTC+7):** ~04:10–11:15 repair window; gates rechecked after  
**Baseline repair commit (pending push):** working tree on branch `feat/w2-core-member-wp1-3`  
**Parent SHA:** `6449e06`  
**Expo app dir:** `apps/mobile` (`@deepmatch/mobile`)  
**Overall:** **BLOCKED** (local eng gates **PASS**; EAS cloud Supabase env **not verified**)  
**GA / VERIFIED:** no · no production changes · no APK claimed

## Verdict matrix

| Check | Result | Notes |
|-------|--------|-------|
| Expo mobile directory | **PASS** | `apps/mobile` |
| Identifiers / version / EAS project | **PASS** | `com.datingvn.deepmatch` · `1.0.0` · projectId `af381d32-4497-4ad7-bdf7-e75089def85b` |
| Root cause of missing `expo-router/build/index.js` | **RESOLVED** | Corrupt/incomplete install + workspace hoist: Expo plugins resolve only under `apps/mobile/node_modules` |
| Clean repair | **PASS** | Kept lockfile; `postinstall` → `scripts/link-mobile-expo-modules.mjs` (junctions). Used `--legacy-peer-deps` for React 19.2 (Expo) vs 19.3 (web override) peer conflict — risk: silent peer mismatches; mitigated by single RN tree + doctor install.exclude for react |
| `npx expo-doctor` | **PASS** | **20/20** checks passed |
| `npm run typecheck` (-w mobile) | **PASS** | exit 0 |
| Mobile-related unit tests | **PASS** | `@deepmatch/shared` 37/37 (commerce/shared gates) |
| Profile `preview` APK + internal | **PASS** | `distribution: internal`, `android.buildType: apk` |
| Staging API URL | **PASS** | `EXPO_PUBLIC_API_URL=https://datingvn.com` in preview env |
| Live staging health | **PASS** | datingvn.com health `env=staging`, `productionDeploy:false` (prior probe) |
| No service-role in mobile | **PASS** | anon/`EXPO_PUBLIC_*` only; `app.config.js` fails EAS/CI if public env missing |
| Icons / splash | **PASS** | assets tracked |
| Local `.env` key **names** present | **PASS** | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, API URL, APP_ENV (values not logged) |
| EAS project env / secrets for preview | **BLOCKED** | Cloud list via CLI failed/empty earlier; **Founder must confirm** Dashboard env before build |
| Interactive credentials | **N/A** | Not run |

## Root cause (A)

1. **Hoisting:** npm workspaces hoisted `expo-router` to repo root; Expo config-plugin resolver looks relative to `apps/mobile` → plugin resolve FAIL.  
2. **Corrupt package:** agent host previously had `expo-router` without `build/index.js` (incomplete extract).  
3. **React dual-version:** root override `react@19.3.0` (web) vs Expo SDK expect `19.2.3` → peer noise; doctor install.exclude + no nested mobile react copy.

## Fixes applied

- `scripts/link-mobile-expo-modules.mjs` + root `postinstall` / `link:mobile-expo`  
- SDK package bumps (`expo ~57.0.31`, `expo-router ~57.0.29`, `expo-secure-store ~57.0.4`, `gesture-handler ~2.32.0`, …)  
- Removed project-local `eas-cli` dep (use `npx eas-cli`)  
- `app.config.js` merges static `app.json` + strict public-env check on `EAS_BUILD`/`CI`  
- Doctor: disable duplicate-react monorepo false-positive; `expo.install.exclude` for react/react-dom  

## Remaining before Founder EAS Build

1. **Expo Dashboard → Project `deepmatch` → Environment variables** (preview / production as needed), create **non-secret or secret** vars (values from staging Supabase dashboard — **do not paste in chat**):
   - `EXPO_PUBLIC_SUPABASE_URL` = staging project URL (`zzqpvjdyvjarpphqhaze`)  
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = **anon/publishable only**  
   - Confirm `EXPO_PUBLIC_API_URL=https://datingvn.com` (also in `eas.json` preview)  
2. On trusted machine after pull + `npm install --legacy-peer-deps`:
   ```bash
   cd apps/mobile
   npx expo-doctor
   npm run typecheck
   npx eas-cli build -p android --profile preview
   ```
3. First build: accept **EAS-managed Android keystore** when prompted.  
4. **Do not** production profile / Play submit.

## When overall becomes PASS

Local gates already PASS. Flip overall to **PASS** only after Founder confirms the two Supabase public vars exist on EAS for the build environment (screenshot of **names only** or `eas env:list` success).

## Explicit non-claims

- No APK / build ID produced this repair  
- No DONE_VERIFIED / independent VERIFIED  
- No production DB or Vercel prod changes  
