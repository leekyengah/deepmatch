# Founder Android UAT — 12 cases

**Status:** READY · eng host did not run device install  
**APK build:** `fe0ad595-3bce-4624-b8c5-9b0fea50e56a`  
**Install:** https://expo.dev/accounts/kyengah/projects/deepmatch/builds/fe0ad595-3bce-4624-b8c5-9b0fea50e56a  
**Direct APK:** https://expo.dev/artifacts/eas/hYl74cZ7b20Gm7O-Be8wdHdNIzs2GNlmaiNnVo2T_qc.apk  
**Local (optional):** `artifacts/android-preview/deepmatch-preview-fe0ad595.apk`  
**SHA-256:** `DCD2A0AE9212730162FB74E7A83FAA0520BDB96780193F05813A3BE2AD42B4C7`  
**Package:** `com.datingvn.deepmatch` · `1.0.0` (versionCode `1`) · staging API `https://datingvn.com`

## Synthetic accounts (password out-of-band)

| Role | Email | Password |
|------|-------|----------|
| UAT A (discoverable / chat) | `reviewer_a@deepmatch.test` | **1Password / sealed note** from `.ai/reviewer.env.ps1` on build machine (FAR-07) |
| UAT B (mutual with A) | `reviewer_b@deepmatch.test` | same sealed note |
| Disposable delete only | `reviewer_delete@deepmatch.test` | same sealed note |

Do **not** use automation pair `qa_a@` / `qa_b@` for destructive unmatch/delete.

## Suite PASS / FAIL

- **PASS (Founder UAT):** All 12 cases Pass or N/A with reason; zero open P0; SHA-256 confirmed.  
- **FAIL:** Any P0 crash/blocker, wrong env (prod), live charge, or data leak.  
- **Outcome ≠ Independent QA VERIFIED** and ≠ GA GO.

## Defect template (copy per bug)

```text
ID: DEF-AND-###
Severity: P0 | P1 | P2
Case #: 
Device / OS:
Steps:
Expected:
Actual:
Screenshot / video:
Regression after fix:
```

## 12 test cases

| # | Case | Steps | Expected | ☐ |
|---|------|-------|----------|---|
| 1 | Cold launch | Install APK → open app | Splash → auth or tabs; **no crash** | |
| 2 | Login | Sign in as Reviewer A | Lands on **member tabs** (not stuck on login) | |
| 3 | Logout | Me → Logout | Returns to welcome/auth; session cleared | |
| 4 | Age / onboarding | New or incomplete profile path | 18+ gate respected; onboarding completable | |
| 5 | Profile | Edit display name / save | Persists after relaunch | |
| 6 | Discover filters | Open Discover; change age/region/intent if UI allows | Results or clear empty reason; no spinner forever | |
| 7 | Match surface | Open Likes/Matches with A (mutual B seeded) | Mutual visible; no crash | |
| 8 | Unmatch confirm | Unmatch a **disposable** match only | Confirm dialog; success or clear error; **do not** unmatch automation QA fixture | |
| 9 | Chat | Open thread A↔B; send text | Message appears; no crash | |
| 10 | AI Concierge + consent | Open Concierge/services; if prompted, accept or revoke | Consent respected; revoke sticks | |
| 11 | Love Map / media | Open places/map; optional photo permission | Map or configured empty; permission rationale OK | |
| 12 | Privacy + deletion entry | Me → legal links; open Delete on **disposable** account only | Account-deletion flow reachable; **stop before** confirming DELETE unless intentional | |

## Evidence to return

1. Checked SHA-256 or EAS build ID used.  
2. Filled ☐ column + device model/OS.  
3. DEF-* for failures.  
4. Optional: 3–5 screenshots (login, discover, chat).  
