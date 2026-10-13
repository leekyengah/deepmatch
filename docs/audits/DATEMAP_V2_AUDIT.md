# DATEMAP V2.0 — Pre-implementation Audit

| Field | Value |
|---|---|
| Date | 2026-10-13 |
| Branch | `feature/datemap-v2` |
| Mockup file | **MOCKUP_ASSET_REQUIRED** — `a_high_fidelity_ui_ux_mockup_collage_for_a_dating.png` not in chat assets / repo |

## Architecture split (do not collapse)

| Route | Role | Data |
|---|---|---|
| `/places/map` | **DateMap Discovery** (public date venues) | Editorial catalog + UGC reviews |
| `/couple/map` | Private couple memory pins | Real `pins` + Leaflet/Mapbox |

**Decision:** DateMap V2 UI ships on `/places/map` (nav “Bản đồ hẹn hò”). `/couple/map` stays private memories; links out to discovery for venue pick / planning. Collapsing both would break pair privacy.

## Provider

- Couple: Mapbox if `NEXT_PUBLIC_MAPBOX_TOKEN`, else Leaflet+OSM.
- Places (pre-V2): SVG `SampleMapCanvas` — **not** a live map.
- V2: Leaflet+OSM for discovery (no new paid API). Attribution required.

## Catalog honesty

- `LOVE_PLACES` = 8 editorial fixtures; APIs already `sample: true` / `editorial_fixture`.
- **Must not** present as verified production venue master.
- Real UGC: `place_reviews`, moderation, `venue_admin_flags`.
- No `places` table / PostGIS yet — **Founder approval** for catalog migration + ingest.

## Gaps → this wave

| Capability | Action |
|---|---|
| Dual-panel + live map | Implement DateMapHub + Leaflet |
| Filters / DSS | Client+API filters; DSS v1 experimental |
| Favorites | Device localStorage (no migration) |
| Date planning | Create `couple_dates` when pair exists |
| Reviews | Keep overall rating; multi-dim needs schema GO |
| Mockup pixel QA | Blocked until asset attached |

## Approval needed

1. Attach mockup PNG → visual fidelity pass.
2. Production venue catalog migration + verified ingest (not invented).
3. Paid map APIs beyond OSM/Mapbox token already in project.
4. Multi-dimensional review columns / PostGIS.
