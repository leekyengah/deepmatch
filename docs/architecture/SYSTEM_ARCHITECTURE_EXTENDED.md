# System Architecture — Extended (AI + Lifestyle Commerce)

| Field | Value |
|---|---|
| Status | Active draft |
| Date | 2026-10-12 |
| Parents | `SYSTEM_ARCHITECTURE.md`, Master tab 15–18 |
| ADR delta | ADR-X01…X04 below |

## 1. Domain boundaries

```
apps/web ──BFF /api/v1──┐
apps/admin ─────────────┼── Supabase (Postgres + Auth + Storage + RLS)
packages/shared ────────┘
         │
         ├── dating core (profiles, likes, chat, pairs, concierge)
         └── lifestyle commerce (providers, products, offers, demo_bookings, ai_*)
```

Import rules:

- Dating modules must not import commerce checkout internals.
- AI Gateway is the only path that may call an LLM adapter.
- Catalog public reads expose only `DEMO` / `VERIFIED` / `LIVE` with explicit badge; seed rows are always `DEMO`.
- Couple journals / raw chat are **never** default AI context (EXT-007).

## 2. New bounded contexts

| Context | Tables (target) | Public surface |
|---|---|---|
| Partner registry | `commerce_providers` | Admin CRUD; public name+status only |
| Catalog | `commerce_categories`, `commerce_products`, `commerce_offers` | GET catalog APIs |
| Demo booking | `commerce_demo_bookings` | Sandbox reserve/cancel |
| AI | `ai_consents`, `ai_usage_events`, `ai_sessions` | `/api/v1/ai/assist` |
| Safety (DeepSafe) | `safety_trusted_contacts`, `safety_checkins` | Free core; mock coordinator |

## 3. Provider lifecycle

`DEMO` → `TEST` → `VERIFIED` → `LIVE`

- Public UI always shows status badge.
- Transition to `LIVE` requires dual admin approval + Founder gate (EXT-040). Code rejects auto-LIVE.
- Demo inventory never mixes with LIVE SKUs in the same offer row.

## 4. AI Gateway

```
Client → POST /api/v1/ai/assist { task, input, consent_token }
       → Auth + flag ff_ai + purpose consent
       → Prompt registry + PII redaction
       → Adapter (stub | llm)
       → Structured JSON + usage meter
```

Hard rules: no auto-send messages; no clinical diagnosis; no private journal/chat without explicit purpose consent.

## 5. Feature flags

| Flag | Purpose |
|---|---|
| `ff_lifestyle` | Catalog + lifestyle hub UI |
| `ff_ai` | AI assist endpoints + AI hub |

## 6. ADR delta

### ADR-X01 — Commerce schema lives in Supabase beside dating ERD
**Decision:** New `commerce_*` / `ai_*` / `safety_*` tables in same project, prefixed, RLS-isolated.  
**Why:** One auth identity; lower ops cost.  
**Rollback:** Drop migrations `20261012180000_*` onward.

### ADR-X02 — Staging AI uses stub adapter by default (DECISION-AI-01 **C**)
**Decision:** `AI_ADAPTER=stub` (default). When `AI_ADAPTER=openai` **and** `OPENAI_API_KEY` set, call OpenAI; on failure/missing key → stub fallback (`fallbackFrom: openai`).  
**Why:** Zero spend by default; optional LLM without code rewrite; reproducible E2E.  
**Rollback:** Set `AI_ADAPTER=stub` or unset `OPENAI_API_KEY`.

### ADR-X03 — All tab-17 seeds are DEMO forever
**Decision:** Seed script sets `provider_status=DEMO`, `fulfillment=SANDBOX_ONLY`, banner copy mandatory.  
**Why:** Legal/safety — no false commerce.  
**Rollback:** `truncate commerce_* cascade` via seed reset.

### ADR-X04 — No LIVE partner / real capture without Founder
**Decision:** Code paths for LIVE booking & real PSP remain behind env + dual RBAC; staging never enables.  
**Why:** Master prompt §2 exception.  
**Rollback:** N/A (never enabled).
