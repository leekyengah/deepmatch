# Gate G0 — Architecture & Product Ready

**Approvers required:** Founder + Tech + Privacy  
**Status:** **GO** (Founder 2026-10-11 — “đồng ý hết”)

## Founder approvals

| Field | Value |
|---|---|
| Product SSOT | [Tổng quan DeepMatch](https://docs.google.com/document/d/1FgF6l2EBEN89h6GIgPxjDka4wPo3AlBJAYnZyalHk1k/edit) — GO 2026-10-11 |
| Full checklist | Founder message “đồng ý hết” 2026-10-11 |
| Stack ADR-01/02 | **Approved:** Web/PWA first; Next.js + Supabase (Auth/DB/RLS/Realtime/Storage) + Mapbox |
| Breakup ADR-03 | **Approved:** policy in `DM-006-breakup-shared-data-policy.md` |
| Age/location ADR-04 | **Approved:** 18+; fuzzy region only; no exact GPS for matching |
| Budget DM-009 | **Approved:** ranges/assumptions in `DM-009-mvp-budget.md` |

## Checklist

| Item | Artifact | Founder | Tech | Privacy |
|---|---|---|---|---|
| Product overview SSOT | Tổng quan Doc | ☑ GO | ☑ (Founder-as-Tech for greenfield) | ☑ (Founder-as-Privacy for greenfield) |
| PRD v2 full scope | `DM-001`, `DM-010` | ☑ | ☑ | ☑ |
| User flows | `DM-005` | ☑ | ☑ | ☑ |
| Stack ADR | `DM-008`, ADR-01/02 | ☑ | ☑ | ☑ |
| Breakup/data lifecycle | `DM-006` / ADR-03 | ☑ | ☑ | ☑ |
| Age & location policy | `DM-007` / ADR-04 | ☑ | ☑ | ☑ |
| Budget ranges | `DM-009` | ☑ | ☑ | ☑ |

Greenfield: Founder acts as Tech + Privacy approver until separate roles are named.

## Engineering authorization

- **G0 = GO** → proceed Wave B+ on staging/local (Auth, RLS live, matching/chat wiring).
- **Production / G6** still requires explicit Founder + Safety GO (DM-058/090). Cursor will not self-deploy production.

## Signatures

| Role | Name | Date | Decision |
|---|---|---|---|
| Founder | Founder (chat) | 2026-10-11 | **GO** (“đồng ý” Doc + “đồng ý hết”) |
| Tech | Founder (interim) | 2026-10-11 | **GO** |
| Privacy | Founder (interim) | 2026-10-11 | **GO** |

## Remaining sync debt (non-blocking for G0)

- Google Drive MCP still cannot auto-read Doc body → export/sync when convenient into `docs/p0/tong-quan-deepmatch.md`.
