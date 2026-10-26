# Store Submission Readiness

**Date:** 2026-10-26  
**RELEASE_CANDIDATE_READY:** **NO**  
**GA:** **NO-GO**

## Mandatory blockers (Founder)

1. **EAS signing** — ASC App ID + distribution credentials; Play upload key + service account  
2. **Privacy / data safety forms** — Legal/Founder sign-off  
3. **Account deletion device proof** — iOS + Android screenshots/video  
4. **Crash reporting** — live Sentry DSN on preview/production profiles  
5. **Independent QA VERIFIED** — security suite + unmatch happy-path with disposable fixture (human)  
6. **No LIVE PSP** on store builds — keep sandbox / bank-transfer offline services out of IAP settlement  
7. **SKU split enforcement** — digital premium → IAP path; CMP/MAT offline packages → `iap_forbidden` (map in `@deepmatch/shared` commerce product-split)

## Present (not sufficient for RC)

- `eas.json` development / preview / production profiles  
- Staging API (`datingvn.com`) wired for Expo  
- Legal routes + account deletion policy pages  
- Mobile Unmatch UI + Discover filter parity (code)  
- W4 sandbox cancel/refund SM + Admin commerce (code; staging migration pending)  
- QA Core CI on PR #3  

## Founder checklist to produce iOS/Android binary

| # | Action | Owner |
|---|--------|-------|
| 1 | Fill ASC App ID; upload Apple certs to EAS | Founder |
| 2 | Create Play app + grant EAS service account | Founder |
| 3 | `eas build --profile preview --platform all` after secrets | Eng (after 1–2) |
| 4 | Approve staging `db push` for commerce refund migration | Founder |
| 5 | Human review merge PR #3 when CI green | Founder |
| 6 | Review SKU IAP vs offline before any Store billing toggle | Founder + Legal |

## Rule

Do **not** submit to TestFlight/Play Internal until blockers 1–5 clear and Founder written GO.  
Do **not** enable LIVE PSP.  
Do **not** self-mark DONE_VERIFIED / RELEASE_CANDIDATE_READY.
