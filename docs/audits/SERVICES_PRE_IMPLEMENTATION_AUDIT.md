# SERVICES_PRE_IMPLEMENTATION_AUDIT — SERVICE-001 Premium Concierge Marketplace

**Date:** 2026-10-13  
**Branch target:** `feature/services-premium-concierge`  
**PRODUCTION WRITE LOCK:** TRUE (no prod migration, no live payment, no auto-deploy)

## 1. Repository / stack

| Item | Evidence |
|---|---|
| Monorepo | `apps/web`, `apps/mobile`, `apps/admin`, `packages/*`, `supabase/` |
| Web | Next.js App Router — `apps/web` |
| Mobile companion tab | `apps/mobile/app/(tabs)/companion.tsx` → opens web `/services` |
| Auth | Supabase Auth + RLS |
| Feature flag | `ff_concierge` / `FF_CONCIERGE` — `apps/web/src/lib/flags.ts` |
| Package manager | npm workspaces (root `package.json`) |

## 2. Routes (AS-IS)

| Route | File | Role |
|---|---|---|
| `/services` | `apps/web/src/app/(app)/services/page.tsx` | Catalog hub (2 sections, flat cards) |
| `/services/[slug]` | `…/services/[slug]/page.tsx` | Package detail |
| `/services/[slug]/request` | `…/request/page.tsx` | Intake form |
| `/services/providers` | `…/providers/page.tsx` | Provider list (partial) |
| `/bookings` | `apps/web/src/app/(app)/bookings/page.tsx` | User bookings |
| API `GET/POST /api/v1/services/bookings` | `apps/web/src/app/api/v1/services/bookings/route.ts` | Request/list |
| API `GET /api/v1/services/offerings` | `…/offerings/route.ts` | Offerings bridge |
| Checkout | `/checkout/*`, `/api/v1/checkout/*` | Sandbox PSP path exists; LIVE gated |

Nav: `nav.ts` maps Đồng hành → `/services`.

## 3. Catalog source of truth

| Source | Status |
|---|---|
| Master tab32 `SERVICE PACKAGES & PRICING` | Canonical commercial copy + prices |
| `apps/web/src/lib/companion-packages.ts` | In-repo versioned display catalog — **7 packages**, prices match tab32 |
| `public.service_offerings` | Minimal schema (`title`, `description`, `active`) — seeded by title string, **not** full package model |
| Production vs tab32 prices | **No DATA_CONFLICT detected** vs in-repo catalog (498k…43.8M sale prices) |

### 7 packages (reference — do not mutate prod prices)

| Code | Sale VND | Duration |
|---|---:|---|
| CMP-01 | 498_000 | 1×45m |
| CMP-02 | 1_498_000 | 1×2h |
| CMP-03 | 3_380_000 | 4w / 4×45m |
| CMP-04 | 9_980_000 | 4w / 8h |
| MAT-01 | 4_980_000 | 30d |
| MAT-02 | 16_980_000 | 90d |
| MAT-03 | 43_800_000 | 180d |

## 4. Database / RLS (AS-IS)

| Table | Notes |
|---|---|
| `service_offerings` | Thin catalog; RLS select active |
| `service_bookings` | `status booking_status default 'requested'`; meta JSON added in later migration; requester RLS |
| Missing vs SERVICE-001 target | `service_package_versions`, benefits join tables, provider availability, payments/refunds/disputes dedicated tables, recommendation sessions |

**Decision:** Reuse `service_offerings` + `service_bookings` + checkout orders for Phase D/E scaffolding. Propose additive migrations only on **staging** after Gate 0 ADR — **not applied in this change set** (WRITE LOCK).

## 5. Booking / payment (AS-IS)

- Booking POST creates `service_bookings` with status `requested` after provider/offering resolve — **sandbox**, not full state machine DRAFT→…→COMPLETED.
- Payment: Lifestyle/checkout sandbox adapters exist; companion package checkout paths partially wired via `COMPANION_PACKAGES` in checkout orders.
- **LIVE payment OFF** — must remain `SERVICES_PAYMENT_LIVE=false` / existing FF gates.
- Tab33 CP-08 requires partner confirm **before** full charge — not fully enforced in UI state machine yet.

## 6. Admin

- `apps/admin` has booking count widgets — no full CMS for package versions / assignment / refunds.
- Gap: SERVICE-001 admin ops → PARTIAL / NOT_STARTED for dedicated service dashboard.

## 7. Design system

- Tokens wine `#6B2D3C`, ivory `#F7F3EE`, champagne `#A88A62` already in web CSS / HomeDashboard / Lifestyle.
- Current `/services` UI: simple card grid — **not** mockup-faithful Premium Concierge Marketplace.
- Mockup assets copied to `docs/design/services-mockups/`.

## 8. Gaps vs SERVICE-001

| Module | AS-IS | Gap |
|---|---|---|
| Premium UI | Flat 2-section list | Hero, trust, filters, compare, FAQ, final CTA |
| 7 packages | Present in TS catalog | Need mockup cards + imagery + filters |
| Detail | Exists per slug | Sticky CTA polish; shared benefit source OK |
| Comparison | Missing | Build matrix from catalog |
| Recommendation wizard | Missing | New client flow |
| Booking engine | Basic requested | Full state machine + hold/expiry |
| Payment adapter | Checkout sandbox | Abstract SERVICES_* flags; no LIVE |
| Admin ops | Minimal | BLOCKED until schema ADR |
| Security/RLS tests | Partial | Expand negative tests |
| Prod deploy | N/A | **FORBIDDEN** this task |

## 9. Dependency graph (implementation)

```
Gate0 Audit (this doc)
  → Gate1 UI (mockup sections)
    → Gate2 Catalog/Detail/Compare/Wizard
      → Gate3 Booking state (sandbox)
        → Gate4 Payment adapter (LIVE=false)
          → Gate5 Ops/QA
            → Gate6 Prod readiness (human GO only)
```

Reuse: `companion-packages.ts`, `PackageRequestClient`, `PackageBookButton`, checkout sandbox, design tokens, i18n `booking.*`.

## 10. Risks

1. Activating LIVE payment without legal/ops GO → **STOP**.
2. Claiming “24/7” / absolute verification without ops capacity → copy must stay truthful (tab32 limits already forbid 24/7).
3. Schema sprawl duplicating `service_offerings` → prefer versioned packages table later via ADR.
4. Untracked media WIP previously broke Vercel builds — keep deploy tree clean; **this task does not auto-deploy**.

## 11. Phase A verdict

| Gate | Status |
|---|---|
| GATE 0 — Architecture & Audit | **PASS (docs)** — evidence above |
| Remaining gates | NOT_STARTED / to be filled by later phases |

**Next:** Phase B/C UI + catalog enhancement on branch only.
