# QA Regression Report — 2026-10-26 continuous delivery

**GA stance:** NO-GO  
**Verified:** none (automated only)

## Track A — Remediation

| Check | Result |
|-------|--------|
| Staging SHA vs unmatch | datingvn.com was `dpl_9tjK9Bu2…` (**404** unmatch) vs code since `1f000b8` |
| Staging redeploy | `dpl_72CP7LZHbNgNVMfaxFYy4wLGTiYN` → datingvn.com · `productionDeploy:false` |
| Unmatch guest | **401 UNAUTHENTICATED** JSON |
| DM-QA-W2-006 | **PASS** (`qa-…76b1e218`) |
| `--suite security` | **PASS** rls_deny (`qa-…40f1a5e2`) |
| Sheet 53 FIX26-028 | R=`QA_PASSED_AUTOMATED` (narrow write) |

## Suites snapshot

| Suite | PASS | FAIL | BLOCKED | INCONCLUSIVE | SKIPPED |
|-------|-----:|-----:|--------:|-------------:|--------:|
| w2 post-deploy | 7 | 0 | 0 | 0 | 10 |
| security | 1 | 0 | 0 | 0 | 16 |
| w3 AI unit | 1 | 0 | 0 | 0 | — |

## Classifications

- Prior unmatch INCONCLUSIVE = **environment deploy lag** (resolved)  
- A-001 family still required before GA GO  
- H-001 Playwright still non-blocking for eng continue  

## Prod

**No production project writes** (`deepmatch-prod` untouched).
