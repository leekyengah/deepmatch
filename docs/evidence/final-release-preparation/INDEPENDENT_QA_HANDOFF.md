# Independent QA Handoff — Activation Pack

**Prepared:** 2026-10-27 · Cursor eng — **cannot self-sign VERIFIED**  
**Staging:** `https://datingvn.com` · Supabase `zzqpvjdyvjarpphqhaze` · `LIVE_PSP=false`  
**Eng HEAD:** `3132fe3` · PR https://github.com/leekyengah/deepmatch/pull/3  

## Scope

| Surface | In scope | Out of scope |
|---------|----------|--------------|
| Web | Accept, smoke, privacy, commerce sandbox | Production deploy |
| API / RLS | A-001 JWT matrix, no-leak, IDOR spot-check | Service-role misuse |
| Android | Preview APK `fe0ad595` device checklist | Play submit |
| iOS | Simulator optional; device when ASC ready | App Store public |
| Security | Consent revoke, deletion gate, private media | LIVE PSP |

## Artifacts

| Item | URL / path |
|------|------------|
| Android APK build | https://expo.dev/accounts/kyengah/projects/deepmatch/builds/fe0ad595-3bce-4624-b8c5-9b0fea50e56a |
| APK direct | https://expo.dev/artifacts/eas/hYl74cZ7b20Gm7O-Be8wdHdNIzs2GNlmaiNnVo2T_qc.apk |
| SHA-256 | `DCD2A0AE9212730162FB74E7A83FAA0520BDB96780193F05813A3BE2AD42B4C7` |
| Founder Android UAT (12) | `FOUNDER_ANDROID_UAT.md` |
| Prior Independent package | `../release-unblock-2026-10-26/INDEPENDENT_QA_PACKAGE.md` |
| Security evidence | `../qa-agent/qa-2026-10-27T06-45-51-005Z-d64bc81b.md` (2/2 PASS) |
| Reviewer emails | `reviewer_a@` / `reviewer_b@` / `reviewer_delete@deepmatch.test` — password via sealed channel only |

## Automation baseline (re-verify on QA host)

```powershell
cd <repo>
. .\.ai\rls-test.env.ps1   # remint: npm run mint:rls-jwts
npm run accept:staging
npm run qa:deepmatch -- --suite security --env dm-staging
npx playwright test tests/e2e/smoke.spec.ts
node --env-file=.env.local scripts/critical-path-smoke.mjs
```

Last eng run: accept 13/13 · security 2/2 · PW 5/5 · critical-path PASS — **not a substitute for Independent signature**.

## Checklist (Independent fills)

| # | Item | Result |
|---|------|--------|
| 1 | Git SHA tested | |
| 2 | Accept 13/13 | ☐ PASS ☐ FAIL |
| 3 | Security suite | ☐ PASS ☐ FAIL |
| 4 | Playwright smoke | ☐ PASS ☐ FAIL |
| 5 | Android APK SHA + 12 UAT cases | ☐ PASS ☐ FAIL ☐ N/A |
| 6 | Disposable delete (optional) | ☐ PASS ☐ FAIL ☐ SKIPPED |
| 7 | AI revoke stickiness | ☐ PASS ☐ FAIL |
| 8 | No LIVE charge observed | ☐ Confirmed |
| 9 | P0 defects remaining | count: |
| 10 | Recommend Founder GA review | ☐ Yes ☐ No |

## Signoff template

```text
Independent QA Lead: __________________
Org / email: __________________
Date (UTC): __________________
Git SHA: __________________
Android Build ID: fe0ad595 (or other: ____)
Automation + device outcome: PASS / FAIL
Residual risks:
Recommendation: RECOMMEND_FOUNDER_REVIEW | NO-GO
Signature:
```

**Forbidden:** marking Master `DONE_VERIFIED` without this identity · merge as QA substitute · store submit · LIVE PSP  
