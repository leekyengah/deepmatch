# SERVICES_API_CONTRACTS (logical)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/services` (page) | session (app shell) | IMPLEMENTED |
| GET | `/services/:slug` | session | IMPLEMENTED |
| GET | `/services/recommend` | session | IMPLEMENTED |
| GET | `/api/v1/services/offerings` | flag | IMPLEMENTED |
| GET/POST | `/api/v1/services/bookings` | user | IMPLEMENTED (basic) |
| POST | `/api/v1/services/recommendations` | — | NOT_STARTED (wizard client-side) |
| POST | payment-session | — | STUB adapter only |

OpenAPI export: pending Gate4.
