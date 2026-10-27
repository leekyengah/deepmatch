# KIỂM THỬ WAVE2 — 2026-10-14

## Code shipped (prod)
- `GET /api/v1/me/home-state` + `/me/consents` → Bearer via `getRouteUser`
- `resolveHomeState` / `getActiveCouple` accept Supabase client
- Lora font subsets `latin`/`latin-ext` (fixes Vercel Next font crash)
- Prod deploy: `dpl_A3shRz3AFkGoKCxiB4CCb3VgzX8m` → https://datingvn.com
- Verified: `home-state` Bearer **200** `{state:"couple"}`

## Tests
| Suite | Result |
|---|---|
| `scripts/qa-master-run.mjs` | **23/23 PASS** |
| Playwright phase2-journeys | **16/16 PASS** |
| Security probes | **6/6 PASS** |
| qa-journeys (after bilingual/assert fix) | re-run |

## Accounts seeded
- `qa_minor_synth@deepmatch.test` → discovery **403 FORBIDDEN**
- `qa_staff_restricted@deepmatch.test` (moderator) → venues **200**, flags n=9
- Vault: `.ai/qa-extra.env.ps1` (not in Master)

## Master
- Tab **34**: K2:L72 bulk status → PASS=25, PASS_PARTIAL=7, NOT_RUN≈39
- Tab **35**: minor + staff SEED_OK
- Tab **24**: G-QA-STAGING PASS_PARTIAL; G3 PASS_PARTIAL; G2 PASS
- Sheet **KIỂM THỬ** WAVE2 summary

## Still blocked (honest)
Maps Cloud keys · LIVE PSP · Store/EAS/TestFlight/Play · physical device · full LEAK suite · OTP signup inbox

**GA: NO-GO** · **Staging: PARTIAL GO**
