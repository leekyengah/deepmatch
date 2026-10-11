# Gate G0 — Architecture & Product Ready

**Approvers required:** Founder + Tech + Privacy  
**NO-GO if:** no explicit platform/privacy decision

## Founder product approval (recorded)

| Field | Value |
|---|---|
| Decision | **GO — product source of truth** |
| Source | [Tổng quan DeepMatch](https://docs.google.com/document/d/1FgF6l2EBEN89h6GIgPxjDka4wPo3AlBJAYnZyalHk1k/edit?tab=t.0#heading=h.zdjxwfjepbc0) |
| Founder message | “đồng ý” + doc link (2026-10-11) |
| Scope effect | PRD/flows/workstreams must align to this Doc; Master Tracker first-release scope remains in force |
| Sync status | **Doc body not yet machine-readable** (Google Drive MCP auth timeout; browser requires Google sign-in) |

## Checklist

| Item | Artifact | Founder | Tech | Privacy |
|---|---|---|---|---|
| Product overview SSOT | Tổng quan Doc (link above) | ☑ GO 2026-10-11 | ☐ | ☐ |
| PRD v2 full scope | `DM-001`, `DM-010` | ☑ aligned to Doc (pending text sync) | ☐ | ☐ |
| User flows | `DM-005` | ☑ (subject to Doc sync) | ☐ | ☐ |
| Stack ADR | `DM-008`, ADR-01/02 (Next.js + Supabase + Mapbox) | ☐ confirm | ☐ | ☐ |
| Breakup/data lifecycle | `DM-006` / ADR-03 | ☐ confirm | ☐ | ☐ |
| Age & location policy | `DM-007` / ADR-04 | ☐ confirm | ☐ | ☐ |
| Budget ranges | `DM-009` | ☐ confirm | ☐ | ☐ |

## Engineering note

- Local scaffold against Proposed ADR-01/02 already exists.
- **Full Gate G0 = GO on Master Sheet** only after remaining ☐ items are confirmed (or Founder states they are included in “đồng ý”).
- **Production release remains forbidden** without G5/G6 GO (DM-058/090).

## Signatures

| Role | Name | Date | Decision |
|---|---|---|---|
| Founder | Founder (chat) | 2026-10-11 | **GO** on Tổng quan Doc SSOT |
| Tech | _pending_ | | GO / NO-GO |
| Privacy | _pending_ | | GO / NO-GO |

## Unblock doc sync

1. Complete **Google Drive MCP** auth popup in Cursor, **or**
2. Export Doc → share `.txt`/`.md` into repo `docs/p0/tong-quan-deepmatch.md`
