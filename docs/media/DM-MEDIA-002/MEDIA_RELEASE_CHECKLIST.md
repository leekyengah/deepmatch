# MEDIA_RELEASE_CHECKLIST — DM-MEDIA-002

**Task:** DM-MEDIA-002 (depends DM-MEDIA-001)  
**Date:** 2026-10-13  
**Production cutover:** **NO-GO**

---

## A. Preconditions

- [ ] R2 secrets in server secret manager only (`CREDENTIALS_REQUIRED` cleared)
- [ ] Keys from chat/tickets **rotated**
- [ ] Bucket `deepmatch` exists; **no** new bucket created
- [ ] Public access policy **unchanged** unless founder-approved
- [ ] ADR amendment: Supabase Storage → R2 adapter / cutover approved
- [ ] Rollback plan written (re-point `STORAGE_BACKEND=supabase`)

## B. Implementation gates

- [ ] Unified Media Service adapter (`supabase|r2`)
- [ ] Presigned PUT short TTL; random object keys
- [ ] Confirm API + magic-byte / size verify
- [ ] Worker: image (orient, ≤2048, WebP/AVIF, thumb 320, strip GPS)
- [ ] Worker: video (≤30s reject, ≤720p H.264/AAC, poster, concurrency cap)
- [ ] `processing_status` / `moderation_status` / `visibility` / soft delete
- [ ] Signed GET authz on every issue (pair revoke aware)
- [ ] No frontend R2 credentials; no key/URL logging
- [ ] Feature flag / kill switch retained (`ff_media_upload`)

## C. Module wiring

| Module | Ready for release? |
|---|---|
| Avatar | [ ] after R2 + confirm |
| Chat | [ ] after R2 + duration |
| Profile album | [ ] UI + READY |
| Couple cover | [ ] picker + READY |
| Couple memories media | [ ] pin join |
| Places reviews | [ ] not started |
| Services media | [ ] not started |
| Mobile upload | [ ] not started |
| Admin moderation actions | [ ] not started |

## D. QA gates (staging)

- [ ] Connection test minimal
- [ ] Image upload E2E
- [ ] Video 30s accept / 31s reject
- [ ] Signed URL expiry
- [ ] Cross-account deny
- [ ] CORS
- [ ] Fake MIME reject
- [ ] Interrupt + orphan GC
- [ ] Parallel upload
- [ ] Processing fail ≠ READY
- [ ] Privacy regression
- [ ] Responsive web (+ mobile when wired)

## E. Cost / ops

- [ ] Quotas by tier
- [ ] Temp retention + orphan GC delay
- [ ] Metrics: storage GB, Class A/B, encode minutes, CDN PUBLIC
- [ ] TCO re-check vs `MEDIA_STORAGE_COST_ANALYSIS.md`

## F. Docs / Master

- [x] Repo reports under `docs/media/DM-MEDIA-002/`
- [ ] Google Master updated (Drive auth blocked this session)
- [ ] KPI: upload success, READY latency, moderation SLA, cost/user

## G. Go / No-Go

| Signal | Now |
|---|---|
| Audit | GO |
| Secrets | NO-GO |
| Code complete | NO-GO |
| QA | NO-GO |
| **Production release** | **NO-GO** |

---

## Master sync payload (apply when Drive/Sheets available)

Do **not** create a duplicate Master. Update existing tracker (`1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8` per `docs/tracker/DEEPMATCH_MASTER_RECONCILIATION.md`).

| Section | Update |
|---|---|
| Media Audit Matrix | Link `MEDIA_AUDIT_REPORT.md` |
| Architecture | Adapter `STORAGE_BACKEND`; flow confirm→worker→READY |
| Backlog | DM-MEDIA-002 open items; link DM-MEDIA-001 |
| Dependencies | R2 secrets, ADR amend, worker host |
| API & Database | confirm endpoint; schema extensions |
| Security & Privacy | visibility enums; no public private URLs |
| Storage Cost | three scenarios from cost report |
| QA | matrix from security QA report |
| KPI | READY latency, reject rate, $/MAU media |
| Release Gates | this checklist |
| ADR | draft storage R2 amendment (status Proposed) |
