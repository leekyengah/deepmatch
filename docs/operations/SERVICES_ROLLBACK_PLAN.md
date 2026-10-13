# SERVICES_ROLLBACK_PLAN

1. Revert merge/commits on `feature/services-premium-concierge` (UI/catalog only).
2. Feature flag: set `FF_CONCIERGE=false` to hide marketplace.
3. No DB migrations shipped in this change set — no schema rollback required.
4. Payment: ensure `SERVICES_PAYMENT_LIVE` remains unset/false.
