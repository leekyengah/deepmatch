# Audit — Lifestyle Premium Redesign (pre-change)

**Date:** 2026-10-13  
**Target:** https://datingvn.com/lifestyle  
**Branch:** `feat/lifestyle-premium-redesign`

## 1. Current surface

| Route | Role | Flag |
|---|---|---|
| `/lifestyle` | Flat 11-card module grid (DeepGift…DeepMind) | `ff_lifestyle` |
| `/lifestyle/{gift\|fashion\|beauty\|venue\|travel\|safety}` | Category listing from `commerce_products` | same |
| `/lifestyle/{cat}/{mockId}` | Product detail + book + cart | same |
| `/lifestyle/cart` | Cart client → sandbox checkout | same |
| `/lifestyle/orders` | Booking/order history | same |
| `/safe` | Free safety center (linked) | open |
| `/ai`, `/ai/deepmind` | Assist hub (linked) | `ff_ai` |
| `/places/map` | Date discovery map (LOVE_PLACES) | open |
| `/services`, `/couple` | Companion / couple integrations | open |

## 2. APIs / DB (preserve)

- **APIs:** `/api/v1/catalog/{categories,products,cart,cart/checkout,bookings}`
- **Tables:** `commerce_products`, `commerce_providers`, cart/booking tables (sandbox)
- **Flags:** `FF_LIFESTYLE`; Provider LIVE still EXT-040 gated
- **Components:** `DemoBookButton`, `DemoCartClient`, `AddToCartButton`, `DemoBookingActions` (functional; rename UX only)

## 3. Gaps vs objective

1. Homepage is a **technical module list** — not a marketplace.
2. No hero / search / featured / partners / couple experiences composition.
3. AI Date Planner + Date Discovery Map not surfaced on Lifestyle hub.
4. Weak visual depth vs Premium Editorial home/Sánh đôi.
5. Cart/orders still named with residual “demo” keys in i18n (partially purged).

## 4. Constraints

- No DB/API contract drops; no fake LIVE PSP/provider claims.
- Catalog rows from `commerce_products` remain source of commercial truth.
- Place discovery may use curated `LOVE_PLACES` (already in product) — not sold as LIVE booking inventory.
- Couple private map stays on `/couple/map` (auth + pair RLS); Lifestyle map is public curated discovery.

## 5. Redesign approach (this change set)

1. Rebuild `/lifestyle` as Premium Relationship Experience Marketplace (hero, search, groups, featured, partners, couple strip, AI planner, date map).
2. Regroup 11 links → **Commercial services** + **Support utilities** (routes preserved).
3. Premium polish on category listing + product detail (no schema change).
4. Wire CTAs to existing `/places/map`, `/ai`, `/services`, `/couple`, checkout.
5. Audit + QA docs; Master tab13; production deploy when green.
