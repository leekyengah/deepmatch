# FIX26-013 — CI/CD baseline vs AC (2026-10-26)

**Status:** PARTIAL / DONE_PENDING_QA  
**AC:** required checks + migration dry-run; protected main — **not met** (needs GitHub admin)

## What CI runs today (`.github/workflows/ci.yml`)
On push `main|develop` + PRs:
1. `npm ci || npm install`
2. Secrets guard (git grep patterns)
3. `npm run ci` → workspaces check + lint + typecheck + unit + build
4. Public no-leak smoke (`test:no-leak` against local start)

## Gaps vs AC
| Requirement | Status |
|-------------|--------|
| Required status checks on `main` | **UNVERIFIED** — needs `gh api` admin / org settings |
| Migration dry-run / gate | **MISSING** — no supabase migrate job in CI |
| E2E in CI | **MISSING** (Playwright local/scripts only) |
| Manual approval CD | **MISSING** — deploys via Vercel CLI/dashboard, not gated workflow |
| Separate CD workflow | **MISSING** |

## Safe next engineering steps (no prod change)
1. Founder enable branch protection: require `CI / verify`  
2. Add optional `supabase db lint` / SQL review job on PR (non-destructive)  
3. Keep production deploy human-gated

**This session:** documented baseline only; no workflow push to force protection (needs repo admin).
