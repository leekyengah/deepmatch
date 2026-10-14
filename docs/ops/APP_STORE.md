# DeepMatch — App Store / TestFlight

## App identity

| Field | Value |
|---|---|
| Display name | DeepMatch |
| Bundle ID | `com.datingvn.deepmatch` |
| Workspace | `apps/mobile` (Expo SDK 57 + Expo Router) |
| API (staging) | `https://datingvn.com` |
| API (prod) | `https://deepmatch-prod.vercel.app` |
| IAP product | `premium_monthly` (auto-renewable) |
| Privacy | https://datingvn.com/privacy |
| Terms | https://datingvn.com/terms |
| Account deletion | https://datingvn.com/account-deletion + in-app Me → Xóa tài khoản |

## Architecture

Native Expo client → Supabase Auth (SecureStore) + Bearer JWT → Next.js `/api/v1/*` → Supabase RLS.  
iOS Premium: StoreKit via `react-native-iap` → `POST /api/v1/payments/apple/verify`.  
ASN V2: `POST /api/v1/payments/apple/notifications`.

## Founder checklist (required before submit)

1. Enroll **Apple Developer Program** ($99/yr).
2. App Store Connect → create app `com.datingvn.deepmatch`.
3. Agreements, tax, banking complete.
4. Create subscription group + product `premium_monthly` (align ~99.000₫ tier).
5. Configure ASN V2 URL:  
   `https://deepmatch-prod.vercel.app/api/v1/payments/apple/notifications`  
   (staging: `https://datingvn.com/api/v1/payments/apple/notifications`).
6. Vercel env (web staging + prod):
   - `APPLE_BUNDLE_ID=com.datingvn.deepmatch`
   - `APPLE_IAP_PRODUCT_ID=premium_monthly`
   - `FF_BILLING=true` when ready to charge
7. Mobile EAS secrets / `apps/mobile/.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_API_URL`
8. Screenshots 6.7" + 6.1", 1024 icon, age rating **17+** (Dating).
9. App Privacy nutrition labels (contact info, user content, identifiers).
10. Review demo account (email/password) in ASC notes.

## EAS commands

```powershell
cd apps/mobile
npx eas login
npx eas init   # writes real projectId into app.json extra.eas.projectId
npx eas build --platform ios --profile preview
# After build: distribute to TestFlight in ASC
npx eas submit --platform ios --profile production
```

Profiles: `eas.json` → `development` | `preview` | `production`.

## Local dev

```powershell
# from repo root
cp apps/mobile/.env.example apps/mobile/.env   # fill keys
npm run dev:mobile
```

Expo Go: auth + API work; **real IAP requires EAS/dev client**.

## MVP scope (this ship)

Discover, Matches, Chat, Me, account deletion, Apple IAP.  
Not in MVP: Couple map, Concierge, Admin, bank-transfer UI on iOS.
