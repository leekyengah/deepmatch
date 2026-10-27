# Independent QA Package — DeepMatch Release Unblock

**Prepared:** 2026-10-26  
**Baseline commit (sprint start):** `6449e06`  
**Actor preparing pack:** Cursor automated eng — **cannot self-sign VERIFIED**  
**Staging:** `https://datingvn.com` · Supabase project `zzqpvjdyvjarpphqhaze`

## Scope for Independent QA

| Area | Required | Automation already run |
|------|----------|------------------------|
| Accept staging 13 checks | Re-run + sign | PASS (this sprint) |
| W2/P0 catalog | Spot-check + sign | 7/7 and 13/13 PASS |
| Security no-leak | Re-run | PASS |
| RLS deny JWT matrix | Execute with JWTs | SKIPPED until FAR-11 |
| Playwright smoke | Re-run | 5/5 PASS |
| Critical path (delete gate, privacy, AI, media, match, booking) | Device + disposable delete | API smoke PASS |
| Commerce sandbox | Re-run cancel/refund | Prior 18/18; reconfirm |
| Mobile RC | Device farm / TestFlight / APK | Not available to eng agent |
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
