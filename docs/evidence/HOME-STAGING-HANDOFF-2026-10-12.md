# HOME STAGING HANDOFF — 2026-10-12

## Deploy

- Project: `tradingbase/deepmatch`
- Deployment: `dpl_Ap7iSehEDTZJKF1cGi1frwWdwRGW`
- Alias: https://datingvn.com
- Commits included: `3cf1b2b`, `729c0d9` (+ prior branch WIP via working tree upload)

## Verification

| Check | Result |
|---|---|
| Hero “Mỗi kết nối…” | PASS |
| Staging footer absent | PASS |
| FAQ no `docs/ops` | PASS |
| `npm run test:no-leak -- https://datingvn.com` | PASS |

## Note

Deploy from **repo root** (monorepo `vercel.json`). Deploying `apps/web` alone fails workspace package resolve.
