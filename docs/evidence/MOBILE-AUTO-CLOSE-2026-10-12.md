# Evidence — Mobile auto-close attempt 2026-10-12

## Done automatically

| Item | Result |
|---|---|
| Deploy staging web | https://datingvn.com — privacy/terms/account-deletion **200** |
| Deploy prod web | https://deepmatch-prod.vercel.app — privacy **200**, `productionDeploy=true` |
| `APPLE_BUNDLE_ID` / `APPLE_IAP_PRODUCT_ID` | Set on Vercel `deepmatch` + `deepmatch-prod` |
| `FF_BILLING=true` | Staging + prod health flags |
| `apps/mobile/.env` | Staging Supabase JWT anon (208) + API datingvn.com |
| Typecheck | web + mobile PASS (prior) |
| TestFlight script | `scripts/eas-testflight.ps1` |

## EAS follow-up (same day)

| Item | Result |
|---|---|
| `eas whoami` | `kyengah` / `leekyengah@gmail.com` |
| Expo project | https://expo.dev/accounts/kyengah/projects/deepmatch |
| `projectId` | `af381d32-4497-4ad7-bdf7-e75089def85b` |
| `eas build -p ios --profile preview --non-interactive` | **FAIL** — Apple Distribution Certificate not set up |

## Hard-blocked (Founder — 1 interactive step)

Apple credentials must be created once in interactive mode (Apple ID / ASC API key):

```powershell
cd apps/mobile
npx eas-cli build --platform ios --profile preview
# follow prompts to generate Distribution Certificate + Provisioning Profile
```

Then TestFlight appears in App Store Connect after the cloud build finishes.

Also create ASC app + IAP `premium_monthly` if missing.

Ops: `docs/ops/APP_STORE.md` · script: `scripts/eas-testflight.ps1`
