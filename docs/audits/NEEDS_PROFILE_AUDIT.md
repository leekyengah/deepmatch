# Hiểu mình / Needs & Profile audit (Master DM-134)

**Date:** 2026-10-13  
**Scope:** Questionnaire bank, onboarding values, deep profile fields, DeepMind — vs Master **DM-134–149** (“Hiểu mình” 100 câu) and gate **G-NEEDS-PROFILE**. **No product code changed** in this audit.  
**Sources:** `apps/web`, `packages/shared`, `supabase/migrations`, seed scripts, i18n, `.ai/NEXT_ACTION.md`, Master Google Sheet tabs **29 USER NEEDS & PROFILE** and **30 QUESTION EXPERIENCE DESIGN** (spreadsheet `1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8`).

---

## Executive summary

The repo ships a **minimal discovery profile** (`profiles` + `profile_deep` + onboarding checkboxes) and a **separate voluntary DeepMind mini-questionnaire** (6 MCQ items under `ff_ai`). It does **not** contain the Master **100-question bank** (C01–C15, F01–F20, D01–D25, M01–M40), the **Hiểu mình** UX routes (`/me/understand`, …), mode branching (FRIENDSHIP / DATING / MARRIAGE), importance/hard-constraint fields, or the rich profile media/verification model described on Master tab 29.

**Question inventory in repo (code + DB seeds):**

| Category | Count | Location |
|----------|------:|----------|
| Structured questionnaire items (prompt + options + stable `id`) | **6** | `packages/shared/src/ai/deepmind.ts` → `DEEPMIND_QUESTIONS` |
| Question bank rows in SQL migrations / seed scripts | **0** | No `question_catalog` table; seeds only set sample `profile_deep` values |
| Master tab 29 question IDs (C/F/D/M) | **100** | **Not in repo** — live in Master sheet only |

**Adjacent (not counted as Master 100 bank):** onboarding **9** value chips + **3** intent radios; `/me/deep` **7** free-form deep fields (goals, values, interests, communication_style, expectations, dealbreakers, plus match prefs on same form).

**Verdict:** **G-NEEDS-PROFILE NOT READY** — audit-first complete; implementation blocked on importing approved content from Master tab 29 (not inventing copy in repo) and schema/UX per tab 30.

---

## Master DM-134 intent (from tracker + sheets)

| Reference | In repo? | Notes |
|-----------|----------|-------|
| `.ai/NEXT_ACTION.md` DM-134–149 | Mention only | “Hiểu mình 100 câu”; no ticket breakdown in git |
| Master tab **29** | **No content file** | RULE-002: **100 câu** = 15 Chung + 20 Kết bạn + 25 Hẹn hò + 40 Hôn nhân; modes FRIENDSHIP / DATING / MARRIAGE; answer types MỘT/NHIỀU/SỐ/MỞ; skip/importance/hard-constraint rules |
| Master tab **30** | **No content file** | QX-01–QX-10 screens; canonical bank = tab 29; proposed routes e.g. `/me/understand`, `/me/understand/:topic`, `/me/preferences`, `/onboarding/intent` |
| DM-134 row text in repo | **Missing** | No `DM-134` markdown/spec beyond NEXT_ACTION |

**Important:** This audit does **not** duplicate the 100 Master question texts. Founder-approved source of truth remains **tab 29** (content) and **tab 30** (experience mapping). Paste or export-to-repo is a deliberate import step, not an AI-generated bank.

---

## What exists in the repo today

### 1. DeepMind questionnaire (AI pillar — not Hiểu mình hub)

| Piece | Path / table | Behavior |
|-------|----------------|----------|
| Question definitions | `packages/shared/src/ai/deepmind.ts` | **6** Vietnamese MCQs (`values`, `pace`, `communication`, `expectation`, `boundary`, `date_style`); non-clinical disclaimer |
| Web UI | `apps/web/src/app/(app)/ai/deepmind/page.tsx`, `DeepMindClient.tsx` | Step-through; consent checkbox; save/clear |
| API | `apps/web/src/app/api/v1/ai/deepmind/route.ts` | GET returns catalog + user answers; PUT validates keys against catalog; DELETE clears |
| Storage | `ai_deepmind_answers` (`answers jsonb`, `insight_draft`) | Migration `20261012190000_ext_deepmind_safety_quota.sql` |
| Flag | `ff_ai` | OFF on primary nav (hide-sandbox); route audit: BLOCKED → redirect `/me` when flag off |
| Mobile | — | **No** DeepMind / questionnaire surface |
| i18n | `packages/i18n/locales/*/ai.json` | DeepMind copy; **question prompts are hard-coded in shared TS**, not i18n keys |

DeepMind is **voluntary self-reflection**, separate from discovery matching fields. It is **not** wired to `rankCandidates` or public profile cards.

### 2. Onboarding (`/onboarding`)

| Piece | Details |
|-------|---------|
| UI | `apps/web/src/app/onboarding/page.tsx` |
| Values | **9** checkbox keys (`VALUE_KEYS` → i18n `onboarding.value*`) stored in `profile_deep.values` |
| Intent | **3** radios → stored as single entry in `profile_deep.goals` (`long_term`, `companion`, `talks`) |
| Mode / region / discovery | `profiles.mode`, `fuzzy_region`, `discovery_opt_in` |
| Master gap | No FRIENDSHIP/DATING/MARRIAGE modes; no tab-29 C01–C08 flow; no `/onboarding/intent` sub-route |

### 3. Deep profile scaffold (`/me/deep`)

| Piece | Details |
|-------|---------|
| UI | `DeepProfileForm.tsx` — free-text/list fields, not stepped QX-04 |
| DB | `profile_deep`: `goals`, `values`, `interests`, `communication_style`, `expectations`, `dealbreakers`, `field_visibility` |
| API | `GET/PATCH /api/v1/me/profile` merges `profiles` + `profile_deep`; client also upserts `match_preferences` |
| Discovery | `profile_deep_discoverable_select` RLS — peers see deep rows only when target is discovery-opt-in |
| Matching | `packages/shared/src/matching/engine.ts` uses `DiscoveryProfile` (goals/values overlap, age, regions) — **no per-question IDs** |
| Sitemap | `docs/p1/DM-015-sitemap.md` UI-22 “Deep profile Qs” = **Scaffold** |

### 4. Base profile (`profiles`)

Implemented: `display_name`, `bio`, `avatar_path`, `birth_date`, `fuzzy_region`, `job_title`, `mode`, discovery flags.  
**Not implemented** vs Master tab 29 PROFILE-010–023: gender/orientation split fields, height/weight, structured location (province/district), min 3 approved photos + video rules, relationship status, verification badges, contact channel confirmation, moderation pipeline for media.

### 5. Database seeds

Scripts (`seed-qa-matrix.mjs`, `seed-qa-pair.mjs`, `seed-rls-users.mjs`, `seed-e2e-user.mjs`) upsert **sample** `profile_deep` arrays (e.g. `goals: ["long_term"]`, `values: ["kindness"]`). **No seed** defines questionnaire metadata or Master C/F/D/M IDs.

---

## Gap matrix: Master 100-question module vs repo

| Master capability (tab 29–30) | Repo status |
|------------------------------|-------------|
| 100-ID question bank with modes & reuse rules | **MISSING** (0/100 in code) |
| Hiểu mình hub `/me/understand` + topic flow | **MISSING** (no routes) |
| One-question-per-step + draft + skip + review | **PARTIAL** pattern only in DeepMind (6 Qs, AI flag) |
| Partner preferences: importance 0–3 + hard constraint | **MISSING** |
| “Chưa rõ / Không muốn trả lời / Khác / N/A” answer semantics | **MISSING** (DeepMind requires picking an option) |
| Separate self vs partner-desired fields (RULE-008) | **MISSING** |
| Consent-scoped use for matching vs public profile (RULE-009) | **PARTIAL** — `discovery_opt_in` + `field_visibility` jsonb unused in UI |
| QX periodic refresh (`/me/understand/refresh`) | **MISSING** |
| Discover nudge to complete needs (QX-07) | **MISSING** |
| Rich profile + media QA (PROFILE-021+, QX-09) | **PARTIAL** — avatar path only; no 3–10 photo workflow |
| DeepMind as clinical/EQ tool | **Explicitly avoided** — aligned with brand/legal |

**Overlap (conceptual only, not ID-aligned):** DeepMind Q1 “values” and onboarding values both touch “giá trị”; `/me/deep` `communication_style` / `expectations` overlap themes in Master D/M blocks but are **unstructured text**, not the approved bank.

---

## Safe staging plan (no fake clinical content)

Phased delivery behind flags; **content import is a gated human step**.

### Phase 0 — Audit & import gate (current)

- [x] Repo vs Master gap documented (this file).
- [ ] Founder exports tab **29** question rows (IDs + prompts + options + mode tags + answer types) to a **versioned import artifact** (e.g. `packages/content/needs-profile.v1.json`) via controlled pipeline — **not** LLM-authored text.
- [ ] Legal/content review per `docs/content/LEGAL_HUMAN_REVIEW_PACK.md` for sensitive items.
- [ ] Map tab **30** QX screens to routes; reconcile with `docs/p1/DM-015-sitemap.md` and `FULL_UX_ROUTE_AUDIT.md`.

### Phase 1 — Schema & read-only catalog (staging)

- Add normalized tables (names TBD in ADR): e.g. `need_question_catalog`, `need_question_answers`, `need_partner_preferences`, optional `need_answer_drafts`.
- Store Master IDs (`C01`…`M40`) as primary keys; **no** duplicate of DeepMind’s 6 IDs unless explicitly merged in spec.
- RLS: owner read/write; no peer SELECT on raw answers; discovery uses **derived, consented facets** only.
- Feature flag: e.g. `ff_needs_profile` default **false**; `/me` shows tile only when on.
- API: `GET /api/v1/me/needs/catalog` (static from imported JSON) + empty answers — **no** ranking changes.

### Phase 2 — Hiểu mình UX (DM-134–149 subset)

- Implement QX-03/QX-04/QX-06 routes per tab 30; keep `/me/deep` until migration path defined (deprecate or redirect).
- Onboarding: optional `/onboarding/intent` slice (QX-01) **without** blocking signup on 100 answers.
- i18n: vi-VN + en-US for all imported strings; shared package re-exports catalog for web/mobile parity.
- Analytics: taxonomy events only (progress, skip) — no answer payload in logs (`ANALYTICS_EVENT_TAXONOMY.md`).

### Phase 3 — Matching & discover integration

- Extend ranking inputs from **explicit consented fields** only; no default use of open-text for filters (per RULE-009).
- QX-07 nudge with frequency cap; never block Discover entirely for incomplete deep needs.

### Phase 4 — Media & verification (PROFILE / QX-09–10)

- Separate epic: photo review states, min-3 discovery gate — depends on media moderation stack.

### Rollback

- Disable `ff_needs_profile`; retain `ai_deepmind_answers` and legacy `profile_deep` unchanged.
- Drop new tables only via forward migration with export backup; do not mutate DeepMind 6-pack without product decision.

### What **not** to do

- Do **not** commit 100 invented questions to unblock UI.
- Do **not** conflate DeepMind (`ff_ai`, hidden) with Hiểu mình hub without a merge spec.
- Do **not** expose `ai_deepmind_answers` or raw need answers to other users or admin UI without DATA_ACCESS_MATRIX update.

---

## Question count reference

| Source | Count |
|--------|------:|
| `DEEPMIND_QUESTIONS` in repo | **6** |
| SQL/seed question definitions | **0** |
| Master tab 29 (`C`+`F`+`D`+`M` IDs) | **100** (sheet only) |
| Onboarding value chips | 9 |
| Onboarding intent options | 3 |
| `/me/deep` structured fields | 7 |

**Audit answer for “existing question items in code/DB seeds”:** **6** (DeepMind catalog only).

---

## Related gates & evidence

| Gate / doc | Relevance |
|------------|-----------|
| G-NEEDS-PROFILE | Open — `.ai/NEXT_ACTION.md` |
| G-UX-WEBAPP | `/me` hub exists; Hiểu mình block missing |
| `ff_ai` | DeepMind shipped but hidden from primary nav |
| `docs/evidence/EXT-S2-S3-WAVE-2026-10-12.md` | EXT-008/029 DeepMind 6-Q wave |
| `docs/audits/FULL_UX_ROUTE_AUDIT.md` | `/ai/deepmind` BLOCKED when `ff_ai` off |

---

## Audit verdict

| Area | Verdict |
|------|---------|
| Master 100-question content in repo | **MISSING** |
| Hiểu mình UX (tab 30) | **MISSING** |
| Legacy deep profile + onboarding | **PARTIAL** scaffold |
| DeepMind voluntary questionnaire | **PARTIAL** (6 Qs, separate product surface) |
| **Overall G-NEEDS-PROFILE** | **NOT READY** |

**Next doc action:** After Founder approves import format, add `docs/evidence/NEEDS-PROFILE-IMPORT-*.md` with checksum of tab 29 export and legal sign-off — still no code until Phase 1 ADR.
