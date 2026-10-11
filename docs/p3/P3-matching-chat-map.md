# P3 — Matching, Chat, Map (DM-031–040, 066–078)

## Done in repo

- Rule-based engine + tests (`packages/shared`)
- Rank API + Discover UI demo
- Chat ACL API + gate UI (denies without mutual)
- Couple map placeholder + 3 layers documented
- Migration tables: likes, mutual_matches, conversations, messages, pins, media

## Not Done (live)

- Realtime channel wiring
- Media signed URL pipeline
- Mapbox GL integration with quota
- Idempotent like RPC + mutual transaction
- Push notifications privacy-safe

**Proposed status:** Core logic In review; realtime/media Blocked on ADR-06/08 + staging
