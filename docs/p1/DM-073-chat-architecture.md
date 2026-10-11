# DM-073 — Chat Architecture & Policy

- Transport: Supabase Realtime (ADR-06 Proposed)
- Gate: `mutual_matches` → `conversations` → `messages`
- ACL: `canAccessChat` (shared) + RLS
- Dedupe: `client_dedupe_key`
- Media: private storage, size caps, signed URL
- Retention: TBD Founder (ADR-06 Blocking)
- Admin evidence: break-glass + audit only
- Notifications: no sensitive preview default
