# FAR-11 — Mint RLS test JWTs (QA Ops / trusted machine)

**Never commit JWTs.** Output file `.ai/rls-test.env.ps1` is gitignored.

## Steps

```powershell
cd "<repo-root>"
. .\.ai\qa.env.ps1
node --env-file=.env.local scripts/mint-rls-test-jwts.mjs
. .\.ai\rls-test.env.ps1
npm run qa:deepmatch -- --suite security --env dm-staging
```

Expect: `DM-QA-P0-004` PASS · `DM-QA-A-001` **PASS** (not SKIPPED).

## Requirements

| Env | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | `.env.local` (anon only) |
| `QA_EMAIL_A` / `QA_EMAIL_B` / `QA_PASSWORD` | `.ai/qa.env.ps1` |
| Optional `RLS_TEST_PRIVATE_NOTE_ID_A` | Existing note owned by A; else script inserts one |

## Security rules

- Use staging only · no service-role in this script  
- Rotate by re-running mint (access tokens expire)  
- Do not paste tokens into Master Sheet / chat / PR  
