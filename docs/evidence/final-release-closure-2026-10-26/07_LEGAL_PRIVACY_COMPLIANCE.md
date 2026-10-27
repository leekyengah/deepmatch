# 07 — Legal / Privacy Compliance (engineering inventory)

**Legal approval status:** **Pending** (Founder / counsel)  
**Cursor does not provide final legal opinion.**

## In-app / web surfaces present

| Doc | Route / package | Notes |
|-----|-----------------|-------|
| Legal hub | `/legal` | Index |
| Privacy / Terms / Community / Child safety / Couple / Subscriptions / AI / Services / Delete | `/legal/[slug]` + `@deepmatch/legal-content` | Content package exists |
| Account deletion in-app | `/account-deletion` + `POST /api/v1/me/delete` | Soft-anonymize + auth delete |
| Age 18+ | Signup + API gates | No ID document collection |
| AI consent | assist/deepmind + privacy revoke | Revoke stickiness fixed |
| Consent ledger | `consent_events` at signup | Ads not bundled |

## Store disclosures

| Form | Status |
|------|--------|
| Apple App Privacy | **Pending** Founder nutrition labels vs real SDKs |
| Google Data Safety | **Pending** — delete request path must match Play policy |
| Reviewer notes / demo account | **Pending** out-of-band |

## Retention / deletion SLA

Engineering target ≤30 days processing exists as product intent — **do not publish SLA** until operational capacity evidenced (jobs, backups, support runbook). Current: **not evidenced**.

## Gaps vs schema/SDK

- Sentry/analytics DSN empty → disclosure must stay truthful when enabled.  
- Push (APNs/FCM) not live → do not claim push in privacy forms until configured.  
- LIVE PSP off → payment retention claims limited to sandbox/CK.
