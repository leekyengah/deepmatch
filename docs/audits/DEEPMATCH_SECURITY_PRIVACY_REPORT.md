# DEEPMATCH SECURITY / PRIVACY REPORT — 2026-10-12 (EXT-038)

Scope: staging `datingvn.com` + Supabase project `zzqpvjdyvjarpphqhaze`. No production LIVE charges.

## Fixed leaks (verified)

| ID | Issue | Fix | Result |
|---|---|---|---|
| LEAK-01 | Staging footer on `/` | Removed public staging footer | PASS |
| LEAK-01/17 | FAQ `docs/ops/...` | Sanitized `faq.a6` | PASS |
| LEAK-07 | robots/sitemap | `robots.ts`, `sitemap.ts` | PASS |
| LEAK-17 | `.env` / `.git` probes | 404 | PASS |

## Cross-user / RLS (catalog + AI + couple)

| Check | Control | Status |
|---|---|---|
| Catalog products | RLS active + provider status ∈ DEMO/TEST/VERIFIED; LIVE DB check | PASS design |
| DEMO bookings | `commerce_demo_bookings` own-row RLS | PASS design |
| AI consents | `ai_consents` own-row; revoke sets `granted=false` | PASS (EXT-042) |
| AI usage | insert own + select own; daily RPC quota | PASS (EXT-041) |
| Couple journals | Private journal RLS deny partner (prior wave) | PASS design |
| Partner DEMO isolation | No LIVE gate; `commerce_providers_no_live_yet` | PASS |
| Prompt / model output | Assist redacts input; circuit `AI_ADAPTER=off` | PASS sandbox |
| Safe-service claims | DeepSafe copy: not emergency / no dispatch | PASS copy |

## Payment / LIVE

| Check | Status |
|---|---|
| Real card capture in DEMO cart | DENIED by design (sandbox) |
| EXT-040 LIVE provider activation | **BLOCKED_EXTERNAL** — Founder only |

## Open / residual

| ID | Note |
|---|---|
| LEAK-03 | Full public API negative matrix — expand in CI |
| LEAK-04 | Production bundle canary in CI |
| LEAK-08 | Admin unauth matrix retest on each deploy |
| EXT-066 | Wire `test:no-leak` stop-ship in CI |

## Gate scripts

- `npm run test:no-leak` → `scripts/no-leak-public.mjs`
- `docs/audits/HOME_SECURITY_GATE.md`
- Playwright: `tests/e2e/no-leak-public.spec.ts`, `home-state-matrix.spec.ts`

## Verdict

No unresolved **critical** cross-user access design defect found in DEMO/sandbox surfaces covered above. LIVE activation remains NO_GO.
