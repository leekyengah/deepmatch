# Evidence — Media bucket + Concierge bookings (2026-10-12)

## Scope

- DM-032/033/034/037–039 (map list UX + media bucket)
- DM-041–044 / DM-085 (catalog + booking request + admin shell note)

## Changes

| Area | Detail |
|---|---|
| Migration | `supabase/migrations/20261012030000_media_bucket_concierge.sql` |
| APIs | `/api/v1/services/offerings`, `/api/v1/services/bookings`, pins DELETE |
| Flags | `ff_concierge=true` (shared default + health) |
| Deploy | Production alias https://datingvn.com READY |

## Verification

| Check | Result |
|---|---|
| `supabase db push` | PASS (media + admin_owner migrations applied) |
| `npm run typecheck -w @deepmatch/web` | PASS |
| `GET /api/v1/health` | `ff_concierge: true` |
| `npm run test:e2e` | 4 passed, 1 skipped |

## Not done

- Mapbox GL canvas (needs token)
- Advisor assignment workflow
- Video mime / size policies beyond 8MB images
- Production GO / G7
