# Founder decisions (checklist answers) — 2026-10-26

| # | Choice | Meaning | Execution stance |
|---|--------|---------|------------------|
| 1 | **C** | Restore drill staging + prod snapshot read-only | Allowed (no traffic cut) |
| 2 | **B** | Auto-create Sentry/uptime → Vercel staging | Cursor execute |
| 3 | **B** | GA = **OSM only** (no paid Maps) | Product/GA policy |
| 4 | **B** | Prepare LIVE PSP; **no real charges** | Prep only |
| 5 | **A** | ASC + Play + signing for TestFlight/Internal | Needs account access/creds |
| 6 | **B** | Branch protection: CI required + no force-push | Cursor via `gh` |
| 7 | **A** | Legal counsel/Founder will review+sign pack | Waiting human |
| 8 | **A** | RLS `matching_rule_versions`: staging first, then prod | Cursor staging now |
| 9 | **C** | Founder resets DB password on Dashboard | Cursor must not assume old rotated files |
| 10 | **C** | Priority: QA E2E pin_id / couple memories staging | Cursor now |
| 11 | **A** | **NO-GO GA**; staging CONDITIONAL OK | Release stance |
| 12 | **A** | Cursor may read Sheet 01 + 16 for DM/EXT gaps | Cursor now |

**Release:** NO-GO for GA unchanged.
