# SERVICES_TEST_PLAN

Mandatory scenarios from SERVICE-001 §12 — status:

| # | Scenario | Status |
|---|---|---|
| 1–5 | Guest/login/filter/compare/wizard | PARTIAL (manual after staging) |
| 6–10 | Booking request/reject/accept/expiry/conflict | PARTIAL (API exists; conflict NOT_TESTED) |
| 11–15 | Payment success/fail/pending/replay/bad sig | BLOCKED (LIVE off; stub only) |
| 16–20 | Refund/cancel/network/refresh | NOT_TESTED |
| 21–27 | AuthZ/IDOR/XSS/version/a11y | PARTIAL |
| 28–30 | i18n/return/recovery | PARTIAL |

Automated: `booking-states` unit test in web package (this branch).
