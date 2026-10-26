# W1 CLOSURE & W2 READINESS — 2026-10-26

**GA GO/NO-GO: NO-GO** (unchanged)  
**Branch:** `fix/w1-closure-rls-ci` (from `audit/prod-readiness-2026-10-13` @ `6ec50c72` + W1 closure commit)  
**Note:** `origin/master` is far behind the product line; PR to `master` will carry readiness history — Founder should review merge strategy.

---

## 1. What was fixed + commit

| Change | Purpose |
|--------|---------|
| `supabase/migrations/20261026140000_matching_rule_versions_rls.sql` | Align git with already-applied prod/staging RLS |
| `supabase/migrations/20261014120000_pin_media.sql` | Align git with applied `pin_id` column |
| `.github/workflows/ci.yml` | Fix secrets-guard false positive on `sk_live_` regex literals; also run on `master` |
| `scripts/seed-qa-pair.mjs` | Idempotent ensure visited+wishlist+milestone pins |
| Probe/eval scripts + evidence pack | Staging accept, pin visibility, EXT eval, audits |

**Commit SHA:** `e07e6fbed652098d9ba6248f1531a3ea0e702ced`  

**No production schema changes in this step.**

---

## 2. Tests

| Suite | Result | Evidence |
|-------|--------|----------|
| Secrets guard (new pattern) | PASS locally | no credential-like matches |
| `seed-qa-pair.mjs` | PASS | QA seed OK |
| `accept-staging.mjs` | **13/13 PASS** | `QA-ACCEPT-STAGING-RERUN-13-13.json` |
| Pin visibility owner/partner/anon | **PASS** | `PIN_VISIBILITY_MATRIX.json` (outsider N/A — no third synthetic user) |
| pin_id auth insert/roundtrip | PASS | `PIN_ID_AUTH_PROBE.json` |
| Prod RLS read-only audit | READY_FOR_QA | `PROD-RLS-AUDIT-matching_rule_versions.md` |
| CI on PR | _(pending after push)_ | GitHub Actions |
| LIVE PSP / real users | NOT RUN (forbidden) | — |

---

## 3. Evidence index

- `W1_REMEDIATION_STATUS.md` · `PROD-RLS-AUDIT-matching_rule_versions.md`  
- `EXT-DONE-EVIDENCE-EVAL.json` · `EXT-DONE-SUMMARY.md`  
- `QA-ACCEPT-STAGING-RERUN-13-13.json` · `PIN_VISIBILITY_MATRIX.json`  
- `SENTRY-EAS-PREP.md` · `DR-RESTORE-DRILL-PLAN.md` · `FOUNDER-DECISIONS-2026-10-26.md`

---

## 4. Still needs Founder approval

1. Merge strategy: PR → `master` vs promote `audit/prod-readiness` first  
2. Sentry DSN + uptime (2B)  
3. ASC/Play credentials (5A)  
4. Legal pack sign (7A)  
5. Restore-to-new-project / Docker for measured RTO (1C)  
6. Confirm DB password Dashboard reset (9C)  
7. PMO evidence URLs for 15 EXT NO_ID + 69 WAVE_MENTION  
8. Written GO before any LIVE PSP (4B)  
9. Optional: seed third synthetic “outsider” for pin visibility matrix completeness  

---

## 5. W1 closure verdict

| Gate | Verdict |
|------|---------|
| Technical W1 closable gaps (migration in git, CI false-positive, accept 13/13) | **READY_FOR_QA / CONDITIONAL CLOSE** |
| DONE_VERIFIED | **None** (no independent QA sign) |
| External blockers | Remain (Sentry/Store/Legal/DR/LIVE) |
| **W1 overall** | **PARTIAL CLOSE** — engineering closure OK; release gates still open |

---

## 6. W2 entry readiness (Core Member)

### P0 (enter W2 immediately after PR CI green)
| Area | Current | Acceptance |
|------|---------|------------|
| Auth email login/signup | Implemented; OTP E2E thin | Signup+login PASS synthetic |
| Age 18+ | Shared age helpers | Underage blocked E2E |
| Profile /me | Web+mobile partial | Edit+save PASS device |
| Media gate 3–10 | Server limits | Discovery blocked &lt;3 |
| Discover filters | Engine+API | Filter matrix UI↔API |
| Chat ACL | Unit+accept chat PASS | Block revoke E2E |
| pin_id / couple memories | Schema+probe PASS | UI upload E2E |

### P1
| Area | Gap |
|------|-----|
| Phone OTP | NOT_STARTED |
| field_visibility UI | Unused |
| LEAK suite full | Historical only |
| Push notifications | BLOCKED on APNs/FCM |
| Visual fidelity gates | Sheet24 NO-GO |

### Security-first order for W2
1. LEAK/IDOR on staging (profile, media, couple, chat)  
2. Age gate + rate limits  
3. Consent withdraw E2E  
4. Then onboarding polish / discover UX  

**W2 entry:** **CONDITIONAL GO** for engineering spike on staging — not GA.

---

## 7. GA

**NO-GO**
