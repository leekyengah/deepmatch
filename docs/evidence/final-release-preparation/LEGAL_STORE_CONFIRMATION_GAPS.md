# Legal / Store fields needing Founder or Counsel confirmation

**Draft sources:** `APPLE_APP_PRIVACY.md` · `GOOGLE_PLAY_DATA_SAFETY.md` · `STORE_SUBMISSION_PACK.md`  
**Status:** engineering truth tables only — **not** legal signoff

## Apple App Privacy (ASC)

| Field / question | Eng draft | Needs Founder/Legal |
|------------------|-----------|---------------------|
| Data collected: email, name, user ID, photos | Yes / linked / not tracking | Confirm vs live binary |
| Precise location | No | Confirm no SDK adds GPS |
| Crash / performance | **Not collected** (no Sentry DSN) | Re-open if Sentry enabled |
| Tracking / ATT | No | Confirm no ad SDK |
| Privacy Policy URL | staging `datingvn.com/privacy` | Production domain at submit |
| Account deletion | In-app + web | Confirm 5.1.1 wording |
| Age rating / 18+ | 18+ only | Counsel + questionnaire |
| IAP / payments declaration | IAP id `premium_monthly`; LIVE PSP off | Confirm purchase labels |
| UGC (chat, photos, reports) | User-generated; block/report exist | Safety questionnaire answers |
| Export compliance | `ITSAppUsesNonExemptEncryption: false` | Counsel confirm |

## Google Play Data Safety

| Field | Eng draft | Needs Founder/Legal |
|-------|-----------|---------------------|
| Collect / share data | Yes collect; share to processors | Form 1:1 alignment |
| Encryption in transit | Yes | Confirm |
| Deletion | Yes path live | **FAR-12** SLA capacity before public claim |
| Independent security review checkbox | Leave unchecked | Until Independent QA signed |
| Photos / financial / location categories | As draft table | Counsel |
| Families policy | Not designed for families | Confirm 18+ |
| Permissions CAMERA / photos | Profile | Confirm Play declarations |

## Account deletion

| Item | Status | Owner |
|------|--------|-------|
| Web `/account-deletion` + API confirm=`DELETE` | Implemented | Eng |
| In-app Me → Delete | Implemented | Eng |
| Ops retention ≤30d runbook | **OPEN** | Ops / Legal (FAR-12) |
| Store copy promising SLA | **Do not publish** until FAR-12 | Founder |

## Billing / commercial

| Item | Status | Owner |
|------|--------|-------|
| LIVE PSP | **HOLD** false | Founder (FAR-09) |
| Sandbox / CK / IAP path | Staging | Eng |
| Store billing compliance text | Draft only | Legal |
| SKU IAP vs offline split | Code maps exist | Founder+Legal before toggle |

## UGC / safety

| Item | Status | Owner |
|------|--------|-------|
| Block / report flows | Present | Independent QA spot-check |
| Moderation / CS contacts | Support URL draft | Founder fill |
| Reviewer notes | Template in store pack | FAR-07 accounts |

## Explicit non-claims until confirmed

- No push notifications / FCM  
- No Sentry crash collection on mobile  
- No LIVE card charging  
- No `RELEASE_CANDIDATE_READY` / GA GO  
