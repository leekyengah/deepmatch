# UX State Contract — DM-110 / EXT-086 (2026-10-13)

Server-authoritative home/member states (source: `apps/web/src/lib/home-state.ts`).

| State | Condition | Primary redirect | Member surfaces |
|-------|-----------|------------------|-----------------|
| guest | no session | `/` | public marketing |
| onboarding | missing display_name or birth_date | `/onboarding` | onboarding |
| dating | onboarded, no mutual, no couple | `/discover` | discover/likes |
| matched | mutual_matches > 0, no active couple | `/chat` | chat |
| couple | active pair | `/couple` | couple/* |
| suspended | profiles.suspended | `/me/account` | account only |

## Projection rules
- Never trust client role claims for routing.
- Lifestyle/AI surfaces gated by `ff_lifestyle` / `ff_ai` (OFF → redirect `/me`, API 403).
- Concierge gated by `ff_concierge`.
- Staff admin URL only rendered as discrete link on `/me` when `admin_roles` or owner allowlist — never in member SSR nav for non-staff.
- Block/disconnect: enforced by RLS + API; UI must not invent counts.

## Negative checks (staging)
- Guest → `/me` → login redirect
- `/lifestyle`, `/ai` → `/me` when flags off
- Cross-user booking/catalog denial via RLS
