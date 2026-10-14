# Evidence — Wave 5 without Founder tokens (2026-10-12)

## Shipped (engineering-only)

| Item | Detail |
|---|---|
| OSM couple map | Leaflet + OpenStreetMap (no Mapbox token) |
| Geocode | `GET /api/v1/geocode` Nominatim proxy + “Tìm tọa độ” |
| Feature flags | Web reads DB flags; Admin `/flags` toggle |
| Auth redirects | `supabase config push` — datingvn.com + `/auth/callback` |
| Auth restore | Email confirm ON, MFA TOTP ON (reverted accidental local defaults) |

## Verify

| Gate | Result |
|---|---|
| typecheck web/admin | PASS |
| `accept:staging` | 13/13 PASS |
| E2E Playwright | 8 PASS |
| DR soft-check | 4/5 (admin edge fetch fail từ máy local; deploy Vercel READY) |
| Web deploy | READY → datingvn.com |
| Admin deploy | READY → deepmatch-admin.vercel.app |

## Still Founder-only

- Optional Mapbox style token (OSM already usable)
- Sentry DSN
- Full DR/PITR (G5) + Safety/G7 signoff
- DM-018 live usability interviews
