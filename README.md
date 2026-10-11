# DeepMatch

Greenfield monorepo for DeepMatch first release: **Tìm nhau**, realtime chat (mutual-only), **Chúng mình** couple map, **Đồng hành**, personal dashboard, and Admin.

> Master Tracker: [Google Sheet](https://docs.google.com/spreadsheets/d/1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8/edit)  
> Gate G0 formal signoff: [`docs/p0/G0-SIGNOFF.md`](docs/p0/G0-SIGNOFF.md)  
> **Cursor does not self-approve production release.**

## Stack (Proposed ADR-02)

- `apps/web` — Next.js user PWA
- `apps/admin` — Next.js admin console
- `packages/shared` — matching engine, chat ACL, flags, brand
- `supabase/` — Postgres schema + RLS migrations

## Quick start

```bash
cp .env.example .env.local
npm install
npm run test -w @deepmatch/shared
npm run dev:web
# optional: npm run dev:admin
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run ci` | lint + typecheck + unit tests + build |
| `npm run test` | shared unit tests (matching/chat/age) |
| `npm run dev:web` | http://localhost:3000 |
| `npm run dev:admin` | http://localhost:3001 |

## Product hard rules

- No love-probability / EQ diagnosis scores
- Chat only after mutual like
- Mutual like does **not** create couple space
- Pair via dual-consent invite only
- No exact GPS in matching
- Admin least privilege + audit

## Docs

- P0 PRD/ADR: `docs/p0/`
- Platform: `docs/p1/`
- Evidence / handoffs: `docs/evidence/`
- Execution status: `.ai/execution-status.json`

## Environments

Use **separate** Supabase projects for staging vs production. Never commit secrets. Production deploy requires Founder + Safety GO (DM-058 / G6).
