# P2 — Identity, Personal, Pair (DM-021–029, 059–064)

## Implemented in scaffold

- Onboarding UI: age/ToS/mode (`/onboarding`)
- Personal dashboard shell (`/me` + link inventory)
- Couple shell + tabs (`/couple`)
- SQL: profiles, consent_events, pairs, invites, blocks, reports
- Chat/matching ACL unit coverage

## Remaining before Done (needs Supabase project)

- [ ] Wire Supabase Auth sessions (DM-022)
- [ ] Invite hash + accept transaction (DM-024/025)
- [ ] Live RLS integration tests (DM-026)
- [ ] Unpair lifecycle E2E (DM-027)
- [ ] DSAR export/delete (DM-028)
- [ ] Field visibility enforcement APIs (DM-060–062)

**Proposed status:** In progress (UI + schema); blocked on staging credentials (B5)
