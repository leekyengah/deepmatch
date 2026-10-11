# DM-001 — ADR Open Questions (for Founder)

| ADR | Decision | Proposed default (plan) | Status |
|---|---|---|---|
| ADR-01 | Platforms / rollout order | Web/PWA first; native later | Proposed |
| ADR-02 | FE/BE/DB/auth/realtime/hosting | Next.js App Router + Supabase (Auth/DB/RLS/Realtime/Storage) + Mapbox | Proposed |
| ADR-03 | Shared memories after breakup | Each may export own contributions; shared media requires mutual export window then revoke; no transfer to new pair | Blocking — needs Founder |
| ADR-04 | Profile visibility, age, location precision | 18+; fuzzy region only; field-level visibility | Blocking — needs Founder |
| ADR-05 | Match scoring signals/weights | Hard filters first; weighted self-declared interests/values/goals; cold-start boost diversity | Open |
| ADR-06 | Chat transport/retention/evidence | Supabase Realtime; retention policy TBD; admin evidence break-glass only | Blocking |
| ADR-07 | Admin moderation powers | Roles: owner/admin/moderator/advisor/support; no default chat browse | Blocking |
| ADR-08 | Map/media providers & video limits | Mapbox; image/video size caps; cost quotas | Open |
| ADR-09 | Subscriptions/payments | Deferred P6 | Deferred |

**Engineering provisional GO:** Plan approval uses ADR-01/02 defaults for local/staging scaffold only.  
**Formal G0:** Founder must countersign `docs/p0/G0-SIGNOFF.md` before claiming Gate G0 = GO on Master Sheet.  
**Production:** Never without Founder + Safety GO (DM-058 / G6).
