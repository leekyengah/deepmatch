# Independent QA Package — DeepMatch Release Unblock

**Prepared:** 2026-10-26 · **Updated:** 2026-10-27  
**Eng HEAD:** `d98cb1c` · Android APK build `fe0ad595`  
**Actor preparing pack:** Cursor automated eng — **cannot self-sign VERIFIED**  
**Staging:** `https://datingvn.com` · Supabase project `zzqpvjdyvjarpphqhaze`

## Scope for Independent QA

| Area | Required | Automation already run (2026-10-27) |
|------|----------|--------------------------------------|
| Accept staging 13 checks | Re-run + sign | **13/13 PASS** |
| W2/P0 catalog | Spot-check + sign | Prior 7/7 and 13/13 PASS |
| Security no-leak | Re-run | **PASS** (suite security) |
| RLS deny JWT matrix A-001 | Execute with JWTs | **PASS** (`qa-…-d64bc81b`; remint via `npm run mint:rls-jwts`) |
| Playwright smoke | Re-run | **5/5 PASS** |
| Critical path | Device + disposable delete | API smoke **PASS** |
| Commerce sandbox | Re-run cancel/refund | Prior 18/18; reconfirm |
| Mobile Android APK | Device checklist | Artifact ready — see `final-release-preparation/ANDROID_DEVICE_QA_PACKAGE.md` |
| iOS | Simulator or TestFlight | Simulator `72114bb8`; device BLOCKED_EXTERNAL |
| Store privacy forms | Counsel | Drafts only |

## How to run (trusted QA host)

```powershell
cd "<repo>"
. .\.ai\qa.env.ps1   # secrets local — never commit
npm run accept:staging
npm run qa:deepmatch -- --suite all --env dm-staging
npx playwright test tests/e2e/smoke.spec.ts
node --env-file=.env.local scripts/critical-path-smoke.mjs
```

After FAR-11 JWTs:

```powershell
npm run qa:deepmatch -- --suite security --env dm-staging
# Expect DM-QA-A-001 PASS (not SKIPPED)
```

## Signoff block (Independent QA fills)

| Field | Value |
|-------|-------|
| Reviewer identity | |
| Date (UTC) | |
| Git SHA tested | |
| Accept 13/13 | ☐ PASS ☐ FAIL |
| Suite all | ☐ PASS ☐ FAIL / notes |
| RLS matrix | ☐ PASS ☐ SKIPPED (reason) |
| Destructive delete on disposable | ☐ PASS ☐ FAIL |
| AI revoke stickiness | ☐ PASS ☐ FAIL |
| Mobile artifact SHA / build ID | |
| **VERIFIED recommendation** | ☐ Recommend Founder GA review ☐ NO-GO |
| Signature | |

## Forbidden

- Marking Master `DONE_VERIFIED` without Independent identity  
- Enabling LIVE PSP  
- Production deploy / store submit  
- Merging PR as substitute for QA signoff  
