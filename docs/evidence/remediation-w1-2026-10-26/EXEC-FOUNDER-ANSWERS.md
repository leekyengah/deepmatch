# Execution of Founder answers 1C–12A — 2026-10-26

**GA stance:** NO-GO (11A) · staging CONDITIONAL OK

## Completed this session

| Decision | Result | Evidence |
|----------|--------|----------|
| **6B** Branch protection | `master` protected: require `CI / verify`, **force-push off**, enforce_admins | GitHub API PUT protection OK |
| **8A** RLS staging | Migration `20261026140000_matching_rule_versions_rls.sql` applied; `relrowsecurity=true` | staging db push Finished |
| **8A** RLS prod | Applied via `db push --db-url` pooler (see `_db-push-prod-rls.txt`) | verify query |
| **10C** pin_id smoke | Staging REST `select=id,pin_id` **200**; `/api/v1/couples/active` **401** unauth (expected) | Schema gate PASS; logged-in upload E2E still needs QA account |
| **12A** Sheet01/16 | Master **375** DM IDs; **67** mentioned in docs/.ai; **22** dedicated `DM-*.md`; EXT **85** Done; **85** lack EXT-id-named evidence file | `FIX26-002-003-map.json` |
| **3B** OSM GA | Code already falls back to `CoupleOsmCanvas` when no Mapbox token — GA policy = keep token unset | CoupleMapClient.tsx |
| **1C** Backups | Staging+prod physical backups COMPLETED daily; **PITR=false**; dump tool needs Docker (blocked locally) | Management API backups list |
| **9C** DB password | Founder self-resets on Dashboard — treat rotated `.ai/prod-db-password*.txt` as temporary until reset | — |

## Partial / blocked on Founder assets

| Decision | Need |
|----------|------|
| **2B** Sentry/uptime | No Sentry auth in env. Create project at sentry.io → set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` on Vercel `deepmatch` Production env; uptime → hit `https://datingvn.com/api/health` |
| **4B** LIVE prep | Checklist only — no LIVE keys/charges |
| **5A** Store | `eas.json` ready; need ASC App ID (replace `REPLACE_ASC_APP_ID`), Apple/Google creds in EAS secrets |
| **7A** Legal | Waiting Founder/counsel sign `LEGAL_HUMAN_REVIEW_PACK` |
| **1C** Full restore | Need Docker **or** Supabase Dashboard restore-to-new-project; will not overwrite live staging without downtime window |

## LIVE PSP prep checklist (4B — no enable)
1. Choose PSP (Stripe/VN pay) + sandbox verified  
2. Merchant KYC + contract stored vault  
3. Webhook secrets in Vercel **not** committed  
4. Written GO before flipping `sandbox:false` / LIVE keys  
5. Tax/invoice SOP (still open)

## Store prep (5A)
1. Apple Developer + ASC app record → paste real `ascAppId`  
2. `eas secret:create` for credentials  
3. `eas build --profile preview` then TestFlight  
4. Play Internal testing track  

## Release
**NO-GO GA** unchanged. Staging CONDITIONAL continues.
