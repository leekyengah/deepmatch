# Production RLS audit — `matching_rule_versions` (READ-ONLY)

**Audit time:** 2026-10-26 (continuation wave)  
**Mode:** SELECT-only against prod DB via pooler · **no DDL / no further prod changes**  
**GA:** NO-GO (unchanged)

## What changed

| Field | Value |
|-------|--------|
| Migration file | `supabase/migrations/20261026140000_matching_rule_versions_rls.sql` |
| Git commit containing file | **NONE** — file is **untracked** on working tree; HEAD remains `6ec50c72` |
| Applied on prod | Yes — `supabase_migrations.schema_migrations` row `20261026140000` / `matching_rule_versions_rls` |
| Approximate apply window | 2026-10-26 ~14:28–14:29 ICT (session terminal evidence `704007`) |
| Staging | Same migration applied earlier same day |

## Live prod policy state (queried)

| Check | Result |
|-------|--------|
| `relrowsecurity` | **true** |
| `relforcerowsecurity` | **false** (table owners / bypass roles still bypass unless FORCE) |
| Policies | `matching_rule_versions_select_staff` (SELECT) · `matching_rule_versions_write_staff` (ALL) |
| Predicate | `has_admin_role(ARRAY['owner','admin']::admin_role[])` |
| Row count | **0** |
| Anon REST `GET /rest/v1/matching_rule_versions?select=id,version` | **HTTP 200 `[]`** (deny-by-default empty — expected under RLS) |

## Application / API impact

- **No application TypeScript** references `matching_rule_versions` (grep apps/packages = migration/docs only).
- Matching engine weights remain **code-local** (`packages/shared` engine) — docs already noted DB versions PARTIAL / unused.
- Expected impact on member APIs: **none** (table unused by runtime paths).
- Staff/admin UI that might later read this table via anon key would see empty until staff JWT + `has_admin_role`; `service_role` still bypasses RLS.

## Rollback capability (documented only — not executed)

1. **Preferred:** new forward migration: `drop policy …; alter table … disable row level security;` (keeps history).  
2. **Emergency SQL (Founder-approved):** disable RLS + drop the two policies on prod.  
3. **Do not** `migration repair` / rewrite history without Ops plan.  
4. Schema dump / PITR: **PITR=false** on project; rely on daily physical backups (see DR plan).

## Risks / findings

1. **Drift:** prod/staging schema ahead of **git HEAD** (migration uncommitted) — P0 process debt.  
2. Overlapping SELECT + ALL policies for staff is redundant but not incorrect.  
3. Empty table → cannot observe row-level deny of non-staff authenticated users with real rows (recommend seed inactive version on staging only for LEAK test).

## Verdict

| Status | `READY_FOR_QA` |
|--------|----------------|
| DONE_VERIFIED | **No** — independent QA not signed; git commit missing |

**Acceptance for DONE_VERIFIED (future):** commit migration to `master` · CI green · LEAK probe authenticated non-staff → 0 rows · Founder/Security sign.
