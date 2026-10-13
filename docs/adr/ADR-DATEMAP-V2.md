# ADR — DateMap V2 Discovery

## Status

Accepted for implementation 2026-10-13 (UI + scoring on editorial catalog). Catalog master deferred.

## Context

Product brief targets premium date discovery with real map, filters, planning, reviews. Repo already separates private couple pins from public places fixtures.

## Decision

1. Ship DateMap Discovery at `/places/map`.
2. Keep `/couple/map` as private pin map; deep-link planning into `couple_dates`.
3. Use Leaflet + OSM tiles (cost-safe); Mapbox optional later.
4. Surface editorial catalog with explicit **unverified / editorial** labels; never invent prices/ratings.
5. DSS v1 is **experimental** (`dssVersion: "1.0-exp"`); missing inputs → Insufficient Data, no fabricated scores.
6. Favorites = localStorage until `venue_favorites` migration approved.
7. No destructive prod migration in this wave.

## Consequences

- Honest UX over fake density.
- Mockup pixel match incomplete until asset received (`MOCKUP_ASSET_REQUIRED`).
