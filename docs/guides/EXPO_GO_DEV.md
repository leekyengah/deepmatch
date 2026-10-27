# DeepMatch — Expo Go Development Guide

## Prerequisites

1. Node ≥ 20, npm workspaces at repo root.
2. Phone and PC on the **same Wi‑Fi** (prefer LAN over tunnel).
3. Install **Expo Go** from App Store / Play Store (SDK 57 compatible).
4. `apps/mobile/.env` with at least:
   - `EXPO_PUBLIC_API_URL` (default `https://datingvn.com` or staging)
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (anon only — never service role)

## Start

```bash
# from repo root
npm run dev:mobile
# or
npm run go -w @deepmatch/mobile
```

Scan the QR code in the terminal with Expo Go (Android) or Camera → Expo Go (iOS).

If LAN fails:

```bash
npm run dev:mobile:tunnel
```

## Web + Mobile together

```bash
npm run dev:all
```

If port **8081** is already taken, `dev:all` will **not** start a second Metro (avoids kill-all).

## VS Code / Cursor

Tasks → **DeepMatch: Expo Go (LAN)** (`.vscode/tasks.json`).  
Auto-run-on-folder-open is **not** enabled; start the task manually after consent.

## Fast Refresh

Edit files under `apps/mobile/` or watched packages (`shared`, `i18n`, `design-tokens`). Metro should hot-reload. After changing `metro.config.js` / `app.json`, restart Metro (`r` in terminal or re-run `dev:mobile`).

## Expo Go limits

- **IAP / Store** needs a Development Build (`react-native-iap` is autolink-excluded).
- Native Mapbox / custom native modules not in Expo Go → Dev Build.
- Do not expect full web feature parity; see `MOBILE_PARITY_MATRIX.md`.
