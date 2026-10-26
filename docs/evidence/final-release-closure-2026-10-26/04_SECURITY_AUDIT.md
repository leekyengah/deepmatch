# 04 — Security Audit (engineering snapshot)

**Not Independent Security Assessment.** Ceiling: automated + code review.

## Findings by severity

| Sev | ID | Finding | Status |
|-----|-----|---------|--------|
| Critical | SEC-LEAK-SUITE | Full LEAK/IDOR matrix not independently re-verified | OPEN · residual |
| High | SEC-SENTRY | Sentry DSN empty — crash monitoring not live | BLOCKED_EXTERNAL |
| High | SEC-PROD-MIG | Commerce migrations applied staging only; prod push needs GO | BLOCKED_EXTERNAL |
| Medium | SEC-UNMATCH-DEPTH | Destructive unmatch E2E deferred to protect fixture | ACCEPTED_RISK (eng) until disposable seed |
| Medium | SEC-ADMIN-MOBILE | Admin surfaces must not ship in public Member binary | OPEN · product decision |
| Low | SEC-SUITE-FILTER | SKIPPED noise from suite filter can mislead dashboards | Documented |
| Info | SEC-CI-GUARD | secrets-guard + branch protection (no force-push) | PASS automated |

## Controls observed PASS (staging)

- Public path gating + email soft-verify middleware  
- Discover/likes age + email gates  
- Accept RLS peer/private_note/booking deny  
- AI assist/deepmind honor `revoked_at`  
- Commerce cross-user deny + LIVE flag off in sandbox E2E  
- Media signed upload path in accept  

## PII / telemetry

- Sentry init no-ops without DSN; when enabled must redact messages/media (policy residual for Founder config review).  
- Do not log JWTs / private notes / media URLs in evidence.

## RLS coverage

- Staging accept + `rls_deny` runner: **PASS** subset.  
- Full table matrix: **NOT VERIFIED**.

## Residual risk owner

Security / Founder Independent reviewer — see `11_RESIDUAL_RISK_REGISTER.md`.
