# DM-010 — Full PRD (5 subsystems) + Acceptance

**Status:** In review  
**Dependencies:** DM-005, DM-006, DM-007, DM-008

## 1. Personal (DM-059–064)

- Dashboard: avatar, completion, mode, notifications shortcuts.
- Edit: display name, bio, fuzzy region, optional job; visibility per field.
- Deep profile: goals, values, communication, interests, expectations, dealbreakers (self-declared, no diagnosis labels).
- Privacy: hide from discovery, export/delete, block list, location off.
- Sessions: revoke devices; re-auth for sensitive actions.
- History: active matches, invites, pair status; hide blocked identities.

## 2. Matching (DM-065–072, 055)

- Opt-in discovery only; adult confirmation.
- Hard filters then explainable ranking; versioned rule config.
- Like/pass idempotent; mutual unlocks chat only.
- Exclusions: blocked, reported, declined, ineligible.
- Rate limits; no user enumeration.
- Date proposals: both confirm; no live inferred location.

## 3. Chat (DM-073–078, 056)

- Conversation ACL: mutual participants only.
- Realtime send/retry/dedupe/pagination; offline reconnect.
- Attachments: size/type caps; signed URLs; no guessable public links.
- Mute/block/report; admin evidence scoped.
- Notifications: no sensitive preview by default.
- Transition to pair via explicit dual accept; no chat/journal auto-share.

## 4. Couples map (DM-024–040)

- Invite single-use, expiry, revoke, anti-enumeration.
- Tabs: Bản đồ / Kỷ niệm / Thêm mới / Hẹn ước / Hai đứa.
- Pins layers: Đã cùng đến / Muốn cùng đến / Dấu mốc.
- Media private; individual perspectives default private.
- Unpair/re-pair per DM-006.

## 5. Concierge (DM-041–047)

- Service catalog, booking, assignment.
- Advisor ACL to assigned cases; granular consent for private views.
- No diagnosis AI.

## 6. Admin (DM-079–088)

- Roles: owner, admin, moderator, advisor, support.
- Users, profile/photo queue, matching ops, chat safety, services, CMS, analytics, flags.
- Kill switches tested without data loss.
- Aggregates without PII leakage.

## Positive acceptance cases

- Full journey QA16 path succeeds on staging.
- Explainability strings match rule version.

## Abuse / negative cases (must pass)

QA01–QA14, QA16–QA17 from Master QA Matrix.

## ERD / API inventory

See `docs/p1/DM-013-erd.md`, `docs/p1/DM-020-api-contracts.md`, screen inventory `docs/p1/DM-015-sitemap.md`.

## Staged execution

Feature flags: `ff_matching`, `ff_chat`, `ff_media_upload`, `ff_concierge`, `ff_discovery`.

## Acceptance

- [x] PRD covers 5 subsystems + positive/negative
- [ ] Founder PRD v2 approval (G0 Hard)

**Proposed status:** In review
