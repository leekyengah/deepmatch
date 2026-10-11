# DM-013 — ERD v1

**Status:** Implemented in `supabase/migrations/20261011000000_init.sql` (In review)

## Core entities

- `profiles`, `profile_deep`, `match_preferences`
- `blocks`, `reports`
- `pair_invites`, `pairs` (active uniqueness on unordered user pair)
- `pins` (3 layers), `private_notes` (default private), `media_objects`
- `likes`, `mutual_matches` (**no FK to pairs**), `conversations`, `messages`
- `service_offerings`, `service_bookings`
- `admin_roles`, `feature_flags`, `consent_events`, `audit_logs`, `matching_rule_versions`

## Owner scope

| Entity | Owner / tenant |
|---|---|
| profiles | self `auth.uid()` |
| pairs/pins | active pair members |
| private_notes | author; partner only if shared |
| mutual/chat | mutual participants |
| audit_logs | no client select |

## Indexes

- Active pair unique on `least/greatest(user_a,user_b)`
- Message dedupe `(conversation_id, client_dedupe_key)`
