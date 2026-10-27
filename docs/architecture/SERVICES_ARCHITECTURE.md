# SERVICES_ARCHITECTURE — Premium Concierge Marketplace

## Principles

- Catalog source: versioned `companion-packages.ts` aligned to Master tab32.
- Booking: reuse `service_bookings` + `meta.lifecycle` until ADR migration.
- Payment: `payment-adapter.ts` stub; `SERVICES_PAYMENT_LIVE` default false.
- Partner confirm before full charge (tab33 CP-08) — enforced in product policy; full automation PARTIAL.

## Components

| Layer | Module |
|---|---|
| UI | `ConciergeMarketplace`, `RecommendWizard`, detail `[slug]` |
| Domain | `companion-packages`, `booking-states`, `payment-adapter` |
| API | `/api/v1/services/bookings`, offerings, checkout sandbox |
| Flags | `ff_concierge`, `SERVICES_*_LIVE` |

## Non-goals (this branch)

- Production migration
- LIVE PSP activation
- Auto production deploy
