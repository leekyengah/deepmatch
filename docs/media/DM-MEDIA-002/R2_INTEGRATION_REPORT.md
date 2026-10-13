# R2_INTEGRATION_REPORT — DM-MEDIA-002

**Task:** DM-MEDIA-002 ↔ DM-MEDIA-001  
**Date:** 2026-10-13  
**Provider:** Cloudflare R2 (S3-compatible)  
**Status:** Implemented (adapter dual-backend) · Staging `STORAGE_BACKEND=r2` · Prod keys installed but `STORAGE_BACKEND=supabase` until cutover

---

## 1. Credentials

| Item | Status |
|---|---|
| Admin-provided endpoint / bucket name | Known out-of-band (`deepmatch` bucket) |
| Repo / `.env.local` / process env | **No `R2_*` present** → `CREDENTIALS_REQUIRED` |
| Frontend exposure | **None found** (correct — keep) |
| Logging of keys / signed URLs | Must remain forbidden in new code |

**Actions for ops (human):**

1. **Rotate** any keys that appeared in chat or tickets.
2. Store only in Vercel/project secrets (web server) + worker env:
   - `R2_ENDPOINT`, `R2_BUCKET=deepmatch`, `R2_REGION=auto`
   - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
3. Never commit values; never ship to Expo/public env.

Connection test (when secrets installed): **HeadBucket** or `ListObjectsV2` with `MaxKeys=1` on `deepmatch` — no user object read/delete.

**Bucket policy:** Do not create a new bucket if `deepmatch` exists. Do not change public access without approval.

---

## 2. Current architecture (reuse)

```
Client file pick
  → POST /api/v1/media/upload-intents (auth, MIME, size, quota, pair/conversation ACL)
  → media_objects row + Supabase createSignedUploadUrl
  → client uploadToSignedUrl → storage.buckets.media (private)
  → (gap) no confirm / magic-byte verify / worker / READY gate
  → read via createSignedUrl (export 300s, messages 600s, couple cover 3600s)
```

ADR-01/DM-008 currently selects **Supabase Storage**, not R2.

---

## 3. Target unified Media Service (proposed, not shipped)

**Adapter pattern** (recommended to avoid big-bang):

- `STORAGE_BACKEND=supabase|r2` (default `supabase` until cutover approved)
- Shared API surface:
  - `POST /api/v1/media/upload-intents` → presigned PUT
  - `POST /api/v1/media/{id}/confirm` → HeadObject + size/MIME verify → `processing`
  - Worker → variants/thumbnails/moderation → `READY` | `FAILED`
  - `GET /api/v1/media/{id}/url` → authz then short-lived GET presign

**Object key (normalized; bucket name is not a key prefix):**

```text
users/{userId}/avatar/{ulid}.bin
users/{userId}/photos/{ulid}.bin
users/{userId}/videos/{ulid}.bin
couples/{coupleId}/photos/{ulid}.bin
couples/{coupleId}/videos/{ulid}.bin
places/{placeId}/reviews/{ulid}.bin
services/{serviceId}/media/{ulid}.bin
system/banners/{ulid}.bin
temp/{uploadId}/{ulid}.bin
```

No email/PII in paths. Original filename discarded.

**SDK:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` with R2 endpoint, `forcePathStyle` as required by Cloudflare docs for the account.

**CORS:** Configure on R2 bucket for web origins only (PUT from browser); not implemented yet.

---

## 4. Processing rules (spec → gap)

| Rule | Spec | Current code |
|---|---|---|
| Image max | 10 MB | 8 MB in upload-intents / AvatarUpload |
| Auto-orient / resize ≤2048 / WebP-AVIF / thumb 320 / strip GPS EXIF | Required | **Missing** (no worker) |
| Video max duration | 30s reject (no trim-to-fit) | **Missing** server duration check |
| Video max input | 50 MB | 50 MB soft limit |
| Output ≤720p H.264/AAC + poster | Required | **Missing** |
| Confirm + READY before display | Required | Avatar updates path immediately after client upload |
| Concurrency limits | Required | **Missing** |

---

## 5. Privacy model

| Visibility | Use |
|---|---|
| PUBLIC | Explicit owner publish only; CDN-eligible |
| PRIVATE | Owner + granted |
| COUPLE_PRIVATE | Active pair members only; re-check on every signed read |
| ADMIN_RESTRICTED | Role-gated staff |

Private media must not use permanent public URLs. Pair breakup / share revoke → deny new signed reads.

---

## 6. Modules integration plan

| Module | Now | Next |
|---|---|---|
| Avatar | Supabase live | Adapter + confirm + READY |
| Chat | Supabase live | Same + video duration |
| Profile album | Gate only | Upload UI + library |
| Couple cover / memories | Stub/partial | Wire media_id + pin join |
| Places / services / banners / mobile | Not found | After core service READY |

---

## 7. Master / Drive sync

- Spreadsheet id (existing tracker): `1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8` (`docs/tracker/DEEPMATCH_MASTER_RECONCILIATION.md`)
- Google Drive MCP auth **timed out** this session → apply DM-MEDIA-002 rows when auth succeeds; do not create duplicate Master.

**Proposed Master rows:** Media Audit Matrix, Architecture (adapter), Backlog, Dependencies (R2 secrets, ADR amend), API & DB, Security & Privacy, Storage Cost, QA, KPI, Release Gates, ADR-storage-R2 draft.

---

## 8. Errors found & handling

| Issue | Handling |
|---|---|
| Secrets in chat | Rotate; `CREDENTIALS_REQUIRED` until secret manager set |
| Client success treated as safe | Add confirm + worker before READY |
| Couple photo/video CTA without upload | Documented STUB; wire after service |
| Image limit 8 vs 10 MB | Align to 10 MB when R2 path ships |
| No fake-MIME check | Magic-byte verify on confirm |

---

## 9. Release status

**NO-GO for production R2 cutover.**  
Audit + design docs only. Implementation awaits: secrets installed, ADR decision, QA + rollback approval.
