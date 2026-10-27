# MEDIA_AUDIT_REPORT — DM-MEDIA-002

**Task:** DM-MEDIA-002 (links DM-MEDIA-001)  
**Date:** 2026-10-13  
**Scope:** Full repository media/upload surface audit (web, mobile, API, DB, admin)  
**Method:** Source-only evidence; no production writes; no assumption without code hit.

---

## 1. Credentials & storage STATE

| Check | Result |
|---|---|
| `R2_*` / `AWS_*` / `S3_*` in process env | **UNSET** |
| `R2_*` keys in `.env.example` / `.env.local` | **Absent** (key names not present) |
| `@aws-sdk/*` / `sharp` / `ffmpeg` in app `package.json` | **Absent** |
| Active storage provider in code | **Supabase Storage** bucket `media` (private) |
| ADR storage decision | `docs/p0/DM-008-technology-adr.md`: Supabase Storage + signed URLs |

**Verdict:** `CREDENTIALS_REQUIRED` for Cloudflare R2 server-side secrets (Vercel / secret manager).  
**Do not** commit keys. Keys pasted in chat must be **rotated** and never stored in git.

Existing flow (reuse, do not duplicate blindly):

1. Client → `POST /api/v1/media/upload-intents`
2. Insert `media_objects` + Supabase `createSignedUploadUrl`
3. Client `uploadToSignedUrl` → bucket `media`
4. Read via short-lived `createSignedUrl`

---

## 2. Media Audit Matrix

| Module | Route | File path | Line | Existing feature | Media type | Privacy | Action | Status |
|---|---|---|---|---|---|---|---|---|
| Profile avatar upload | `/me/edit` | `apps/web/src/components/me/AvatarUpload.tsx` | 9–125 | File picker → upload-intents → Supabase signed PUT → `profiles.avatar_path` | image jpeg/png/webp ≤8MB | PRIVATE (storage private; path on profile) | Migrate to unified Media Service (R2) behind flag | **INTEGRATED** (Supabase) |
| Profile media gate | `/me/media` | `apps/web/src/app/(app)/me/media/page.tsx` | 7–28 | Gate UI only; CTA to `/me/edit` | counts images/videos | owner | Add album picker + confirm API | **PARTIAL** |
| Profile media library API | `/api/v1/media/library` | `apps/web/src/app/api/v1/media/library/route.ts` | 5–68 | List + discover eligibility (3–10 images, ≤2 videos) | image/video metadata | owner | Extend with processing/moderation fields | **INTEGRATED** (API) |
| Media upload intents API | `/api/v1/media/upload-intents` | `apps/web/src/app/api/v1/media/upload-intents/route.ts` | 19–131 | Auth, MIME, size, quota, pair ACL, signed upload | image/video | private bucket | Swap signer to R2; add confirm + processing | **INTEGRATED** (Supabase) |
| Media export API | `/api/v1/media/export` | `apps/web/src/app/api/v1/media/export/route.ts` | 7–52 | Signed download URLs 300s | image/video | owner | Keep ACL; R2 GetObject presign | **INTEGRATED** |
| Chat attachment | chat shell (in-app) | `apps/web/src/components/chat/ChatShell.tsx` | 243–327, 523–532 | File picker image/video → intent → message `mediaId` | image + video ≤50MB | conversation parties | Migrate signer; add duration reject | **INTEGRATED** |
| Chat media read | `/api/v1/messages` | `apps/web/src/app/api/messages/route.ts` | 45–76, 109+ | Resolve `media_objects` → signed URL | image/video | conversation ACL | Authz on every read URL | **INTEGRATED** |
| Couple memories CTAs | `/couple/memories` | `apps/web/src/app/(app)/couple/memories/page.tsx` | 113–122 | Labels `addPhoto`/`addVideo` link to `/couple/add` (pin form, **no file input**) | none | — | Wire pin/media join + upload | **STUB** |
| Couple add pin | `/couple/add` | `apps/web/src/components/couple/CoupleAddClient.tsx` | 44–80 | Text pin + journal only | none | COUPLE_PRIVATE | Add media attach | **MISSING upload** |
| Couple cover display | `/couple` | `apps/web/src/app/(app)/couple/page.tsx` | 69–74 | Signed URL if `cover_path` set | image path | pair members | Keep private signed read | **PARTIAL** (read) |
| Couple cover settings | couple us settings | `apps/web/src/components/couple/CoupleUsClient.tsx` | 134 | Hint text only; **no file picker** | — | — | Add cover upload UI | **STUB** |
| Couple cover API | `/api/v1/couples/[id]/settings` | `apps/web/src/app/api/v1/couples/[id]/settings/route.ts` | 30–73 | Accepts `cover_path` string patch | path string | pair | Validate media_id READY only | **PARTIAL** (API) |
| Places / Love Map editorial | `/places/*`, home fixtures | `apps/web/src/lib/home-fixtures.ts`, places APIs | various | Static `/fixtures/home/*.jpg` / editorial | static public assets | PUBLIC fixtures | Out of user-upload scope | **N/A (fixtures)** |
| Places reviews user media | reviews | *(no upload handler found)* | — | — | — | — | Design + integrate | **NOT FOUND** |
| Services companion media | services/catalog | *(no user upload found)* | — | `demo_banner` text flags | — | — | Design + integrate | **NOT FOUND** |
| System banners | admin/marketing | *(no R2/banner upload found)* | — | — | — | ADMIN | Later | **NOT FOUND** |
| Admin moderation list | `/moderation` (admin) | `apps/admin/src/app/moderation/page.tsx` | 14–59 | Lists recent `media_objects`; no approve/reject actions | metadata | ADMIN | Actions + signed preview | **PARTIAL** |
| Mobile native upload | Expo app | `apps/mobile/**` | — | No `ImagePicker` / file upload UI found; `media_url` type only in `lib/api.ts` | — | — | Shared API client later | **NOT FOUND** |
| Feature flag | env/DB | `packages/shared/src/flags.ts`, `apps/web/src/lib/flags.ts` | `ff_media_upload` | Kill switch | — | — | Keep for R2 cutover | **INTEGRATED** |
| DB metadata | Postgres | `supabase/migrations/20261011000000_init.sql` | 121–129 | `media_objects` core | — | RLS | Extend columns for DM-MEDIA-002 | **PARTIAL schema** |
| DB purpose/moderation | Postgres | `supabase/migrations/20261013060000_entitlements_checkout_media.sql` | 1–2 | `purpose`, `moderation_status` | — | — | Add processing_status, visibility, dims, duration, soft delete | **PARTIAL** |
| Storage bucket | Supabase | `supabase/migrations/20261012030000_media_bucket_concierge.sql` | 3–60 | Private bucket `media`, 8MB then 50MB via DM-035 | image/video MIME | private | Do not create R2 bucket if `deepmatch` exists; no public ACL change without approval | **LIVE (Supabase)** |

---

## 3. Schema gap vs DM-MEDIA-002 target

Current `media_objects`: `id`, `owner_user_id`, `pair_id`, `conversation_id`, `storage_path`, `content_type`, `bytes`, `created_at`, + `purpose`, `moderation_status`.

**Missing vs spec:** `object_key` (alias/`storage_path`), `media_type`, `mime_type` (alias), `size_bytes` (alias), `duration_seconds`, `width`, `height`, `visibility`, `entity_type`, `entity_id`, `processing_status`, `deleted_at`, pin/place/service FKs.

---

## 4. Modules — integrated vs not

**Integrated (Supabase-backed):** avatar, chat send/read, upload-intents, library gate API, export, admin list, flag.

**Partial / stub:** profile album UX, couple cover, couple memory photo/video CTAs, moderation actions.

**Not found (no source evidence of user upload):** places review media, services media, system banners, mobile picker, intro video dedicated flow, media worker/ffmpeg pipeline, confirm-upload API, fake-MIME verification, 30s duration server reject.

---

## 5. Decisions required (blocker for impl)

1. **ADR:** Keep Supabase Storage vs migrate to Cloudflare R2 vs dual-write adapter (`STORAGE_BACKEND=supabase|r2`).
2. **Secrets:** Install `R2_*` only in server secret manager (not chat, not git).
3. **Public ACL:** Do not change R2 public access until approved.
4. **Confirm API + worker** before treating client upload success as READY.
5. **Google Drive Master:** MCP auth timed out — sync payload in repo; apply when Drive available.

---

## 6. Release status (this phase)

| Gate | Status |
|---|---|
| Audit complete | **PASS** |
| R2 credentials in secret manager | **FAIL — CREDENTIALS_REQUIRED** |
| Connection test (minimal HeadBucket/ListBuckets) | **BLOCKED** |
| Unified Media Service code | **NOT STARTED** (await approval + secrets) |
| Production cutover | **NO-GO** |
