# Catalog ranking (EXT-033)

Status: sandbox / DEMO only. No sponsored boost live.

## Signals (allowed)

1. **Category match** — exact `commerce_products.category` filter.
2. **Text relevance** — `ilike` on title when `q` present.
3. **Price band** — ascending `price_vnd` default (transparent, not “best deal”).
4. **Active + provider status** — only `DEMO|TEST|VERIFIED`; `LIVE` blocked by DB check.

## Signals (forbidden)

- Private couple journals, raw chat, DeepMind answers without purpose consent.
- Inferred sensitive traits (health, ethnicity, sexuality) from photos/text.
- Silent sponsored ranking — any paid placement must label `sponsored: true` (not implemented; default off).

## AI explanations

When AI ranks gift/style results, explanations must cite **user-stated** occasion/budget/interests only. Catalog cards keep `demo_banner`.

## Metrics (staging)

- Browse → detail → cart draft → DEMO booking (no real capture).
- Diversity: seed 10 SKUs per category; API `limit`/`offset` for pagination tests.
