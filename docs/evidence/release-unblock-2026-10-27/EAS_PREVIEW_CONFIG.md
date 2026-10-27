# EAS Preview Config — no privileged secrets

## Profiles

| Profile | Distribution | Notes |
|---------|--------------|-------|
| `preview` | internal | Android APK + iOS device |
| `preview-simulator` | internal | iOS simulator |
| `preview-store` | store | Staging env — still not GA submit |
| `production` | — | Prod API; no SUPABASE_* in repo |

## Public env in `eas.json` (preview*)

- `EXPO_PUBLIC_APP_ENV=staging`
- `EXPO_PUBLIC_API_URL=https://datingvn.com`
- `EXPO_PUBLIC_SUPABASE_URL=https://zzqpvjdyvjarpphqhaze.supabase.co`
- `EXPO_PUBLIC_IAP_PRODUCT_ID=premium_monthly`

## Must NOT be in git

| Key | Where |
|-----|-------|
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | EAS secret / dashboard env (FAR-02) |
| Service role / DB password | Never on mobile |
| Apple/Google signing secrets | EAS credentials |

## Founder commands

```bash
cd apps/mobile
npx eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<staging-anon>" --scope project
npx eas build -p android --profile preview
npx eas build -p ios --profile preview-simulator   # or preview for device
# DO NOT: eas submit / LIVE_PSP / productionDeploy
```
