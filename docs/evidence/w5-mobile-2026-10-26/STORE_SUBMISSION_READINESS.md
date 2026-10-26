# Store Submission Readiness

**Date:** 2026-10-26  
**RELEASE_CANDIDATE_READY:** **NO**

## Mandatory blockers remaining

1. Real signed iOS/Android binaries (EAS) — missing ASC App ID / Play credentials  
2. Privacy nutrition labels + data safety forms signed by Legal/Founder  
3. Account deletion device proof  
4. Crash reporting DSN live  
5. Independent QA VERIFIED on security suite + unmatch happy-path with disposable fixture  
6. No LIVE PSP on store builds  

## Present (not sufficient)

- `eas.json` preview/production profiles  
- Staging API URL wired  
- Legal content package + routes  
- QA Core CI on PR  

## Rule

Do **not** submit to TestFlight/Play Internal until blockers 1–4 clear and Founder written GO. Parallel eng may continue preview builds when secrets arrive.
