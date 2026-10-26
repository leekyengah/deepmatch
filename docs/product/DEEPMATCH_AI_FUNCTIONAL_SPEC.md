# DEEPMATCH AI — Functional Spec (Concierge Premium)

See baseline audit for as-is status. This spec tracks target vs shipped.

| Capability | Target | Shipped on `feature/ai-concierge-premium` |
|---|---|---|
| Premium three-panel `/ai` | Required | Yes (`AiConciergeHub`) |
| 8 module cards + status | Required | Yes (WORKING/PARTIAL badges) |
| Session chat workspace | Required | Yes (sessionStorage; calls `/api/v1/ai/assist`) |
| Server conversation history | Required later | **NOT_IMPLEMENTED** — documented |
| Streaming | Optional | **NOT_IMPLEMENTED** |
| Context panel quota | Required | Yes (live `/api/v1/ai/usage`) |
| Profile % | If API provides | Honest empty if unavailable |
| DeepMind / Coach / DeepSafe | Keep working | Unchanged routes |
| Extended 4 capabilities | Design only | Architecture note only |
| Mobile native | Chat-first | **NOT_STARTED** (web-first) |

**Mockup assets:** not attached in task message → `MOCKUP_ASSETS_PENDING`; UI follows brand tokens + written layout spec.
