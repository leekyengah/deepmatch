# Evidence — Staging MVP usable journeys (2026-10-12)

## Definition of “usable” (not G7 production)

Two real users on staging can:

1. Sign up → onboarding (mode + discovery opt-in + region)  
2. Complete deep profile → appear in / get suggestions on Discover  
3. Like → mutual → open chat (`/chat?c=…`) with report/block  
4. Couple invite → accept → create pin/memory → timeline/wishlist → disconnect  

## Shipped this wave

| Journey | Wiring |
|---|---|
| Onboarding | discovery_opt_in + fuzzy_region; solo → discover |
| Discover | exclude prior likes/blocks; CTA to enable discovery |
| Deep profile | PATCH `/api/v1/me/profile` + match_preferences upsert |
| Likes → chat | `/chat?c={conversation_id}`; matches include `peer_id` |
| Chat safety | Report + Block via `/api/v1/reports` + `/api/v1/blocks` |
| Couple hub | Active pair + pin count |
| Add memory | POST pins (+ optional private journal) |
| Memories / promises | Live pin lists by layer |
| Disconnect | POST `/api/v1/couples/{id}/disconnect` |
| Invite accept | Redirect `/couple/map` |

## Verify

| Check | Result |
|---|---|
| `npm run typecheck -w @deepmatch/web` | PASS (2026-10-12) |
| `GET https://datingvn.com/api/v1/health` | ok, flags discovery/matching/chat true |
| Vercel prod deploy (monorepo root) | READY → aliased https://datingvn.com (`dpl_C1SHCbwcdyX6AbcbuRnzNKywNtZ7`) |
| `npm run test:e2e` (5 tests) | PASS (~13s) |

```bash
# Manual staging with 2 accounts:
# A+B: onboarding discovery on → deep profile → like each other → chat
# A+B: invite accept → add pin → memories → disconnect
npm run test:e2e
```

## Still not “complete product”

- Mapbox canvas SDK, media upload UI, concierge bookings, password recover  
- Admin ops beyond scaffold, DM-018 user testing, G7 production GO  
- Push notifications, album export, reminders  

## Flags required

`FF_DISCOVERY=true` `FF_MATCHING=true` `FF_CHAT=true`
