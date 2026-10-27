# CHAT PREMIUM PRIVATE LOUNGE — Phase 0 Audit

**Date:** 2026-10-13  
**Branch:** `feature/chat-premium-lounge`  
**Mockups:** `docs/design/chat-mockups/`

## Existing (WORKING / PARTIAL)

| Area | Evidence | Status |
|---|---|---|
| Route `/chat` | `apps/web/src/app/(app)/chat/page.tsx` | WORKING |
| ChatShell UI | `apps/web/src/components/chat/ChatShell.tsx` | PARTIAL — 2-col, not lounge |
| Mutual-only access | `packages/shared/src/chat/acl.ts` + `assertChatAccess` in messages route | WORKING |
| Matches list + unread | `GET /api/v1/matches` | PARTIAL — no snippet/avatar |
| Messages GET/POST | `/api/v1/messages` · dedupe key · media signed URLs | WORKING |
| Realtime INSERT | Supabase channel on `messages` | WORKING |
| Mark read | `POST /api/v1/chat/read` | WORKING |
| Media upload R2/Supabase | upload-intents + confirm · no client secrets | WORKING |
| Block / report | `/api/v1/blocks`, `/api/v1/reports` | WORKING |
| Mobile chat | `apps/mobile/app/chat/[id].tsx` | PARTIAL — basic |
| Couple Space gate | Mutual like ≠ pair; invite separate | WORKING (policy) |

## Missing vs mockup

- 3-column lounge (Hub / Thread / Relationship Context)  
- Search + unread/favorites/archive filters  
- Last message preview in list  
- Peer profile + điểm chung panel  
- AI icebreaker with consent UI  
- Date invitation flow UI (link to places)  
- Voice/video call UI (placeholder only — no WebRTC)  
- Reply/reaction/edit/unsend  
- Delivery status beyond read receipts  

## Constraints

- No production schema change in this set  
- Favorites/pin/archive → client preferences until migration ADR  
- Calls → UI “coming soon”, no fake LIVE media calls  
- No auto-send AI messages  

## Root risks

| Risk | Mitigation |
|---|---|
| Realtime without media_url on INSERT | Reload or fetch media on new media messages |
| RLS blocks peer profile | Dedicated chat-peer allowlist endpoint after access check |
