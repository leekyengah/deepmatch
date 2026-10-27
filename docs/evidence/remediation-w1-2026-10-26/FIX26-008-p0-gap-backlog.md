# FIX26-008 — P0 mockup/spec ↔ source gap backlog (2026-10-26)

**Status:** DONE_PENDING_QA  
**Sources:** `.ai/feature-matrix.json`, Sheet24 NO-GO, LOVE_MAP audit, NEXT_ACTION  
**AC:** prioritized gap list (Product/Founder to sign)

| Pri | Gap | Spec expectation | Source today | Dependency |
|-----|-----|------------------|--------------|------------|
| P0 | Maps Love Map LIVE | Paid Maps + quota | OSM/Mapbox optional token | Cloud billing |
| P0 | PSP LIVE settlement | Real pay | Sandbox / HD Bank staging path only | Legal+Finance GO |
| P0 | Store binary | ASC/Play | Expo Go LAN only | Signing keys |
| P0 | Legal counsel pack | Signed ToS/Privacy | Routes + unchecked pack | Counsel |
| P0 | pin_id migration both envs | Schema parity | Local migration; push blocked | DB password |
| P0 | LEAK/IDOR fresh | 0 critical | Historical probes only | Staging harness |
| P1 | Visual fidelity G-SANH-DOI / G-PAY | Mockup side-by-side | Routes exist; gates NO-GO | Design UAT |
| P1 | Phone OTP | Auth matrix | NOT_STARTED | SMS provider |
| P1 | field_visibility UI | Privacy controls | jsonb unused in UI | Eng |
| P1 | Love Map watermark/redaction | Share safe | Export UI only | Eng/Privacy |
| P1 | AI eval rubric | Safety KPI | NOT_STARTED | AI Lead |
| P2 | Visual regression CI | Baseline screenshots | Ad hoc evidence only | QA tooling |

**Sign-off:** Product + Founder required before treating list as closed.
