# Founder Action Pack — DeepMatch Handoff

**Date:** 2026-10-27  
**GA / RELEASE_CANDIDATE_READY:** **NO-GO / NO** (unchanged)  
**Baseline APK:** `fe0ad595` · Eng push `3132fe3` · PR #3 CI green, not merged  

Each item: URL/file · Action · Owner · Evidence to return · Done when · Blocker

---

### FAP-01 — Android Founder UAT (12 cases)

| | |
|--|--|
| **URL / file** | APK: https://expo.dev/accounts/kyengah/projects/deepmatch/builds/fe0ad595-3bce-4624-b8c5-9b0fea50e56a · Cases: `FOUNDER_ANDROID_UAT.md` · SHA `DCD2A0AE9212730162FB74E7A83FAA0520BDB96780193F05813A3BE2AD42B4C7` |
| **Action** | Install preview APK; run all 12 cases; file DEF-* for failures |
| **Owner** | Founder (or delegate) |
| **Evidence to return** | Filled checklist + device/OS + SHA confirm + defects |
| **Done when** | 12/12 Pass or documented N/A; zero open P0 |
| **Blocker** | Physical Android device; unknown-sources install |

---

### FAP-02 — Independent QA engagement

| | |
|--|--|
| **URL / file** | `INDEPENDENT_QA_HANDOFF.md` · `../release-unblock-2026-10-26/INDEPENDENT_QA_PACKAGE.md` · security `qa-…-d64bc81b` |
| **Action** | Assign Independent QA Lead; run web/API/security + Android pack; sign template |
| **Owner** | Independent QA Lead |
| **Evidence to return** | Signed signoff block (PASS/FAIL + SHA + recommendation) |
| **Done when** | Signed recommendation RECOMMEND_FOUNDER_REVIEW or NO-GO |
| **Blocker** | Human reviewer calendar; staging access |

---

### FAP-03 — Reviewer / UAT credentials (FAR-07)

| | |
|--|--|
| **URL / file** | Emails seeded: `reviewer_a@deepmatch.test`, `reviewer_b@deepmatch.test`, `reviewer_delete@deepmatch.test` · Password **only** in gitignored `.ai/reviewer.env.ps1` on seed host · Guide: `../release-unblock-2026-10-26/REVIEWER_GUIDE.md` |
| **Action** | Copy password from seed host into **1Password / sealed note**; share with UAT + Independent QA; never paste into Sheet/git |
| **Owner** | Founder / QA Ops |
| **Evidence to return** | Confirmation “credentials vaulted” (no secret value) |
| **Done when** | Reviewers can log in on staging web + Android |
| **Blocker** | None for seed (DONE_ENGINEERING); vault handoff is Founder |

---

### FAP-04 — Apple / ASC / iOS device or TestFlight (FAR-13 / FAR-04)

| | |
|--|--|
| **URL / file** | Bundle `com.datingvn.deepmatch` · EAS `@kyengah/deepmatch` `af381d32-…` · Simulator only: https://expo.dev/accounts/kyengah/projects/deepmatch/builds/72114bb8-a637-4170-a413-11963a839b94 · `eas.json` still `ascAppId=REPLACE_ASC_APP_ID` · `IOS_READINESS.md` |
| **Action** | Confirm Apple Developer membership; create ASC app; set ASC App ID; configure EAS iOS creds (MFA by Founder if prompted); **only then** device `preview` build. TestFlight Internal **only** after explicit Founder approval — **do not** use simulator `.tar.gz` as TestFlight substitute |
| **Owner** | Founder |
| **Evidence to return** | ASC App ID · device/TestFlight build URL · (no private keys) |
| **Done when** | Device or TestFlight Internal binary installable |
| **Blocker** | **BLOCKED_EXTERNAL** — ASC ID missing; credentials CLI interactive/MFA; **no TestFlight approval on record** → eng did **not** start store-distribution iOS build |

---

### FAP-05 — Apple App Privacy counsel (FAR-05)

| | |
|--|--|
| **URL / file** | `../release-unblock-2026-10-26/APPLE_APP_PRIVACY.md` · gaps: `LEGAL_STORE_CONFIRMATION_GAPS.md` |
| **Action** | Counsel signs nutrition labels vs live binary; amend if Sentry/push added |
| **Owner** | Founder / Legal |
| **Evidence to return** | Signed draft or ASC form screenshots |
| **Done when** | Counsel OK to submit labels |
| **Blocker** | Legal calendar; binary for final confirm |

---

### FAP-06 — Google Play Data Safety (FAR-06)

| | |
|--|--|
| **URL / file** | `../release-unblock-2026-10-26/GOOGLE_PLAY_DATA_SAFETY.md` · `LEGAL_STORE_CONFIRMATION_GAPS.md` |
| **Action** | Align Play Console form; do not claim delete SLA until FAR-12 |
| **Owner** | Founder / Legal |
| **Evidence to return** | Form draft signed / Console export |
| **Done when** | Counsel OK |
| **Blocker** | Play Console app listing; FAR-12 ops |

---

### FAP-07 — Account deletion SLA ops (FAR-12)

| | |
|--|--|
| **URL / file** | Web `/account-deletion` · API delete confirm · `07_LEGAL` packs |
| **Action** | Prove retention/deletion ops capacity ≤30d before public SLA copy |
| **Owner** | Ops / Legal |
| **Evidence to return** | Runbook + one disposable delete drill note |
| **Done when** | Ops sign capacity |
| **Blocker** | Jobs/backups unproven |

---

### FAP-08 — PR #3 merge gate (FAR-01)

| | |
|--|--|
| **URL / file** | https://github.com/leekyengah/deepmatch/pull/3 · `PR3_MERGE_READINESS.md` |
| **Action** | After Independent QA + Android UAT: human approve + merge (**Founder only**) |
| **Owner** | Founder |
| **Evidence to return** | Merge commit SHA |
| **Done when** | PR merged under protection rules |
| **Blocker** | mergeStateStatus=BLOCKED until reviews; Independent QA missing · **Cursor will not merge** |

---

### FAP-09 — Hold LIVE PSP & store submit (FAR-09 / FAR-10)

| | |
|--|--|
| **URL / file** | Commerce sandbox evidence · Store packs |
| **Action** | Keep `LIVE_PSP=false`; no public App Store / Play submit |
| **Owner** | Founder |
| **Evidence to return** | Written HOLD acknowledgement (optional) |
| **Done when** | Continues HOLD until legal+ops+QA |
| **Blocker** | N/A — intentional stop |

---

### FAP-10 — GA NEW RELEASE decision (FAR-14)

| | |
|--|--|
| **URL / file** | Master sheet 24 + 55 · this pack |
| **Action** | After FAP-01..08: Founder sets GO or NO-GO |
| **Owner** | Founder |
| **Evidence to return** | Sheet 24 update |
| **Done when** | Explicit Founder decision |
| **Blocker** | Gates incomplete · eng must not flip GA |

---

## Engineering completed this handoff

- Reviewer accounts seeded on staging (passwords gitignored).  
- Founder Android UAT 12-case pack.  
- Independent QA handoff + signoff template.  
- Legal/store confirmation gap list.  
- PR #3 readiness documented (no merge).  
- Apple/TestFlight: verified EAS login `kyengah`, project ID, bundle ID; **ASC placeholder**; no TestFlight approval → no store-distribution iOS build started.  
- Master 53–55 updated.  

**Contacts for secrets:** deliver `.ai/reviewer.env.ps1` password via 1Password only.  
