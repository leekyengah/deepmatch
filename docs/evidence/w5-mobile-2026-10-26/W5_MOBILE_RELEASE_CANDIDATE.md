# W5 — Mobile & Store Release Candidate

**Date:** 2026-10-26  
**Wave status:** `IN_PROGRESS`  
**RELEASE_CANDIDATE_READY:** **NO**  
**GA:** **NO-GO**

## Checklist

| Item | Status | Notes |
|------|--------|-------|
| Mobile Unmatch UI | IMPLEMENTED | `apps/mobile/app/(tabs)/likes.tsx` — confirm + POST `/api/v1/matches/unmatch` + error/retry |
| Discover filters Web–Mobile | PARITY (code) | intent/age/region/q/strict — device QA pending |
| Onboarding / email / age / profile / match / chat / couple media | PARTIAL | Existing screens; full device matrix not run |
| Loading / empty / error / retry / offline | PARTIAL | Likes + Discover error/retry; offline banner incomplete |
| Navigation / deep link / permissions | PARTIAL | Expo Router; deep-link matrix pending |
| EAS preview builds | BLOCKED_EXTERNAL | Profiles in `eas.json`; ASC/Play secrets missing |
| iOS/Android signing | BLOCKED_EXTERNAL | `REPLACE_ASC_APP_ID` placeholder |
| TestFlight / Play Internal | BLOCKED_EXTERNAL | Needs credentials |
| Crash reporting | BLOCKED_EXTERNAL | Sentry DSN empty |

## Binary

**None produced.** Cannot mark `RELEASE_CANDIDATE_READY`.

## Founder actions for binary

1. Provide ASC App ID + Apple distribution cert / ASC API key to EAS  
2. Provide Play Console service account + upload keystore  
3. Set Sentry DSN for mobile  
4. Approve staging migration + preview channel build  
5. Human review + merge of PR #3 when CI green  
