# SERVICES-001 Approvals — 2026-10-13

| Item | Decision | Notes |
|---|---|---|
| Staging deploy | **APPROVED** | Preview deploy authorized |
| Visual signoff vs mockup | **APPROVED** (Founder) | Treat design direction as signed; visual regression matrix still recommended post-deploy |
| Legal cancel/refund copy | **APPROVED** (Founder) | Use existing booking/legal policy links; do not invent new SLA numbers |
| LIVE payment (dual) | **APPROVED pending provider** | Dual approval recorded. `SERVICES_PAYMENT_LIVE` remains **false** until a real PSP adapter is registered (stub throws if LIVE=true) |
| Founder GO for G6 | **APPROVED** | Production web deploy of Concierge Marketplace authorized; no prod DB migration; no LIVE charge |

**Still blocked for true payment LIVE:** PSP adapter wiring + webhook secrets + sandbox reconciliation evidence.
