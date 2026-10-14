# DEEPMATCH E2E QA REPORT — 2026-10-12

## Environment

- Local: `http://127.0.0.1:3000` (`NEXT_PUBLIC_APP_ENV=local`)
- Staging Supabase seed: `npm run seed:qa-matrix` PASS
- Playwright default base remains staging; local runs use `E2E_BASE_URL=http://127.0.0.1:3000`

## JOURNEY matrix (this wave)

| Journey | Status | Evidence |
|---|---|---|
| J12 Public homepage no-leak | PASS | `npm run test:no-leak` + `tests/e2e/no-leak-public.spec.ts` |
| J01 Guest → Registration | NOT_RUN (prior smoke covers pages) | `tests/e2e/smoke.spec.ts` |
| J02–J11 | PARTIAL / prior | Continue next wave |

## Commands

```bash
npm run seed:qa-matrix
npm run test:no-leak -- http://127.0.0.1:3000
E2E_BASE_URL=http://127.0.0.1:3000 npx playwright test tests/e2e/no-leak-public.spec.ts
```

## QA accounts (staging)

See `.ai/qa-seed.json` (emails only). Passwords in `.ai/qa-matrix.env.ps1` (gitignored).
Admin/moderator/advisor not auto-granted.
