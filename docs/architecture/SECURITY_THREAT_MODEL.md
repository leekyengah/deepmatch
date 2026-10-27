# DeepMatch — Security Threat Model

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Owner | Security |
| Updated | 2026-10-11 |
| Framework | OWASP ASVS 5.0 (target) |
| Related | `docs/p1/DM-014-threat-model-rls.md` |

## Threat register

| Threat | Priority | Control | Verification |
|---|---|---|---|
| IDOR private notes / journals | Critical | RLS author/shared | Unit ACL; integration DENY NOT_RUN |
| Ex-partner media after breakup | Critical | unpair + short signed URL | NOT_RUN |
| Spoofed identity | High | Supabase Auth session | PARTIAL |
| Chat harassment | High | block/report | Schema PARTIAL API |
| Exact location leak | Critical | fuzzy_region; lat/lng optional | Policy ADR-04 Accepted |
| Admin overreach | Critical | RBAC + audit deny-all clients | PARTIAL |
| Payment webhook forge | High | N/A until billing | MISSING |
| Malicious upload | High | MIME/size; private bucket | PARTIAL |
| Invite spam | High | hash + expiry + throttle | PARTIAL (no rate limit) |
| Credential stuffing | High | Supabase Auth protections | NOT_RUN |

## RLS posture

- 21 tables; 17 RLS enabled; 24 policies (baseline + follow-ups).
- Deny-by-default gaps: `media_objects`, `reports`, `service_offerings`, `admin_roles`, `feature_flags`, `matching_rule_versions`.
- Service role must never ship to client (CI secrets guard).

## Legal / compliance

Technical PASS ≠ legal complete. Vietnam PDPA-style review, age 18+, store policies: see `docs/p0/DM-007-legal-safety-checklist.md` (pending counsel).

## Gate G4 exit

No open Critical/High exploitable findings without waiver + Founder signoff.
