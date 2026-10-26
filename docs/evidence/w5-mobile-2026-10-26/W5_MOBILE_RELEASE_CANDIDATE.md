# W5 — Mobile & Store Release Candidate

**Date:** 2026-10-26  
**Wave status:** `STARTED`  
**RELEASE_CANDIDATE_READY:** **NO**  
**GA:** **NO-GO**

## Checklist

| Item | Status | Notes |
|------|--------|-------|
| Web–Mobile feature parity | PARTIAL | Discover filters + mobile unmatch UI landed; device QA pending |
| EAS development/preview profiles | READY_FOR_QA (config) | `apps/mobile/eas.json` profiles exist |
| iOS/Android signing | BLOCKED_EXTERNAL | ASC App ID placeholder `REPLACE_ASC_APP_ID` |
| TestFlight / Play Internal | BLOCKED_EXTERNAL | Needs Apple/Google EAS secrets |
| Store metadata / screenshots / privacy | PARTIAL | Legal routes exist; screenshots pack incomplete |
| Account deletion / moderation | PARTIAL | API routes present; device E2E pending |
| Device E2E / crash reporting | BLOCKED_EXTERNAL | Sentry DSN empty; no device farm run |

## Independent work continued without credentials

- Keep Expo Go / LAN API pointing at staging `https://datingvn.com`  
- Do not submit store binaries until signing + privacy pack signed  
- Mobile discover filters / unmatch UI remain next eng slices  

## Binary

**None produced this wave.** Cannot mark `RELEASE_CANDIDATE_READY`.
