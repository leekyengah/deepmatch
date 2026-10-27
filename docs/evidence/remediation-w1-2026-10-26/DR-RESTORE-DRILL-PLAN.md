# Backup / restore drill plan (FIX26-014) — 2026-10-26

**Founder 1C:** staging drill allowed · prod snapshot **read-only** · no traffic cut on prod.  
**Observed:** daily physical backups COMPLETED on staging+prod · **PITR = false** · `supabase db dump` needs Docker locally.

## Objectives
| Metric | Target (proposed) | How measured |
|--------|-------------------|--------------|
| RPO | ≤ 24h (backup cadence) until PITR enabled | Age of newest COMPLETED backup at drill start |
| RTO (schema+data restore to **new** project) | ≤ 60 min | Stopwatch restore-to-new-project → health 200 |
| RTO (app rollback only) | ≤ 15 min | Vercel promote previous Ready deployment |

## Resource limits
- **Do not** restore over `datingvn.com` / staging project in-place without written downtime window  
- Prefer **restore-to-new-project** or branch DB  
- Disk/time: expect multi‑GB physical restore; Ops laptop + Docker OR Supabase Dashboard  
- Prod: inventory + download metadata only unless Founder expands scope

## Procedure A — Staging restore-to-new-project (preferred)
1. Record newest backup id + `inserted_at` (Management API / Dashboard)  
2. Dashboard → Database → Backups → Restore to a **new** Supabase project  
3. Point a throwaway Vercel preview env at new project (anon/service from new project only)  
4. Run `scripts/accept-staging.mjs` adapted to preview URL (synthetic QA)  
5. Record RTO; destroy throwaway project within 24h  
6. Evidence: timestamps + health JSON + accept summary (redact secrets)

## Procedure B — Soft drill without Docker (partial)
1. List backups API (done)  
2. `SELECT` critical table counts on staging (profiles, pairs, media_objects, pins)  
3. Document RPO = now − backup.inserted_at  
4. **Does not** prove restore path → status stays PARTIAL

## Procedure C — App-only rollback
1. `vercel ls deepmatch` → prior Ready deployment  
2. Promote/rollback via Dashboard  
3. Probe `/api/health`  
4. RTO app-only; DB unchanged

## Rollback of a bad restore
- Keep original project untouched (A) → delete new project  
- If in-place restore used: restore again from prior COMPLETED backup (double RTO)  
- Migration forward-fix preferred over history rewrite

## Blockers now
1. Docker Desktop **or** Dashboard restore permission  
2. Founder confirm throwaway project billing OK  
3. Optional: enable **PITR** for RPO minutes (billing)

## Acceptance for DONE_VERIFIED
- Measured RTO/RPO numbers in evidence  
- Independent Ops sign  
- No production in-place restore without GO
