# Sentry + EAS prep (no secrets) — 2026-10-26

## Already in repo (no Founder secret required)

### Sentry
- Dependency: `@sentry/nextjs` in `apps/web/package.json`
- Bootstrap: `apps/web/src/lib/sentry.ts` — no-op when DSN empty / `APP_ENV=local`
- Env names expected:
  - `NEXT_PUBLIC_SENTRY_DSN` (browser)
  - `SENTRY_DSN` (server/edge)
- Optional later: `sentry.client.config.ts` / `sentry.server.config.ts` via wizard (not run — needs org auth)

### EAS / Store
- `apps/mobile/eas.json` profiles: `development`, `preview-simulator`, `preview`, `production`
- Staging API URL wired: `EXPO_PUBLIC_API_URL=https://datingvn.com`
- Placeholder: `submit.production.ios.ascAppId = "REPLACE_ASC_APP_ID"`

## Founder steps (required to go live)

### Sentry (decision 2B)
1. Create project at https://sentry.io (org DeepMatch / datingvn) · platform Next.js  
2. Copy DSN  
3. Vercel project `tradingbase/deepmatch` → Environment **Production** (serves datingvn.com staging):  
   - `SENTRY_DSN=<dsn>`  
   - `NEXT_PUBLIC_SENTRY_DSN=<dsn>`  
4. Optional: same on `deepmatch-prod` when GA  
5. Uptime: monitor `GET https://datingvn.com/api/health` every 1–5 min → alert Slack/email  
6. Synthetic fail: temporarily break a canary route or use Sentry “Send test event”  
7. AC: alert received within 5 min · evidence screenshot in `docs/evidence/`

### EAS / ASC / Play (decision 5A)
1. Apple Developer + App Store Connect app → numeric App ID  
2. Replace `REPLACE_ASC_APP_ID` in `eas.json`  
3. `eas secret:create` for Apple/Google credentials (never commit)  
4. `eas build --profile preview --platform ios` → TestFlight  
5. Play Console internal track + `eas build --profile preview --platform android`  
6. AC: installable binary on 1 device · store listing draft

## Not done here
- No DSN written to Vercel (no Sentry login on agent machine)  
- No EAS build (no ASC credentials)  
- No LIVE PSP
