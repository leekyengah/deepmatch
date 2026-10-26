# Companion module audit (Master DM-168 / Đồng hành)

**Date:** 2026-10-13  
**Scope:** Web concierge (`ff_concierge`), mobile Companion tab, admin services queue — **not** Lifestyle catalog (`ff_lifestyle` / `commerce_*`) or live PSP flows (EXT-040 BLOCKED).  
**Sources:** `apps/web` services + bookings, Supabase migrations/seeds, `.ai/feature-matrix*.json`, `docs/brand/TONG_QUAN_THUONG_HIEU_SAN_PHAM.md`, `docs/p1/DM-015-sitemap.md`, `docs/evidence/HIDE-SANDBOX-GO-LIVE-2026-10-13.md`.

---

## Executive summary

Companion is implemented as a **minimal concierge**: four seeded advisory offerings, list + “request consultation” (creates `requested` booking), user booking history, and admin assign-advisor. There is **no pricing column**, **no pre-confirm fee/scope UI**, **no payment or invoice**, and **no catalog admin UI**. Product copy promises fees before confirmation; the database and `ServicesClient` do not deliver that yet.

**Catalog coverage:** Repo canon = **4 / 7** packages for Master DM-168 — the four seeded titles match brand doc §III. **Three additional Master SKUs are not named in repo** (Google Sheet / DM-168 detail unavailable here); do not invent titles or prices until Founder pastes Master catalog.

---

## Master vs repo: service packages (4 / 7)

| # | Title (seed + brand) | In DB seed | Pricing in repo |
|---|----------------------|------------|-----------------|
| 1 | Deep Profile 1:1 | Yes (`20261012030000_media_bucket_concierge.sql`) | Not stated (brand §IX: pricing not finalized) |
| 2 | Matching Strategy | Yes | Not stated |
| 3 | Private Date Curation | Yes | Not stated (brand: disclose fee/cancel before confirm) |
| 4 | After-Match Coaching | Yes | Not stated |
| 5–7 | Master DM-168 extensions | **No seed, no migration, no doc names** | — |

**Acceptance today:** `scripts/accept-staging.mjs` expects `active` offerings **count ≥ 4**.

**Not Companion (do not merge scopes):** `/api/v1/catalog/bookings` + `commerce_demo_bookings` are **Lifestyle DEMO** (`SANDBOX_ONLY`, `quote_vnd`) under `ff_lifestyle` — hidden from primary nav per `docs/evidence/HIDE-SANDBOX-GO-LIVE-2026-10-13.md`.

---

## Feature flags and kill switch

| Flag | Default (init migration) | Staging evidence | Gates |
|------|--------------------------|------------------|--------|
| `ff_concierge` | `false` | DB often `true`; env `FF_CONCIERGE` via `apps/web/src/lib/flags.ts` | `/services`, `/bookings`, `/api/v1/services/*` |

When off: server pages show `ErrorState` (`booking.flagOff*`); APIs return `FORBIDDEN` / `flagConciergeOff`.

---

## Routes and navigation

### Web (`apps/web`)

| Route | Component | Behavior |
|-------|-----------|----------|
| `/services` | `services/page.tsx` + **`ServicesClient`** | Flag gate → catalog grid → POST booking |
| `/bookings` | `bookings/page.tsx` + **`BookingsClient`** | Flag gate → list own bookings |
| `/me` | Journey tile → `/services` | Companion entry |
| `/` | Marketing pillar → `/services` | Guest marketing only |
| Nav | `nav.ts` | `nav.companion` → `/services` (desktop + mobile shell) |

### Mobile (`apps/mobile`)

| Route | Behavior |
|-------|----------|
| `(tabs)/companion` | Copy + **`Linking.openURL(`${WEB}/services`)`** — no in-app catalog or booking |

### Admin (`apps/admin`)

| Route | Behavior |
|-------|----------|
| `/services` | Queue `requested` / `assigned`; **`assignBookingAction`** → RPC `staff_assign_booking` |

No admin route to create/edit/deactivate offerings (DM-041 catalog ops still manual SQL / migration).

---

## API surface

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/v1/services/offerings` | User + `ff_concierge` | `id, title, description, active` |
| GET | `/api/v1/services/bookings` | User | Own rows + joined offering title/description |
| POST | `/api/v1/services/bookings` | User | Body: `offering_id`, optional `pair_id`, `note` (note → outbox only) |

Documented in `docs/architecture/API_CONTRACTS.md`. **No PATCH** for user cancel on web BFF (RLS allows requester update to `cancelled` only — UI not wired).

**Side effect:** POST enqueues outbox `booking.requested` (best-effort); no in-repo consumer evidence for advisor notifications.

---

## Schema (Supabase)

From `supabase/migrations/20261011000000_init.sql` + concierge migration:

**`service_offerings`**

- `id`, `title`, `description`, `active`
- No: `slug`, `sort_order`, `price_vnd`, `currency`, `scope_json`, `cancel_policy`, `duration`, `sku_code`

**`service_bookings`**

- `offering_id`, `requester_id`, optional `pair_id`, optional `advisor_id`
- `status`: enum `requested` | `assigned` | `completed` | `cancelled`
- No: `quote_vnd`, `scheduled_at`, `consent_version`, `payment_status`, `notes` column (API `note` not persisted on row)

**RLS:** Active offerings readable by authenticated users; bookings scoped to requester/advisor/staff; insert validates active offering + optional pair membership.

**Staff:** `staff_assign_booking` sets `advisor_id` + `assigned`, writes `audit_logs`.

---

## UI: `ServicesClient` and `BookingsClient`

**`ServicesClient`** (`apps/web/src/components/services/ServicesClient.tsx`):

- Fetches offerings; renders **Card** per service with `Badge` “Optional”
- CTA: **Request consultation** → POST `{ offering_id }` only (no pair picker, no note field, no confirm step)
- Success copy links to `/bookings`
- **Does not display price, duration, cancel terms, or advisor identity** (i18n `booking.servicesIntro` claims four services and pre-confirm fees — UI gap)

**`BookingsClient`:**

- Read-only list with localized status labels
- No cancel action, no assigned advisor display, no schedule

**Services page chrome:** DEMO badge removed per go-live hide pass; product positioning is “Concierge” / Companion, not sandbox DEMO.

---

## Journey vs implementation (DM-005 Journey 4)

Documented: *Browse → Book → Consent grants → Advisor assigned → Notes scoped → Close case*.

| Step | Status |
|------|--------|
| Browse / book | **Implemented** (minimal) |
| Consent grants | **Missing** (no concierge-specific consent key in booking flow) |
| Advisor assigned | **Partial** (admin RPC; user UI doesn’t show advisor) |
| Notes scoped | **Missing** (no advisor notes tables / ACL in repo) |
| Close case | **Partial** (status enum exists; no user/admin complete flow in UI) |

P4 tracker items DM-041–047 remain largely **Chưa bắt đầu** in `.ai/tracker-open.txt` while code exceeds pure scaffold — reconcile Master status separately.

---

## Legal / product constraints (no LIVE payment)

- `LEGAL-GAP-PARTNER-DISCLOSURE`: pre-booking partner/fee disclosure not uniform per offering.
- EXT-040 / G-PREMIUM-LIVE: **no real PSP charge** for companion in this phase.
- Safe pattern already used elsewhere: **`commerce_demo_bookings`** with `quote_vnd`, idempotency, `DEMO_*` statuses — **sandbox only**, not wired to `service_bookings`.

Do **not** enable Stripe/Apple flows for companion until pricing, disclosure, and Legal sign-off exist.

---

## Gaps vs 7-package Master scope (DM-168)

1. **Catalog:** Only **4** offerings seeded; **3 Master packages** absent from DB, API, and UI (names not in repo — blocked on Master input).
2. **Pricing & disclosure:** No `price_vnd` / quote on offerings or bookings; UI copy promises fees before confirm but **`ServicesClient` shows none** (brand §III #3, §IX).
3. **Booking depth:** No confirm step, **`pair_id` / `note` unused in UI**, no user cancel, no `scheduled_at`, no post-session feedback (DM-046).
4. **Ops & admin:** Admin assigns advisor only — **no offering CRUD**, no complete/cancel queue, no DM-047 cost/ops dashboard; Journey 4 consent step missing.
5. **Mobile parity:** Companion tab is **external browser deeplink** only — no native list/book/status (COUPLE-03 partial vs web).

---

## Safe next implementation steps (sandbox only)

Ordered for minimal risk; each step should stay behind `ff_concierge` and avoid LIVE providers.

1. **Schema extension (migration):** Add nullable `display_price_vnd`, `price_disclosure_text`, `sort_order`, `slug` on `service_offerings`; optional `quote_vnd`, `consent_key`, `scheduled_at` on `service_bookings` — populate from Founder-approved Master list when DM-168 SKUs #5–7 are defined.
2. **Seed / admin catalog:** Idempotent seed or admin-only CRUD for **7 rows** once titles/descriptions approved; keep inactive flag for drafts.
3. **`ServicesClient` v2:** Detail drawer or second step showing **scope + indicative fee + cancel policy** (static fields from DB); optional `pair_id` when user has active pair; persist `note`; explicit “Send request” confirm — still **no charge**.
4. **Sandbox quote (optional):** Mirror `commerce_demo_bookings` pattern: on confirm, set `quote_vnd` from offering display price and status `requested` with receipt string in i18n — **no webhook, no Stripe**.
5. **Bookings UX + admin:** User cancel → `cancelled`; show `advisor_id` (display name via profile join); admin actions for `completed`; wire DM-046 feedback as private row + RLS later.
6. **Mobile:** Either WebView to `/services` with session cookies or duplicate read-only catalog API client — defer until web catalog stable.
7. **Evidence:** Extend `accept-staging.mjs` to assert offering count **≥ 7** only after Master seed lands; until then keep threshold at 4.

---

## Related files (quick index)

| Area | Path |
|------|------|
| Catalog UI | `apps/web/src/components/services/ServicesClient.tsx` |
| Bookings UI | `apps/web/src/components/services/BookingsClient.tsx` |
| BFF | `apps/web/src/app/api/v1/services/offerings/route.ts`, `.../bookings/route.ts` |
| Seed | `supabase/migrations/20261012030000_media_bucket_concierge.sql` |
| Admin queue | `apps/admin/src/app/services/page.tsx`, `actions.ts` |
| i18n | `packages/i18n/locales/*/booking.json` |
| Brand catalog (4) | `docs/brand/TONG_QUAN_THUONG_HIEU_SAN_PHAM.md` §III |
| Feature matrix | `.ai/feature-matrix-2026-10-13.json` (Đồng hành rows) |

---

## DM-168 note

**DM-168** is referenced as the Master task for companion packages; it does **not** appear in `.ai/tracker-open.txt` (tracker tops out at DM-065+ in the open export). Treat **7-package scope** as Master intent: **4 implemented in repo**, **3 SKUs + pricing table** to be imported from Master when available — not invented in code or docs.
