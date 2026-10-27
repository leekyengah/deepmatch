# Founder — Release Action Checklist

**GA:** NO-GO · **RC ready:** NO · **Do not self-merge without human review**

## Done by eng (staging)

- [x] Commerce migrations applied on **staging only** (`zzqpvjdyvjarpphqhaze`)
- [x] Sandbox E2E commerce **18/18 PASS** on datingvn.com (`dpl_C6PSEBne…`)
- [x] PR #3 CI green at `008ca3f` (verify + QA Core)
- [x] Admin `/commerce` code + rollback SQL documented
- [x] EAS `preview` profile prepared for Android APK (EAS-managed keystore)

## Founder actions — database

| # | Action | Notes |
|---|--------|-------|
| 1 | Acknowledge staging migration applied | Enum + `commerce_audit_log` + staff RPCs |
| 2 | **Do not** push same migrations to `iofrimcbvqrhefqkkyrx` until GO | Prod untouched |
| 3 | Optional: enable PITR on staging | Currently PITR=false |

## Founder actions — merge / deploy governance

| # | Action |
|---|--------|
| 4 | Human review PR #3 → merge when ready |
| 5 | Close superseded PR #2 if still open |
| 6 | Confirm datingvn.com remains staging topology (`productionDeploy=false`) |

## Founder actions — mobile binary (no secrets in chat)

| # | Action |
|---|--------|
| 7 | On trusted machine: `cd apps/mobile && npx eas build -p android --profile preview` → accept **EAS-managed keystore** |
| 8 | Create ASC app for `com.datingvn.deepmatch`; set real `ascAppId` |
| 9 | Upload Apple dist cert / ASC API key into EAS (UI, not chat) |
| 10 | Create Play app + grant EAS service account when submitting |
| 11 | Set Sentry DSN (Vercel + EAS env) |
| 12 | Sign privacy nutrition / data safety forms |
| 13 | Provide / rotate App Store reviewer demo account **out of band** |

## Founder actions — commerce product

| # | Action |
|---|--------|
| 14 | Spot-check Admin `/commerce` refund queue (approve/deny sandbox) with staff login |
| 15 | Confirm LIVE PSP stays OFF for GA |
| 16 | Confirm digital vs offline SKU split before any IAP toggle |

## Explicit non-actions

- No DONE_VERIFIED self-claim  
- No Store submit  
- No LIVE refund/charge  
- No production DB migration without written GO  
