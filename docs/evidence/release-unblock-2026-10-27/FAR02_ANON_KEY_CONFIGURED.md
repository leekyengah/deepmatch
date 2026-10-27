# FAR-02 — EXPO_PUBLIC_SUPABASE_ANON_KEY configured

**Date:** 2026-10-27  
**Scope:** Android / EAS preview (staging)  
**Key type:** Supabase publishable (`sb_publishable_…`) — client-safe; **not** service role  

## Applied

| Target | Status |
|--------|--------|
| `apps/mobile/.env` (gitignored) | Updated |
| EAS env `preview` → `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Updated (sensitive) |
| EAS env `development` | Force-created/updated if needed |
| Git / Master Sheet | **Not** committed (no secret in repo) |

## Companion public config (already in `eas.json`)

- `EXPO_PUBLIC_SUPABASE_URL=https://zzqpvjdyvjarpphqhaze.supabase.co`
- `EXPO_PUBLIC_API_URL=https://datingvn.com`

## Next (FAR-03)

```bash
cd apps/mobile
npx eas build -p android --profile preview
```

Do not paste the key into chat/Master again; rotate in Supabase dashboard if leaked beyond Founder machines.
