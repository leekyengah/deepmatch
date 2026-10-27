# MEDIA_SECURITY_QA_REPORT — DM-MEDIA-002

**Task:** DM-MEDIA-002  
**Date:** 2026-10-13  
**Phase:** Audit / design — **no production destructive tests**

---

## 1. Security findings (current Supabase path)

| ID | Finding | Severity | Evidence | Mitigation plan |
|---|---|---|---|---|
| SEC-M01 | Avatar marks profile path after client upload without server confirm / magic-byte verify | High | `AvatarUpload.tsx` updates `avatar_path` immediately post `uploadToSignedUrl` | Confirm API + READY gate |
| SEC-M02 | MIME trusted from client `content_type` | High | `upload-intents/route.ts` ALLOWED set only | Magic bytes on confirm; reject mismatch |
| SEC-M03 | No server-side video duration enforcement | High | Chat + intents accept video by size only | ffprobe in worker; reject >30s |
| SEC-M04 | Signed download URLs may appear in API JSON (export/messages) | Med | export 300s, messages 600s | Never log URLs; short TTL; no permanent public URLs for private |
| SEC-M05 | Couple cover TTL 3600s longer than chat | Low | `couple/page.tsx` | Align TTL policy by visibility |
| SEC-M06 | Admin moderation lists metadata only; no action ACL workflow | Med | `admin/.../moderation/page.tsx` | Role actions + audit log |
| SEC-M07 | Chat secrets: R2 keys must never reach client | Critical (future) | N/A yet | Server-only env; no `NEXT_PUBLIC_R2_*` |
| SEC-M08 | Keys exposed in operator chat | Critical (ops) | This task thread | **Rotate immediately**; secret manager only |

---

## 2. Privacy model checks

| Case | Expected | Current |
|---|---|---|
| Private media not publicly listed | private bucket `media` | PASS (Supabase private) |
| Pair media readable by partner | RLS + storage policy pair member | PASS pattern in migration |
| Pair dissolve / revoke | Deny new signed reads | Needs explicit re-authz on every sign (document as regression test) |
| Frontend R2 credentials | Forbidden | PASS (none) |
| EXIF GPS stripped on distribute | Required | FAIL (no processor) |

---

## 3. QA matrix (execution status)

| Test | Status | Notes |
|---|---|---|
| R2 connection (HeadBucket / MaxKeys=1) | **BLOCKED** | `CREDENTIALS_REQUIRED` |
| Upload image | BLOCKED (R2) / prior Supabase PASS in evidence | Do not delete prod objects |
| Upload video 30s | BLOCKED | Need fixture ≤30s |
| Reject video 31s | BLOCKED | Must fail closed |
| Signed URL expiry | BLOCKED | Assert 403/expired after TTL |
| Cross-account access deny | BLOCKED | Two users; private object |
| CORS browser PUT | BLOCKED | Staging origins only |
| Fake MIME (e.g. exe as image/jpeg) | BLOCKED | Confirm must reject |
| Interrupted upload | BLOCKED | Orphan temp + GC |
| Duplicate / parallel upload | BLOCKED | Idempotent media_id |
| Processing failure → not READY | BLOCKED | Worker fail path |
| Storage cleanup | BLOCKED | Soft-delete + delayed GC |
| Security/privacy regression | PENDING | After adapter |
| Responsive web/mobile display | PENDING | After READY URLs |

Prior related evidence (Supabase era): `docs/evidence/QA-ACCEPT-2026-10-12.md` (signed upload PASS), `docs/evidence/CONCIERGE-MEDIA-2026-10-12.md`.

---

## 4. Test constraints

- No production object deletes for testing.
- No public ACL flip without approval.
- No storage provider cutover before QA + rollback plan approval.
- Prefer staging bucket prefix `temp/qa-{run}/` if using shared `deepmatch` bucket.

---

## 5. Verdict

**Security posture of current system:** PARTIAL (private bucket + signed URLs good; confirm/worker/EXIF/duration gaps).  
**R2 integration security:** NOT CERTIFIED — secrets missing, tests not run.
