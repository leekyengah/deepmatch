# DM-008 / ADR-01 / ADR-02 — Platforms & Stack (Proposed)

**Status:** Proposed — Founder countersign required for formal G0  
**Dependencies:** DM-001, DM-005

## Decision drivers

Cost/speed for greenfield, RLS-native multi-tenant pair isolation, realtime chat, private media signed URLs, VN localization, staging≠prod.

## Decision (Proposed)

| Layer | Choice | Rationale |
|---|---|---|
| Client user | Next.js 15 App Router (Web/PWA) | Fast MVP; SEO landing; one team |
| Client admin | Next.js admin app in monorepo `apps/admin` | Shared UI tokens; separate authz |
| API | Next.js Route Handlers + server actions (BFF) | Colocated; later extract if needed |
| Auth | Supabase Auth (email magic link + password) | Sessions, recovery |
| DB | Postgres via Supabase | RLS for pair/user scoping |
| Realtime | Supabase Realtime channels | Chat after mutual ACL check |
| Storage | Supabase Storage private buckets + signed URLs | Media ACL |
| Maps | Mapbox GL | Cost controls; manual pin if geo denied |
| Hosting | Vercel (web) + Supabase cloud | Staging + prod projects separated |
| Mobile native | Deferred post-beta | ADR-01 phase 2 |
| Flags | DB-backed feature_flags + env | Kill switches |

## Alternatives considered

- Expo-first: better mobile UX later; slower admin/web parity now.
- NestJS separate API: cleaner boundaries; higher ops cost for MVP.
- Firebase: weaker Postgres/RLS story for pair tenancy.

## Consequences

- Must invest in RLS tests (QA09, QA12).
- PWA offline chat limited; reconnect/idempotency required.
- Map/video costs need quotas (R08).

## Acceptance

- [x] ADR written with proposal
- [ ] Founder Tech signoff

**Proposed status:** In review
