# DeepMatch — Current System Gap Audit (EXT wave)

| Field | Value |
|---|---|
| Date | 2026-10-12 |
| Branch | `feat/ext-lifestyle-ai-commerce` |
| Base commit | `f2a50c8` (+ large WIP dating core on working tree) |
| Auditor | Cursor Agent (Master Autonomous Execution) |
| Sheets | Master Tracker read OK — tabs 00–18 |

**Legend:** `VERIFIED` · `PARTIAL` · `MISSING` · `BLOCKED` · `NOT_APPLICABLE`

## 1. Master Tracker snapshot

| Tab | Content | Status vs code |
|---|---|---|
| 01 DM-001–090 | All **Hoàn thành** in sheet | Dating core staging **VERIFIED** (datingvn.com); many sheet rows lag WIP evidence but product surface exists |
| 10–12 Architecture | ARCH-B01–B20 | Docs under `docs/architecture/*` **VERIFIED**; some gates PARTIAL |
| 13 Feature matrix | Guest/User/Admin | Matches staging core; Premium CK **VERIFIED**; AI/commerce rows absent |
| 14 Compare/diff | Diff proposals | Input for EXT |
| 15 AI Commerce ARCH-X01–X16 | Target domains | **MISSING** in code |
| 16 EXT-001–042 | All **Chưa bắt đầu** | Primary delivery backlog |
| 17 Catalog 60 mock | Gift/Fashion/Beauty/Venue/Travel/Safety ×10 | Seed data source — **MISSING** in DB |
| 18 UX-01–28 | Lifestyle/AI screens | **MISSING** (core dating UI exists separately) |

## 2. Dating & Relationship core (current)

| Area | Classification | Evidence |
|---|---|---|
| Auth / consent / onboarding | VERIFIED | `/login` `/signup` `/onboarding` `/me/privacy` |
| Discover / likes / mutual | VERIFIED | `/discover` `/api/v1/likes` matching engine |
| Chat + media | VERIFIED / PARTIAL | Realtime + upload; video UI thin |
| Couple invite / map / journals | VERIFIED / PARTIAL | OSM map; Mapbox token optional |
| Concierge services | VERIFIED | `/services` `/bookings` |
| Admin RBAC + billing confirm | VERIFIED | `deepmatch-admin` + HD Bank STK |
| Premium 99k bank transfer | VERIFIED | `/me/premium` + admin `/billing` |
| Production live charge / LIVE partners | BLOCKED | Explicit Founder gate |

## 3. EXT / AI / Lifestyle Commerce gap

| ID | Work | Class | Notes |
|---|---|---|---|
| EXT-001 | Domain boundaries + ADR | PARTIAL→in progress | This audit + `SYSTEM_ARCHITECTURE_EXTENDED.md` |
| EXT-002 | Catalog schema | MISSING | Migration sprint |
| EXT-003 | Provider DEMO/TEST/VERIFIED/LIVE | MISSING | Dual-approval LIVE hard-block |
| EXT-004 | 60 demo seeds | MISSING | From tab 17 |
| EXT-005 | Catalog read APIs | MISSING | `/api/v1/catalog/*` |
| EXT-006–007 | AI Gateway + consent | MISSING | Stub provider first (no paid LLM) |
| EXT-008–015 | AI features | MISSING | After gateway |
| EXT-016–022 | Booking/cart/admin commerce | MISSING | Sandbox only |
| EXT-023–031 | Storefront UX | MISSING | Tab 18 |
| EXT-032–042 | Notify/analytics/E2E/security/staging | MISSING | Later sprints |
| ARCH-X09 DeepSafe | MISSING | Not emergency service |
| LIVE provider / real PSP | BLOCKED | EXT-040 — Founder only |

## 4. P0 ready now (dependencies satisfied)

1. **EXT-001** docs — no blocker  
2. **EXT-002–005** schema + seed + catalog GET — reversible, staging-only  
3. **EXT-006** AI Gateway **stub** (rule/template JSON) — no external spend  
4. **UX-01/02** Lifestyle + AI hub shells wired to catalog/AI stubs  
5. Flags `ff_lifestyle` / `ff_ai` default **on staging**, off until seed verified  

## 5. Explicit non-goals this wave

- Production deploy of commerce/AI  
- Real card capture / LIVE partner enablement  
- Mental-health diagnosis or auto-send chat  
- Destructive data ops  

## 6. Decision pending (see chat A/B/C/D)

**DECISION-AI-01** — AI inference backend for staging (stub vs hosted LLM). Work continues with **stub** until answered.
