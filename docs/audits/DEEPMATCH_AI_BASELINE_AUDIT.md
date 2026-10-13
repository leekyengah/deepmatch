# DEEPMATCH AI — BASELINE AUDIT (Phase 0)

**Date:** 2026-10-13  
**Target:** `https://datingvn.com/ai`  
**Branch (implementation):** `feature/ai-concierge-premium` (created after this audit)  
**Production write lock:** No prod DB migration · no AI provider/model/key change · no auto-prod AI deploy until GO

---

## 1. Architecture evidence

| Layer | Finding | Evidence |
|---|---|---|
| Web | Next.js App Router BFF | `apps/web/src/app/(app)/ai/page.tsx` |
| Mobile | No native `/ai` screens | Grep `apps/mobile` — only legal link to `/legal/ai` |
| Flag | `ff_ai` (env `FF_AI` + DB `feature_flags`) | `apps/web/src/lib/flags.ts`; default `true` in `packages/shared/src/flags.ts` |
| Adapter | Stub default; OpenAI optional | `packages/shared/src/ai/gateway.ts` · `apps/web/src/lib/ai/run-assist.ts` |
| Circuit | `AI_DISABLED=true` or `AI_ADAPTER=off` | `apps/web/src/app/api/v1/ai/assist/route.ts` |
| Auth | Supabase session required for assist/usage/deepmind | API routes above |
| Quota | `AI_DAILY_QUOTA` env default **40** | usage route + assist route; RPC `ai_usage_count_today` |
| Consent | Per-purpose upsert `ai_consents` | assist + deepmind routes |
| Brand tokens | Existing CSS vars (burgundy/ivory/champagne) | `apps/web/src/app/globals.css` — close to task refs; prefer tokens over hardcoding new hex |

### AI Architecture Map (as-is)

```
[/ai hub] → entry cards → [/ai/coach | /ai/deepmind | lifestyle/* | /safe]
                ↓
         AiAssistClient → POST /api/v1/ai/assist
                ↓
         runAssist() → resolveAiAdapter()
                ↓
         stubAssist() | openai chat/completions (server-only key)
                ↓
         ai_usage_events + ai_consents (RLS owner-scoped)
```

**No** `ai_conversations` / message history tables found in migrations.

---

## 2. API inventory

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/api/v1/ai/assist` | user | Task assist + consent + quota |
| GET | `/api/v1/ai/usage` | user | used/quota/remaining/adapter/circuit |
| GET/PUT/DELETE | `/api/v1/ai/deepmind` | user | DeepMind Q&A persistence |
| GET/POST… | `/api/v1/safety/*` | user | DeepSafe contacts/checkins |

---

## 3. Eight-module functional audit

| # | Module | UI route | AI task | Backend | Status |
|---|---|---|---|---|---|
| 1 | Profile Coach | `/ai/coach` + hub picker | `profile_coach` | assist + stub/openai; **no auto profile write** | **PARTIAL** — suggestions only; no draft save / before-after compare |
| 2 | Tự khám phá | `/ai/deepmind` | `deepmind` | answers table + assist insight | **WORKING** (non-clinical copy) |
| 3 | Quà tặng | hub → `/lifestyle/gift` + task `gift` | assist | catalogHints; lifestyle catalog | **PARTIAL** — assist stub/LLM; not full occasion/budget wizard |
| 4 | Style | `/lifestyle/fashion` + `style` | assist | same | **PARTIAL** |
| 5 | Beauty | `/lifestyle/beauty` + `beauty` | assist | same; disclaimer non-medical | **PARTIAL** |
| 6 | Date Planner | `/lifestyle/venue` + `date_plan` | assist | lifestyle places; **no auto booking** | **PARTIAL** |
| 7 | Du lịch | `/lifestyle/travel` + `travel` | assist | same | **PARTIAL** |
| 8 | DeepSafe | `/safe` + task `safety_tips` | safety APIs + assist tips | contacts/checkins RLS | **WORKING** (core free; not paywalled in code) |

Extra task in gateway: `match_hints`, `story` — **PARTIAL / low UI surface**.

---

## 4. Permission & data matrix

| Data | AI default access | Control |
|---|---|---|
| Profile fields | Not auto-loaded into assist input | Client sends redacted `input` |
| Private journal / raw chat | Blocked keys in `redactedInput` | gateway.ts |
| DeepMind answers | Owner RLS | `ai_deepmind_answers` |
| Usage events | Owner insert/select | RLS |
| Consents | Owner upsert | RLS |
| Cross-user history | N/A (no conversation store) | — |

---

## 5. Gap vs Premium Concierge mockup/spec

| Spec item | Baseline | Gap |
|---|---|---|
| Three-panel premium `/ai` | Single-column hub + task picker | **Missing** |
| Persistent AI chat | Single-shot assist | **NOT_IMPLEMENTED** (needs schema ADR) |
| Streaming | Not present | **NOT_IMPLEMENTED** |
| Personal context panel (real % / quota / plan) | Quota badge only | **PARTIAL** |
| Module status badges | None | **Missing** |
| Favorites / saved tasks | None | **NOT_IMPLEMENTED** |
| Privacy management UI | Legal link + consent checkbox | **PARTIAL** |
| Mobile native AI | WebView/legal only | **NOT_IMPLEMENTED** |
| Mockup PNG assets in repo | Not provided in this task message | **MOCKUP_ASSETS_PENDING** |

---

## 6. Risk register

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-AI-01 | Changing `AI_ADAPTER`/keys in prod | High | Do not touch env in this workstream |
| R-AI-02 | Fake conversation history as “synced” | High | Client session only until migration |
| R-AI-03 | Clinical / compatibility claims | High | Keep disclaimer; no scientific % |
| R-AI-04 | Quota hardcode 40 without entitlement map | Med | Display server quota; don’t invent plan tiers |
| R-AI-05 | `ff_ai` DB override may hide `/ai` | Med | Document; don’t flip prod flags silently |
| R-AI-06 | Prod deploy of AI redesign without UAT | Med | Staging first; prod needs explicit GO |

---

## 7. Dependency matrix

| Depends on | Status |
|---|---|
| `@deepmatch/shared` AI gateway | Reuse |
| Supabase AI tables | Reuse; no new tables in Phase 0–2 |
| Lifestyle catalog routes | Reuse for gift/style/beauty/date/travel |
| DeepSafe `/safe` | Reuse |
| Profile edit confirmation flow | Needed for Coach “apply” — confirm before write |
| Conversation persistence migration | Blocked pending ADR + staging apply approval |
| Master Sheet sync | Google Sheets MCP (retry if timeout) |

---

## 8. GATE 0 verdict

**GATE 0 — BASELINE VERIFIED: PASS (docs)**  
Evidence: this file + paths above.  
Implementation may proceed on a feature branch without production DB writes.
