# Evidence — Mobile App Store MVP scaffold 2026-10-12

## Decisions

- Native Expo (`apps/mobile`), not WebView shell.
- iOS Premium via Apple IAP; web bank transfer unchanged.

## Delivered

| Item | Path / URL |
|---|---|
| Expo app | `apps/mobile` — Expo Router tabs Discover / Matches / Chat / Me |
| EAS | `apps/mobile/eas.json` (preview → TestFlight, production) |
| Bundle ID | `com.datingvn.deepmatch` |
| Bearer auth for API | `apps/web/src/lib/supabase/route.ts` + wired v1 routes |
| Account deletion | `POST /api/v1/me/delete` + Me screen + `/account-deletion` |
| Legal pages | `/privacy`, `/terms` |
| Apple IAP verify | `POST /api/v1/payments/apple/verify` |
| Apple ASN V2 | `POST /api/v1/payments/apple/notifications` |
| Ops | `docs/ops/APP_STORE.md` |

## Gates still Founder-owned

- Apple Developer enrollment + App Store Connect product
- `eas login` + `eas init` + credentials → first TestFlight binary
- Screenshots / review demo account

## Verify (engineering) 2026-10-12

| Check | Result |
|---|---|
| `npm run typecheck -w @deepmatch/web` | PASS |
| `npm run typecheck -w @deepmatch/mobile` | PASS |
| `eas build --profile preview` | BLOCKED — needs Founder Expo/Apple login |

### TestFlight runbook (Founder)

1. `cd apps/mobile`
2. `npx eas login` → `npx eas init` (replace `REPLACE_AFTER_EAS_INIT` in `app.json`)
3. Fill `apps/mobile/.env` from `.env.example` (staging Supabase + API)
4. ASC: create app + IAP `premium_monthly`
5. `npx eas build --platform ios --profile preview`
6. ASC → TestFlight internal testing
7. Set Vercel `APPLE_BUNDLE_ID`, `APPLE_IAP_PRODUCT_ID`, enable `FF_BILLING` when charging
