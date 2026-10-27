# Security Spot-check (Staging)

**Scope:** Controlled negative API tests only. No fuzz/DDoS/prod writes.

| Check | Result | Detail |
|-------|--------|--------|
| GET `/api/v1/discovery/candidates` unauth | PASS | `401` + `UNAUTHENTICATED` JSON |
| POST `/api/v1/likes` unauth | PASS | `401` |
| GET `/api/v1/me/profile` unauth | PASS | `401` |
| GET `/api/v1/health` | PASS | `200` staging |
| Client `service_role` string in apps | NOT FOUND this pass | Continue Secrets guard |
| Dual-account IDOR chat/media | NOT_TESTED | Needs QA JWT pair |
| RLS SQL matrix | NOT_TESTED this pass | Prior evidence exists under release-unblock |

**No P0 security exploit demonstrated this pass.** Residual: complete dual-account LEAK matrix on staging.  
