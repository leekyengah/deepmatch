# SERVICES_RUNBOOK

## Flags

- `FF_CONCIERGE` — show `/services` marketplace
- `SERVICES_PAYMENT_LIVE` — must stay false until GO
- `SERVICES_BOOKING_LIVE` / `SERVICES_PROVIDER_ASSIGNMENT_LIVE` — reserved

## Common ops

- Hide marketplace: disable `ff_concierge`
- User bookings: `/bookings` + admin booking counts
- Catalog edit: update `companion-packages.ts` + Master tab32 in sync; do not silently change sale prices in prod without approval
