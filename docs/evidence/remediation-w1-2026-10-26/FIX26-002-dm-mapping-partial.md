# FIX26-002 — DM task mapping (PARTIAL) 2026-10-26

**Status:** IN_PROGRESS / PARTIAL  
**AC:** 100% of 374 Master DM IDs mapped or N/A — **not met**

## Repo-side inventory
- `docs/**/DM-*.md` unique-ish files: **22** (not 374)
- Implies Master Sheet 01 holds the full 374; most IDs lack dedicated evidence markdown

## Sample mapped (path exists)
DM-001…010, 013–017, 020, 022, 065, 073, 079 (see docs/p0–p2)

## Method to finish (PMO)
1. Export Sheet 01 CSV  
2. Join on `DM-###` → path|test|N/A_reason  
3. Flag Done-without-evidence

**Blocker:** need Sheet 01 export access continuity + PMO time (~5d per plan). Cursor cannot assert Master Done status fidelity without CSV.
