# Mebertes synthetic cohort (2026-10-27)

## Policy
- Synthetic personas only (`*@deepmatch.test`).
- Taxonomy from Drive **folder/file names** under `1ZZnqjZ996GmAVX6pGn9YzKlmCDmUPlgh` — **no Excel cell/PII import**.
- Marked `profiles.cohort = 'Mebertes'` + `seed_cohort_registry`.
- Discover: `discovery_opt_in=true`, `hidden_from_discovery=false`.
- Purge only with CEO flags after optional real-user threshold.

## Commands (staging)
```bash
# Apply migration 20261027150000_mebertes_cohort.sql first

MEBERTES_ALLOW_SEED=1 node --env-file=.env.local scripts/seed-mebertes.mjs --dry-run
MEBERTES_ALLOW_SEED=1 node --env-file=.env.local scripts/seed-mebertes.mjs --count=50
MEBERTES_ALLOW_SEED=1 node --env-file=.env.local scripts/seed-mebertes.mjs --count=5000

MEBERTES_ALLOW_PURGE=1 node --env-file=.env.local scripts/purge-mebertes.mjs --ceo-approve --confirm=Mebertes
MEBERTES_ALLOW_PURGE=1 node --env-file=.env.local scripts/purge-mebertes.mjs --ceo-approve --confirm=Mebertes --require-real-users=10000 --execute
```

Password vault: `.ai/mebertes.env.ps1` (gitignored).
