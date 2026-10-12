# NEXT ACTION

## Status 2026-10-12 — Persona home + AI + catalog wave

Branch: `feat/ext-lifestyle-ai-commerce`

### Just shipped (local verified)

| Item | Evidence |
|---|---|
| EXT-030 AI hub + task picker | `/ai` + `AiUsageBadge` |
| EXT-041 quota + circuit | `/api/v1/ai/usage`, `AI_ADAPTER=off` |
| EXT-042 AI consent revoke | `/me/privacy` revoke action |
| EXT-021 admin catalog CMS | `/catalog` status + product toggle |
| EXT-031 couple commerce bridge | CTAs on `/couple` |
| EXT-033 ranking docs | `docs/architecture/CATALOG_RANKING.md` |
| EXT-037 catalog E2E | `tests/e2e/catalog-journeys.spec.ts` |
| EXT-052–056 persona home | web `/home` + mobile tab Home |
| i18n parity | 1046 keys × 2 locales PASS |
| typecheck | web/admin/i18n/shared PASS |

### Next P0

1. Staging deploy this wave (EXT-065 handoff refresh)
2. EXT-038 security QA report
3. EXT-062 a11y/perf measured
4. EXT-064 state-matrix E2E
5. EXT-040 LIVE — remain BLOCKED_EXTERNAL

### Blocked

- EXT-040 LIVE providers / real payment — Founder authorization only
- Mobile TestFlight — Apple Developer
