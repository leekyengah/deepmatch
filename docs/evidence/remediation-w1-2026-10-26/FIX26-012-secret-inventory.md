# FIX26-012 — Secret scope inventory (no secret values) 2026-10-26

**Status:** PARTIAL / DONE_PENDING_QA  
**AC:** secret inventory + rotate; no secrets in evidence — inventory done; **rotate still requires Founder/Ops**

## Expected secrets by scope (from `.env.example` + ops docs — names only)

| Name | Staging | Prod | Client-exposed? | Notes |
|------|---------|------|-----------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | yes | yes | yes (URL only) | Public |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | yes | yes | yes | Anon |
| SUPABASE_SERVICE_ROLE_KEY | server | server | **never** | CI guard scans `ey` leak pattern |
| DATABASE_URL / DB password | migrate | migrate | never | **pin_id push blocked** — rotate if ever truncated in evidence |
| NEXT_PUBLIC_MAPBOX_TOKEN | optional | optional | yes if set | Restricted token required |
| AI provider keys | server | server | never | AI_ADAPTER |
| SENTRY_DSN | pending empty | pending | public DSN ok | FIX26-015 |
| PSP LIVE keys | **forbidden** | vault only after GO | never | EXT-040 |
| R2 keys | server | server | never | Cutover NO-GO historically |
| Vercel/GitHub tokens | CI/local | CI/local | never | |

## Controls present
- `.github/workflows/ci.yml` Secrets guard step  
- `.gitignore` for `.env*` / `.ai/prod*.txt` patterns (ops docs reference gitignored files)

## Findings this session
- Ripgrep for common secret patterns under `docs/evidence` flagged filename match on historical WAVE3 note; **no inline JWT/postgres/sk_live matches** in that scan path.  
- **Do not commit** `.ai/prod.env.ps1` / `prod-db-password.txt`.  
- **Action for Founder:** rotate DB password used for blocked `db push`; confirm Vercel env var scopes staging vs prod projects independently.

## Not done (blocked on access)
Dashboard inventory of every Vercel/Supabase secret value — requires owner login.
