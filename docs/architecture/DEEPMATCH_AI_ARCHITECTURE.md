# DEEPMATCH AI Architecture — Concierge Premium

**Status:** Target architecture (Phase 1+)  
**Baseline:** `docs/audits/DEEPMATCH_AI_BASELINE_AUDIT.md`

## Principles

1. Server-side LLM only; never ship API keys to client.
2. Consent per purpose before assist calls.
3. Stub default; OpenAI only when `AI_ADAPTER=openai` + key (unchanged by this redesign).
4. No auto-write to profile / bookings / payments.
5. Conversation persistence requires additive migration + RLS — **not** enabled until ADR approved.

## Target UX surfaces

| Surface | Implementation |
|---|---|
| `/ai` Premium hub | Three-panel: nav · workspace · context |
| Module cards (8) | Real routes + status badges (WORKING / PARTIAL) |
| Chat workspace | Session-local thread calling existing `/api/v1/ai/assist`; regenerate/copy; no fake server history |
| Context panel | Live `/api/v1/ai/usage` + optional profile completeness from existing APIs |
| Privacy | Consent UI + `/legal/ai` + revoke path (existing consents table) |

## Data (as-is, reuse)

- `ai_consents`, `ai_usage_events`, `ai_deepmind_answers`
- RPC `ai_usage_count_today`

## Proposed (ADR pending — do not apply to prod yet)

- `ai_conversations` / `ai_messages` owner-scoped RLS for multi-turn history

## Feature flags

- `ff_ai` — kill switch for hub/APIs
- `AI_DISABLED` / `AI_ADAPTER=off` — circuit breaker
