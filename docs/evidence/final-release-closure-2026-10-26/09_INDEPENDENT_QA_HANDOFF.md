# 09 — Independent QA Handoff

**Cursor implementer ≠ Independent Verifier.**  
This pack prepares a separate person/team to produce VERIFIED.

## Release candidate under test

| Field | Value |
|-------|-------|
| Git SHA | `1b782580eaf47260e2067b4aaa7ea47a20813f37` |
| Branch / PR | `feat/w2-core-member-wp1-3` / PR #3 |
| Staging web | https://datingvn.com |
| Supabase staging | `zzqpvjdyvjarpphqhaze` |
| Binary | **None** — request Founder EAS artifacts before device VERIFIED |

## Synthetic accounts

Use project `.ai/qa.env.ps1` credentials **on trusted machine only** (not committed).  
Do not use real user accounts.  
Preserve mutual QA match unless disposable seed created.

## Critical journeys (must pass for VERIFIED)

1. Signup → email verify → onboarding intents  
2. Media gate blocks Discover &lt;3 photos  
3. Age under-18 API FORBIDDEN  
4. Discover filters web+mobile  
5. Like → mutual → chat media  
6. Unmatch authz + optional disposable happy-path  
7. Block / report  
8. AI consent revoke sticks  
9. Couple OSM pin + private media ACL / post-unpair  
10. Lifestyle DEMO labeling  
11. Commerce sandbox cancel/refund (18 cases)  
12. Account deletion  
13. Public no-leak  
14. RLS cross-user deny matrix  

## Known issues to not re-open as PASS

- Suite SKIPPED via filter  
- Sentry offline  
- No device binary  
- LEAK suite incomplete historically  

## Expected outcomes recording

For each journey: PASS/FAIL, evidence URL, device/build, tester name, date.  
Only then may status become **VERIFIED** (Founder co-sign optional).
