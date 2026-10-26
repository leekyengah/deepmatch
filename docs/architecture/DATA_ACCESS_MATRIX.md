# DeepMatch — Data Access Matrix

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Owner | Security |
| Updated | 2026-10-11 |
| Source | Master §VII + `DM-014` + live RLS |

## Legend

- **Owner** = resource subject
- **Partner** = active pair / mutual peer
- **Consultant** = assigned advisor
- **Moderator** = case-scoped admin role
- Y = allowed by design; N = denied by default; C = consent/case only

| Resource | Owner | Partner | Consultant | Moderator | RLS evidence |
|---|---|---|---|---|---|
| Dating profile (public fields) | Y | discoverable rules | C | C | `profiles_self`; discovery read TBD |
| Deep / private profile fields | Y | N | C | N | `profile_deep_self` |
| Likes sent | Y | N | N | C | `likes_actor` |
| Mutual match | Y | Y | N | C | `mutual_participant` |
| Chat messages | Y | Y (member) | N | C | `messages_participant` |
| Active couple space | Y | Y | N | N | `pairs_member` |
| Pins (couple) | Y | Y | N | N | `pins_pair_member` |
| Private notes (default) | Y | N | N | N | `private_notes_author` |
| Private notes (shared) | Y | Y | N | N | shared flag + active pair |
| Media objects | Y | pair-scoped | N | C | RLS enable; policies PARTIAL |
| Service booking | Y | N | assigned | C | bookings RLS PARTIAL |
| Reports | Y (own) | N | N | Y case | reports RLS thin |
| Audit logs | N | N | N | service | `audit_deny_all` |
| Feature flags | read via BFF | — | — | admin write | DB table |

## Identity rules

- Never trust client-supplied `user_id` / `role` for authz.
- Subject = `auth.uid()` from verified session.
- Service role only for break-glass / migrations / trusted workers — never browser.

## Revocation triggers

| Event | Effect |
|---|---|
| Block | Exclude from discovery; deny new chat/likes |
| Pair unpair | `is_pair_member` false → pins/notes partner access ends |
| Suspend | Profile flagged; discovery hidden |
| Logout / session end | JWT invalid |

## Gaps

- `media_objects`, `reports`, `service_bookings`, `admin_roles` policies incomplete vs matrix.
- Signed URL TTL + post-breakup revocation not verified in integration tests.
