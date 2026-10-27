# P1 Leakage Closure & Staging Regression — 2026-10-27

**GA:** NO-GO (unchanged) · **LIVE PSP:** HOLD · **Independent QA:** not signed · **PR #3:** not merged

## 1. Commits (P1 pack)

| SHA | Change |
|---|---|
| `baeda80` | Auth/checkout/home/mobile i18n P1 copy |
| `5f00dfd` | Hide DEMO catalog + cohort helper + sanitize script |
| `7e724d1` | Home suggest fallback cohort filter |
| `ebab83c` | Services FAQ sandbox jargon removed |
| **`798c199`** | Restore cohort isolation + Synthetic bio filter (tip for web) |

## 2. Staging deployment (verified)

| Field | Value |
|---|---|
| Vercel project | `tradingbase/deepmatch` (`prj_7gYBR2HZUZCEX4WKBd9UEjkxNZJp`) |
| Domain | https://datingvn.com |
| Deploy ID | `dpl_2VvmVkdMR2rHRVJ9bQSC8XXkzyCZ` |
| Commit on tip | `798c199` |
| Health | `env=staging`, `productionDeploy=false`, Supabase `zzqpvjdyvjarpphqhaze` |
| Not used | `deepmatch-prod` / `iofrimcbvqrhefqkkyrx` |

## 3. DEMO / Synthetic isolation

| Surface | Action |
|---|---|
| `commerce_providers` status=DEMO | Customer queries filter out; products `active=false` (rows retained) |
| Lifestyle / gift | Empty / no DEMO Partner / no `Fictional seed` |
| Discover + Home | Organic viewers excluded from `cohort=Mebertes`; bios matching `Synthetic…` filtered |
| QA fixtures | Kept for automated accept/ACL; not presented as organic partners |

## 4. Retest results

| Gate | Result |
|---|---|
| `accept:staging` | **13/13 PASS** |
| `test:no-leak` @ datingvn.com | **PASS** |
| `p1-member-leakage-scan` | **hitCount=0** (home/discover/lifestyle/checkout/ai/couple/services + sanitized auth error) |
| `@deepmatch/shared` unit | **41/41 PASS** |
| Commerce sandbox e2e | 5 PASS / 1 FAIL (`QA_JWT_A` missing — seed:qa) |
| ACL `/services` sandbox FAQ | Fixed in `ebab83c` + redeploy |

## 5. Android Preview APK

| Field | Value |
|---|---|
| Build ID | `e12006fa-9449-4952-b0f1-3e1f5ffa263c` |
| Status | **FINISHED** |
| Git | `7e724d1` (includes mobile P1 copy from `baeda80`) |
| Artifact | https://expo.dev/artifacts/eas/UtunApj594OvrqMZ3QNSrGhIv_y7FOxUxKwk_vSPYeg.apk |
| SHA-256 | `7EF84ADAD8489BFA2022E6936B8EAE03B68BCBE49962AFD80DD5A3311136E30C` |
| Expo | https://expo.dev/accounts/kyengah/projects/deepmatch/builds/e12006fa-9449-4952-b0f1-3e1f5ffa263c |
| Device | **DEVICE_TEST_BLOCKED** (install pending on physical device) |

## 6. Quality score (same criteria as audit pack)

| Dimension | Before (~audit) | After P1 closure |
|---|---|---|
| Security/Privacy | weak copy/auth surface | improved (sanitized errors; no checkout simulate) |
| Functional/Journey | accept OK; leakage FAIL | accept OK; leakage retest PASS |
| UI/UX content | DEMO/Synthetic visible | customer jargon closed on staging |
| Commerce/Admin | sandbox CTAs on member | member CTAs removed; LIVE still HOLD |
| Stability/A11y | partial | unchanged |
| Store/Legal | gaps | unchanged |
| **Weighted (~)** | **~57 / NO-GO** | **~68 / NO-GO** |

Score is engineering estimate only — not Independent VERIFIED / not GA GO.

## 7. Residual blockers before Independent QA

1. Physical Android DEVICE_TEST + iOS TestFlight/device (**BLOCKED_EXTERNAL** Asc).
2. Dual-account match/chat/IDOR deep evidence refresh.
3. Store legal / privacy review; Data Safety forms.
4. LIVE PSP remains HOLD; no production deploy; PR #3 unmerged.
5. Commerce e2e JWT seed (`npm run seed:qa`) for full sandbox matrix.
6. Discover empty photos / media gate UX still product quality residual (not jargon).

## 8. Evidence paths

`docs/evidence/full-product-audit-2026-10-27/` — especially `08`–`18`, `11d_MEMBER_LEAKAGE_ISOLATION.txt`, `13_EAS_BUILD_VIEW.json`.
