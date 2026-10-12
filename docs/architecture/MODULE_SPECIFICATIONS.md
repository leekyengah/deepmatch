# DeepMatch — Module Specifications

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Owner | Engineering |
| Updated | 2026-10-11 |
| Related | `SYSTEM_ARCHITECTURE.md`, Master M01–M16 |

## Business invariants (must hold in code)

1. Mutual match ≠ couple space (`mutualCreatesPairSpace() === false`).
2. Couple space requires invite + accept; each relationship has independent `pairs.id`.
3. Disconnect revokes shared access immediately (`pairs.status = unpaired`).
4. Private journals/notes default PRIVATE (`shared_with_partner = false`).
5. Block excludes discovery, messaging, new interactions.
6. Admin access is case-scoped; no default browse of chat/journals.

## State machines

### Dating connection

`DISCOVERABLE → LIKED → MUTUAL_MATCH → CHAT_ENABLED → CLOSED|BLOCKED`

Repo mapping: `profiles.discovery_opt_in`, `likes`, `mutual_matches`, `conversations`/`messages`, `blocks`.

### Couple space

`INVITED → ACCEPTED → ACTIVE → DISCONNECTED → ARCHIVED`

Repo mapping: `pair_invites.status`, `pairs.status` (`active`/`unpaired`).

## Module contracts (summary)

| ID | API surface (target `/api/v1`) | Schema | Events | Owner |
|---|---|---|---|---|
| M01 | Auth via Supabase; consents | `profiles`, `consent_events` | `user.registered` | Identity |
| M02 | `GET/PATCH /me/profile` | `profiles`, `profile_deep` | `profile.updated` | Profile |
| M03 | `GET /discovery/candidates` | prefs + blocks | `discovery.served` | Discovery |
| M04 | `POST /matching/rank` | rule versions | `match.ranked` | Matching |
| M05 | `POST /likes` | `likes`, `mutual_matches` | `like.created`, `match.mutual` | Interaction |
| M06 | `GET/POST .../messages` | `conversations`, `messages` | `message.sent` | Messaging |
| M07 | invites/accept/disconnect | `pair_invites`, `pairs` | `pair.formed`, `pair.ended` | Couple |
| M08 | pins CRUD | `pins`, `media_objects` | `pin.created` | Memories |
| M09 | journals | `private_notes` | `note.created` | Journals |
| M10 | wishlist pins | `pins.layer=wishlist` | — | Wishlists |
| M11 | bookings | `service_*` | `booking.*` | Concierge |
| M12 | payments webhooks | TBD | `payment.*` | Billing |
| M13 | reports/blocks | `reports`, `blocks` | `report.opened` | Trust |
| M14 | push/email/in-app | TBD | `notify.*` | Notifications |
| M15 | admin RBAC | `admin_roles`, `audit_logs` | `admin.action` | Admin |
| M16 | analytics ingest | TBD | product events | Analytics |

## Cross-module rules

- Modules must not read foreign tables without documented contract or shared helper in `packages/shared`.
- Service-role key never used for end-user authorization paths.
- Outbox (target) carries domain events for async notify/moderation.
