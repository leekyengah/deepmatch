# Love Map module audit (Master DM-150 / G-LOVE-MAP)

**Date:** 2026-10-13  
**Scope:** Master “4-screen Love Map” vs current **Chúng mình** couple map/memories and any public place/review catalog in repo.  
**Sources:** `apps/web` couple routes + BFF, Supabase migrations/RLS, `docs/brand/TONG_QUAN_THUONG_HIEU_SAN_PHAM.md`, `docs/p1/DM-015-sitemap.md`, `docs/architecture/API_CONTRACTS.md`, `docs/audits/FULL_UX_ROUTE_AUDIT.md`, `.ai/NEXT_ACTION.md`, `scripts/accept-staging.mjs`.  
**Out of scope:** Lifestyle `commerce_*` as product truth (DEMO fiction only); Master Sheet rows DM-150..167 (not pasted in repo).

---

## Executive summary

The repo ships a **private couple memory map** (`pins` + optional `private_notes` journals) with working CRUD BFF, OSM/Mapbox rendering, geocode proxy, and a memories timeline UI. There is **no Love Map public place catalog**, **no place detail/reviews**, **no Top 30**, and **no feature flag** for a distinct public discover map (`ff_love_map` / similar).

**Public place catalog for Love Map:** **Does not exist.**  
The nearest data is **`commerce_products`** with category `venue` under **`ff_lifestyle`** — seeded as **DEMO / fictional** (`source_note`, `demo_banner`, `SANDBOX_ONLY`). It must **not** be presented as verified real-world venues for G-LOVE-MAP.

Couple-side baseline is **staging-verified** for three pin layers (`accept-staging.mjs` → `pair_pins_three_layers`). Public Love Map screens are **MISSING** end-to-end.

---

## Master target: four screens (canonical labels from execution brief)

| # | Screen | Intended role (Master DM-150 wave) | Repo route / API today |
|---|--------|-----------------------------------|-------------------------|
| 1 | **Public discover map** | Browse curated date/experience places (pre-pair or solo); map-first discovery | **No route.** `/discover` is **people** matching, not places. |
| 2 | **Place detail + reviews** | Single venue page, community/editorial reviews, save-to-wishlist hooks | **No route.** No `places` / `place_reviews` schema. |
| 3 | **Top 30** | Ranked list (transparent rules; no fake popularity) | **No route.** No ranking table or API. |
| 4 | **Private couple memories** | Pair-only timeline, media, journals; ties to private map | **`/couple/memories`**, **`/couple/map`**, **`/couple/add`** — **PARTIAL** |

Existing **couple** nav (`/couple/map`, memories, add, promises, us) is the **private Chúng mình** product from brand §V, not the **public** Love Map discover layer.

---

## Four-screen status matrix

| Screen | Status | What is verified in repo | Gaps vs Master 4-screen Love Map |
|--------|--------|---------------------------|----------------------------------|
| **1 — Public discover map** | **MISSING** | Map UX patterns exist only on **private** `/couple/map` (`CoupleMapClient`, `CoupleOsmCanvas`, optional Mapbox). `/api/v1/geocode` (auth-only Nominatim proxy). | No public read model, no guest/solo map route, no curated geo dataset, no `ff_*` gate for public map, no link from landing beyond generic couple CTA. |
| **2 — Place detail + reviews** | **MISSING** | Lifestyle **`/lifestyle/venue/[mockId]`** is **commerce DEMO** detail (`commerce_products`), not Love Map places/reviews. | No place entity, slug route, review moderation, or “verified venue” lifecycle. |
| **3 — Top 30** | **MISSING** | — | No list route, sort key, editorial workflow, or anti-gaming rules in code. |
| **4 — Private couple memories** | **PARTIAL** | **`pins`** + RLS; **`GET/POST/PATCH/DELETE`** `/api/v1/couples/{id}/pins`; **`GET/POST`** `/api/v1/couples/{id}/journals` → `private_notes`; **`GET`** export (pins only); pages **`/couple/memories`**, **`/couple/add`**, **`/couple/map`**; analytics `couple_map_view`. Staging accept: **≥3 pins × 3 layers** per partner. | Memories UI reads **`pins.note`** only — **does not list journals**; photo/video CTAs **do not upload** (`media_objects` has **`pair_id` but no `pin_id`**); no fuzzy coords; **`/couple/map` duplicate** inline pin form vs `/couple/add`; brand fields (dining tag, media gallery, share journal) largely unwired. |

**Related private surfaces (not counted as the 4 Master screens but in scope for G-LOVE-MAP couple half):**

| Route | Status | Notes |
|-------|--------|-------|
| `/couple/map` | **PARTIAL → VERIFIED** (private map only) | Full pin list, filters, geocode, delete (creator-only in BFF), wishlist→visited promote. Requires active pair. |
| `/couple/promises` | **PARTIAL** | Wishlist layer listing from `pins`; no link to public catalog place. |
| `/couple` hub | **VERIFIED** | Nav tiles; optional lifestyle bridge when `ff_lifestyle` ∨ `ff_ai`. |

---

## Current implementation inventory

### Web routes (`apps/web`)

| Route | Auth | Data access |
|-------|------|-------------|
| `/couple/map` | Session; pair optional (empty state → invite) | Client → **`/api/v1/couples/{id}/pins`** |
| `/couple/memories` | Login + RLS `pins` server query | Server Supabase |
| `/couple/add` | Login | Client POST pins + optional POST journals |
| `/couple/promises` | Login | Server `pins` where `layer = wishlist` |

No `/love-map`, `/places`, `/places/[slug]`, or `/top-30` (or equivalents).

### API (BFF)

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| GET/POST/PATCH/DELETE | `/api/v1/couples/{id}/pins` | Active pair member | CRUD on `pins`; DELETE limited to **`created_by`** in handler |
| GET/POST | `/api/v1/couples/{id}/journals` | Active pair member | `private_notes` scoped to pair pins |
| GET | `/api/v1/couples/{id}/export` | Active pair member | JSON download; **excludes** private notes |
| POST | `/api/v1/couples/{id}/disconnect` | Pair member | Sets `pairs.status = unpaired` → **`is_pair_member` false** → pins/journals inaccessible |
| GET | `/api/v1/geocode?q=` | Any authenticated user | Nominatim proxy (not a place catalog) |

Documented in `docs/architecture/API_CONTRACTS.md` (Couples / Map / Journals). **`GET /api/v1/couples/{id}`** marked **MISSING** (no aggregate couple resource).

### Schema (migrations)

**Present (couple private):**

```sql
-- supabase/migrations/20261011000000_init.sql (excerpt)
pins (pair_id, layer pin_layer, title, note, lat, lng, place_label, visited_on, created_by, …)
private_notes (pin_id, author_id, body, shared_with_partner, …)
pairs + is_pair_member() for RLS
```

**Absent (public Love Map):**

- `places` / `venues` / `love_map_places`
- `place_reviews` / ratings
- `top_placements` / editorial rankings
- FK **`pins.place_id`** → public catalog (pins use free-text **`place_label`** only)
- Pin–media join (`media_objects` has `pair_id`, **no `pin_id`**)

**Pin layers enum:** `visited` | `wishlist` | `milestone` — aligns with brand §V.

**Unrelated catalog:** `commerce_products` + category `venue` (`20261012180000_commerce_catalog_ai.sql`) — **DEMO providers**, explicit **not real business** constraint; gated by **`ff_lifestyle`**.

### Feature flags

`apps/web/src/lib/flags.ts`: **`ff_matching`**, **`ff_discovery`**, **`ff_media_upload`**, **`ff_lifestyle`**, etc. — **no Love Map / public map flag**. Couple map is always reachable when authenticated (no kill switch).

### Mobile

`apps/mobile` couple tab: marketing + deep link to web couple — **no native Love Map**.

### Gates / evidence

| Gate / script | Love Map coverage |
|---------------|-------------------|
| `G-LOVE-MAP` | Referenced in `.ai/NEXT_ACTION.md`; **no dedicated gate script** in repo |
| `scripts/accept-staging.mjs` | **`pair_pins_three_layers`** only (private pins) |
| `tests/integration/rls-deny.test.ts` | **`private_notes`** deny + audit_logs; not pins cross-pair |
| E2E | `qa-journeys.spec.ts` mentions couple map copy — not 4-screen Love Map |

---

## Schema gaps (Love Map vs current)

| Need (Master 4-screen) | Current | Gap severity |
|------------------------|---------|--------------|
| Canonical public place record (name, geo, category, hours, source, verification status) | Free-text `place_label` on private pins only | **Blocker** for screens 1–3 |
| Reviews (author, moderation, pair-data firewall) | None | **Blocker** for screen 2 |
| Top-30 snapshot / editorial rank | None | **Blocker** for screen 3 |
| Optional link wishlist pin → catalog place | None | **High** (wishlist UX + analytics) |
| Media per memory pin | `media_objects.pair_id` only | **High** for screen 4 |
| Fuzzy / rounded public coords vs exact couple coords | Exact `lat`/`lng` on pins | **Medium** (privacy policy §VII) |
| Public read RLS vs couple RLS | All pin data pair-scoped | **Blocker** for public layer |
| Staging/demo places without “real venue” fraud | Commerce DEMO pattern exists as **template** | Reuse **status enum** (`DEMO`/`VERIFIED`/`LIVE`), not commerce SKUs |

---

## Privacy and security risks

| ID | Risk | Severity | Evidence / mitigation direction |
|----|------|----------|--------------------------------|
| LM-P1 | **Cross-pair pin leakage** | Medium (mitigated if RLS holds) | `pins_pair_member` uses `is_pair_member`; staging accept reads pins as both users. Extend RLS deny tests for **foreign `pair_id`** and unpaired pairs. |
| LM-P2 | **Journal leakage** | Medium | RLS: author OR `shared_with_partner`; integration test for B ≠ A note. Memories UI **never renders** journals — users may put secrets in shared **`pins.note`** by mistake. |
| LM-P3 | **API vs RLS delete mismatch** | Low–Medium | BFF DELETE requires **`created_by`**; RLS **`pins_pair_member` FOR ALL** may allow partner delete via direct PostgREST — align policy or document as trusted-client only. |
| LM-P4 | **Exact coordinates on couple pins** | Medium | Pins store precise lat/lng; brand promises fuzzy location — not implemented on map markers. |
| LM-P5 | **Geocode query logging** | Low | Server-side Nominatim; queries may contain PII addresses — retention/policy. |
| LM-P6 | **Export scope** | Low (good) | Export **excludes** `private_notes`; still includes **`pins.note`**. |
| LM-P7 | **Public map + couple data join** | **High** (future) | Any `place_id` on pins must not expose partner notes/media in public APIs; strict separation of **public place read** vs **pair pin write**. |
| LM-P8 | **Fake venues as real** | **High** (product trust) | Do not ship Top 30 or discover map on **`commerce_products`** DEMO seeds; require **`verification_status`** + Founder/content gate before LIVE. |
| LM-P9 | **Guest discover map** | Medium (future) | Public routes need rate limits and no PII in place reviews (display names). |

---

## Safe staging implementation order

Order minimizes leakage and avoids presenting fiction as real venues.

1. **Spec lock (no code)** — Paste Master DM-150..167 acceptance criteria into repo; define Top 30 rules (editorial vs computed), review moderation, and **`VERIFIED` vs `DEMO`** place states.
2. **Migration: public place model** — New tables (e.g. `map_places`, `map_place_reviews`, `map_place_rank_snapshots`) with:
   - `status` ∈ {`DRAFT`, `DEMO`, `VERIFIED`, `RETired`} (mirror commerce provider pattern, **separate namespace** from `commerce_*`).
   - **No seed rows** claiming real Hanoi/HCMC businesses unless Founder supplies verified ingest.
   - RLS: **public SELECT** only for `VERIFIED` (and optionally `DEMO` with banner when `ff_love_map_staging`).
3. **Flag + kill switch** — Add `ff_love_map` (or split `ff_love_map_public` / `ff_love_map_couple`) in `feature_flags` + `flags.ts`; default **off** in prod.
4. **Admin / CMS ingest** — Staff-only create/publish places and reviews (reuse admin RBAC patterns); audit log on publish.
5. **Read APIs** — `GET /api/v1/map/places` (bbox/filter), `GET /api/v1/map/places/{slug}`, `GET /api/v1/map/top-30` — **no couple fields**, no pin IDs.
6. **Screen 1 UI** — Public discover map (Mapbox/OSM) consuming read APIs; DEMO banner when staging data only.
7. **Screen 2 UI** — Place detail + reviews; report/block on UGC reviews.
8. **Screen 3 UI** — Top 30 from snapshot table (editorial first; avoid fabricated review counts).
9. **Screen 4 hardening (couple)** — `pin_id` on media, memories page journals + gallery, fuzzy geo; optional **`pins.catalog_place_id`** nullable FK for wishlist from public map **without** copying public UGC into private notes.
10. **Evidence** — Extend `accept-staging.mjs` / RLS suite for public place deny (unauthenticated cannot draft), couple pin isolation, and G-LOVE-MAP checklist; E2E for solo browse → save wishlist pin after pair (if in scope).

**Do not do early:** Rank Top 30 from couple pin counts; import lifestyle MOCK venues as LIVE; auto-create “real” POIs from Nominatim bulk scrape.

---

## Distinction: private couple map vs public Love Map

| Dimension | Private (`/couple/*`) | Public Love Map (Master) |
|-----------|----------------------|---------------------------|
| Audience | Active pair members | Solo/guest + members browsing ideas |
| Data | `pins`, `private_notes`, pair media | Curated `map_places`, public reviews |
| Discovery nav | `/discover` = people | New map-first place discovery |
| Catalog | None | Required for screens 1–3 |
| Current maturity | **PARTIAL/VERIFIED** core | **MISSING** |

---

## References (code touchpoints)

| Area | Path |
|------|------|
| Pins BFF | `apps/web/src/app/api/v1/couples/[id]/pins/route.ts` |
| Journals BFF | `apps/web/src/app/api/v1/couples/[id]/journals/route.ts` |
| Map client | `apps/web/src/components/couple/CoupleMapClient.tsx` |
| Memories page | `apps/web/src/app/(app)/couple/memories/page.tsx` |
| Add memory | `apps/web/src/components/couple/CoupleAddClient.tsx` |
| Geocode | `apps/web/src/app/api/v1/geocode/route.ts` |
| Init schema + RLS | `supabase/migrations/20261011000000_init.sql` |
| DEMO venue commerce (not Love Map) | `supabase/migrations/20261012180000_commerce_catalog_ai.sql`, `apps/web/src/app/(app)/lifestyle/[category]/page.tsx` |

---

## Audit verdict (G-LOVE-MAP readiness)

| Area | Verdict |
|------|---------|
| Private couple map + pins API | **PARTIAL** — usable baseline; media/journal UX incomplete |
| Private couple memories screen | **PARTIAL** |
| Public discover map | **MISSING** |
| Place detail + reviews | **MISSING** |
| Top 30 | **MISSING** |
| Public place catalog (verified) | **MISSING** |
| **Overall G-LOVE-MAP (4-screen Master)** | **NOT READY** — audit-first complete; implementation wave blocked on schema + content model + flags |

**Next doc action:** When Master DM-150..167 rows are available, append acceptance checklist table (per screen) without changing product code until Founder approves scope.
