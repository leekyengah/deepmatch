-- ARCH-03 RLS deny scenarios (manual / staging)
-- Run as service role to seed, then verify as user JWTs via PostgREST.

-- Expect: SELECT private_notes as non-author with shared_with_partner=false → 0 rows
-- Expect: SELECT audit_logs as authenticated user → 0 rows (deny-all)
-- Expect: SELECT pins for unpaired pair → 0 rows (is_pair_member false)
-- Expect: INSERT messages into conversation without mutual membership → fail

-- Seed helpers (do not commit real UUIDs into CI secrets):
-- 1) create users A/B via Auth
-- 2) insert private_notes for A unshared
-- 3) export RLS_TEST_* env for tests/integration/rls-deny.test.ts
