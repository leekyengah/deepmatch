# SERVICES_DATABASE_ERD (AS-IS + proposed)

## AS-IS

`service_offerings (id, title, description, active)`  
`service_bookings (id, offering_id, requester_id, pair_id, advisor_id, status, created_at, meta?)`  
`status ∈ requested|assigned|completed|cancelled`

## Proposed (staging migration only — not applied)

See SERVICE-001 §10 list. Prefer additive tables + package_versions; snapshot price into order at payment time.

**WRITE LOCK:** no migration executed on production in this task.
