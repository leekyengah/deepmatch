# Integration / RLS

Requires staging Supabase **user JWTs** (never commit). Service role is not used by the deny harness.

```bash
npm run test:integration
```

Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RLS_TEST_USER_A_JWT`, `RLS_TEST_USER_B_JWT`, `RLS_TEST_PRIVATE_NOTE_ID_A`.

Scenarios: `rls-scenarios.sql`, automated: `rls-deny.test.ts` (skips when env missing).
