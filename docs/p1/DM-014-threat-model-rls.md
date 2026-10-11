# DM-014 — Threat Model & RLS

**Status:** In review  
**Schema:** `supabase/migrations/20261011000000_init.sql`

## Threats & controls

| Threat | Control |
|---|---|
| Cross-pair IDOR | `is_pair_member` + RLS on pins/notes |
| Invite enumeration | store `code_hash` only; rate limit accept |
| Signed URL media leak | private bucket + short TTL (app layer) |
| Chat without mutual | ACL `canAccessChat` + RLS on conversations |
| Admin chat browse | audit_logs deny-all to clients; break-glass RPC later |
| Advisor over-read | bookings.advisor_id scope (P4 policies) |
| Ranker forbidden signals | shared engine sanitizes inputs |

## Entity R/W matrix (user)

| Entity | Read | Write |
|---|---|---|
| profiles self | yes | yes |
| pair pins | pair members | pair members (creator check) |
| private_notes | author or shared | author |
| messages | mutual participants | sender participant |
| audit_logs | no | service/admin only |

## Acceptance

- [x] Policy draft + SQL RLS baselines
- [ ] Adversarial integration suite against live staging DB
