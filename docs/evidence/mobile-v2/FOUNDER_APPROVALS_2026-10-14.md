# Founder approvals — 2026-10-14

Recorded from chat multiple-choice:

| # | Decision |
|---|---|
| 1D | Pursue all external blockers: Maps + LIVE payment + Store |
| 2B | Provision GCP + billing + restricted keys → G-GMAP-STAGING |
| 3B | Approve LIVE PSP + webhook + legal path (not yet activated until keys/config) |
| 4C | Pre-approve external spend up to **USD 20** (Preview/prod/EAS/Cloud within cap) |
| 5C | Founder manages QA vault accounts personally |
| 6C | Commit + PR Mobile V2 + home-state |

## Spend guardrail ($20)

Prioritize:
1. Google Cloud Maps/Places staging keys + budget alert ≤ $20  
2. EAS preview build only if remaining budget allows  
3. No uncapped Maps QPS; restrict key by HTTP referrer + API  
4. LIVE PSP: configure sandbox→live cutover docs first; **do not** process real charges until budget/legal checklist signed in Master tab24 G-PAY-LIVE

## Still required from Founder (credentials — not in git)

1. GCP project ID + billing account (cap $20) + Maps/Places API enable  
2. Restricted API key → Vercel env `NEXT_PUBLIC_GOOGLE_MAPS_*` / server key  
3. LIVE PSP credentials (Stripe or chosen provider) + webhook secret → Vercel  
4. Apple/Google store accounts for EAS submit (separate from $20 Cloud cap if paid seats)

Agent will not paste secrets into Master or git.
