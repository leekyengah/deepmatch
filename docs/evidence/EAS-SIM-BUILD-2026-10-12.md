# Evidence — EAS iOS simulator build queued 2026-10-12

## Automatic run

| Item | Value |
|---|---|
| Account | `kyengah` |
| Project | `@kyengah/deepmatch` |
| Profile | `preview-simulator` (no Apple Distribution Cert required) |
| Build | https://expo.dev/accounts/kyengah/projects/deepmatch/builds/6997698e-88e2-4f80-89ae-77c0b5dd1c92 |
| Env | EAS preview secrets + datingvn.com API |

## Still needs Founder (TestFlight / App Store)

Store profile `preview` requires interactive Apple credentials once:

```powershell
cd apps/mobile
npx eas-cli build --platform ios --profile preview
```
