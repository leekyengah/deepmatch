# SERVICES_MOCKUP_COMPARISON — SERVICE-001

**Assets:** `docs/design/services-mockups/services-desktop.png`, `services-mobile-4up.png`  
**Implementation:** `ConciergeMarketplace` + package detail + `/services/recommend`

| Section | Mockup | Implemented | Gap |
|---|---|---|---|
| Hero + lifestyle image + quote | Yes | Yes | Visual overlay % not measured |
| Dual CTA explore / consult | Yes | Yes | — |
| Trust bar 4 items | Yes (incl. 24/7 in mock) | Yes — **truthful** copy (no unverified 24/7) | Intentional deviation |
| Filters All / Companion / Matchmaking | Yes | Yes | — |
| Need tags | Yes | Yes | — |
| 4+3 package cards w/ image | Yes | Yes | Licensed fixture photos |
| Compare matrix dots | Yes | Yes | Desktop table; mobile scrolls |
| 4-step process | Yes | Yes | — |
| Safety + FAQ + final CTA | Yes | Yes | FAQ from i18n not CMS |
| Booking date widget on marketing page | Mock screen 04 | Deferred to `/services/[slug]/request` | PARTIAL |
| Pixel-perfect PASS | Required with evidence | **NOT_TESTED** | Need screenshot matrix |

**Verdict:** UI structure IMPLEMENTED; Gate1 visual regression **NOT_TESTED** (no self PASS).
