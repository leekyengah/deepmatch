# DM-001 — Traceability Matrix

| Workstream | DM-IDs | Phase | Release gate | Hard rules |
|---|---|---|---|---|
| Product/UX | 001–010 | P0 | G0 | Founder PRD/ADR/age/cost |
| Platform/CI | 011–020 | P1 | G1 | No secrets in git; staging≠prod |
| App shell/Auth | 021–023 | P2 | G1/G2 | Age + consent |
| Pair lifecycle | 024–030 | P2 | G2 | Mutual accept only; RLS |
| Couple map/media | 031–040 | P3 | G2/G4 | Signed URLs; private views |
| Concierge | 041–047 | P4 | G4 | Advisor scoped cases |
| Telemetry/QA prep | 048–054 | P5 | G5 | No fake KPI |
| Matching integrate | 055 | P3 | G3 | Explainable; no forbidden signals |
| Chat integrate | 056 | P3 | G3 | Mutual-only messaging |
| Premium | 057 | P6 | Conditional | Deferred |
| Full release | 058 | P5 | G5/G6 | Founder GO only |
| Personal | 059–064 | P1–P2 | G2 | Field visibility |
| Matching | 065–072 | P1–P3 | G3 | No auto-pair |
| Chat | 073–078 | P1–P3 | G3 | ACL + moderation |
| Admin | 079–088 | P1–P4 | G4 | RBAC + audit |
| E2E / Gate | 089–090 | P5 | G5/G6 | QA01–QA17 |

## QA critical paths

| QA | Scenario | Linked DM |
|---|---|---|
| QA05 | Message without mutual | 071, 074 |
| QA09 | Admin journal/chat abuse | 079, 084 |
| QA11 | Mutual like ≠ couple space | 070, 078, 025 |
| QA12 | Unpair data isolation | 027, 026 |
| QA16 | Full E2E journey | 089, 090 |
