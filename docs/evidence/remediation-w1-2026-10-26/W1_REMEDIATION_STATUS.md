# W1 REMEDIATION STATUS — 2026-10-26 (continuation)

**Release stance: GA NO-GO** (Founder 11A) · Staging CONDITIONAL OK  
**Git HEAD:** `6ec50c72` (migration `20261026140000_*` **uncommitted** — process debt)  
**Sources:** `EXEC-FOUNDER-ANSWERS.md`, Sheet 52 audit, Sheet 53 execution, this folder’s probes

---

## 1. Classification rollup

### DONE_VERIFIED
**None.** Independent QA sign-off not present for any FIX26.

### READY_FOR_QA
| ID / topic | Evidence | Notes |
|------------|----------|-------|
| Prod RLS `matching_rule_versions` audit | `PROD-RLS-AUDIT-matching_rule_versions.md` | Policies live; anon → `[]`; unused by app code |
| Staging pin_id auth probe | `PIN_ID_AUTH_PROBE.json` | insert+roundtrip PASS; couples/active Bearer 200 |
| Staging accept suite | `QA-ACCEPT-STAGING-2026-10-26.json` | **12/13** PASS |
| Branch protection 6B | GitHub API | `master` requires `CI / verify`, no force-push |
| OSM GA policy 3B | CoupleMapClient + EXEC | Keep Mapbox unset |
| Topology / SSOT / scorecard / gap backlog | FIX26-001,004–008,010 docs | Pending Founder/QA sign |

### PARTIAL
| ID / topic | Gap |
|------------|-----|
| FIX26-002 DM map | 375 Master IDs; 67 mentioned; 308 no doc mention |
| FIX26-003 EXT Done | **85** Done: 1 ID-named · **69** wave-mention · **15** no evidence path |
| FIX26-011 pin_id | Schema+REST+auth insert OK; accept pins layers **FAIL** (0 pins); couple memory UI E2E thin |
| FIX26-014 DR | Plan written; backups listed; full restore **not** executed (Docker/Dashboard) |
| FIX26-015 Sentry | Code+deps ready; DSN not installed |
| FIX26-009 deploy SHA | Vercel ls partial |
| FIX26-012 secrets | Inventory; Founder 9C self-reset DB pw |
| CI | Required check set; recent CI run **failure** |

### BLOCKED (Founder / external)
| Topic | Need |
|-------|------|
| Sentry/uptime 2B | Create project + paste DSN to Vercel + uptime monitor |
| Store/EAS 5A | ASC App ID + Apple/Google EAS secrets |
| Legal 7A | Counsel/Founder sign LEGAL pack |
| LIVE PSP 4B | Prep only — written GO before any LIVE |
| Full restore drill 1C | Docker **or** restore-to-new-project billing/approval |
| Commit migration | Eng commit `20261026140000_*` to `master` (after CI fix) |
| Pins seed for accept | Re-seed QA pins (pair_pins_three_layers FAIL) |

---

## 2. Prod RLS audit (priority 1) — summary

- **Applied:** migration `20261026140000` on prod · RLS on · staff owner/admin policies  
- **Commit:** **not in git** (untracked) — HEAD still `6ec50c72`  
- **API impact:** none observed (table unused; 0 rows; anon empty)  
- **Rollback:** forward migration or disable RLS (documented, **not** run)  
- **This wave:** read-only verification only — **no further prod changes**

---

## 3. EXT Done × 85 (priority 2) — no VERIFIED

Source: `EXT-DONE-EVIDENCE-EVAL.json`

| Bucket | Count | Meaning |
|--------|------:|---------|
| ID_NAMED_EVIDENCE | 1 | `EXT-076` |
| WAVE_MENTION_ONLY | 69 | Mentioned in wave docs / shared evidence only |
| NO_ID_EVIDENCE | 15 | `EXT-053..056, 064, 071..075, 080..083, 090` |

**Action for PMO:** attach evidence URL per Done row; demote status if no proof. **Do not** treat Master “Hoàn thành” as VERIFIED.

---

## 4. Staging independent tests (priority 3)

| Test | Result |
|------|--------|
| `no-leak-public.mjs https://datingvn.com` | **PASSED** |
| Unauth couples/media/discovery | **401** |
| Health `/api/health` + `/api/v1/health` | **200** |
| `accept-staging.mjs` (synthetic QA) | **12/13** — FAIL `pair_pins_three_layers` (A=0 B=0) |
| `probe-pin-id-staging.mjs` | **PASS** media select, insert `pin_id`, roundtrip; BFF couples/active **200** |
| Real user accounts | **Not used** |

---

## 5. Sentry / EAS (priority 4)

See `SENTRY-EAS-PREP.md` — package + bootstrap + eas profiles ready; Founder must supply DSN / ASC / store creds.

---

## 6. DR plan (priority 5)

See `DR-RESTORE-DRILL-PLAN.md` — RPO≤24h (until PITR), RTO targets, restore-to-new-project preferred, no in-place prod restore.

---

## 7. Founder decisions still required

1. Confirm **commit + PR** of RLS migration to `master` (or request revert)  
2. **2B** Sentry DSN + uptime  
3. **5A** ASC / Play credentials  
4. **7A** Legal pack sign  
5. **1C** Approve throwaway restore project / install Docker for measured RTO  
6. **9C** Confirm Dashboard DB password reset completed  
7. Re-seed QA pins **or** accept FAIL on three-layer pin gate  
8. PMO attach evidence for 15 NO_ID + upgrade 69 WAVE_MENTION rows  
9. Keep **LIVE PSP off** until separate written GO (4B)

---

## 8. Sheet 53

Updated this wave for FIX26-003, 011 notes, 014, 015, and RLS audit cross-ref (see sheet changelog in evidence). Status values remain **not** DONE_VERIFIED.
