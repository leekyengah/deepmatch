# DM-022 — Authentication & consent

**Status:** Implemented locally (awaiting Supabase Docker engine)

## Delivered

- Signup with age gate (`isAgeEligible`) + ToS/age consent events
- Login / logout
- Middleware session refresh (`@supabase/ssr`)
- Profile auto-create trigger on `auth.users`
- Onboarding mode selection (`solo` / `has_partner`)
- Personal dashboard loads profile from DB

## Routes

- `/signup` `/login` `/onboarding` `/me` `/logout` (action)

## Verify

1. `npx supabase start` (Docker Desktop running)
2. `node scripts/write-local-env.mjs`
3. `npm run dev:web`
4. Register under-18 → denied; 18+ → onboarding → `/me`
