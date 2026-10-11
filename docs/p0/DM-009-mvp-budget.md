# DM-009 — MVP Budget Estimate (Ranges)

**Status:** In review — assumptions only; not a finance commitment  
**Dependency:** DM-008

## Assumptions

- Team: 1–2 engineers + Founder product + part-time moderator for beta.
- Users (closed beta): ≤ 2,000 MAU.
- Media: avg 20 images / active couple / month; video opt-in capped.
- Map: Mapbox free tier → paid if geocoding spikes.
- Hosting: 1 staging + 1 prod Supabase; Vercel Pro optional.

## Cost ranges (USD / month, beta)

| Item | Low | High | Notes |
|---|---|---|---|
| Supabase | 0–25 | 75–200 | Pro if storage/realtime grows |
| Vercel | 0–20 | 20–100 | Bandwidth |
| Mapbox | 0–50 | 100–300 | Quotas + monitoring |
| Storage/egress | 10 | 150 | Video caps critical |
| SMS/email auth | 0–20 | 50 | Prefer magic link email |
| Moderation tooling | 0 | 100 | Manual queue first |
| Legal/counsel | one-time 500–3,000 | — | Before public |

## Human effort (engineering weeks, indicative)

| Wave | Weeks (1 eng) |
|---|---|
| P0 docs/ADR | 1 |
| P1 platform + UX contracts | 2–3 |
| P2 identity/personal/pair | 3–4 |
| P3 matching/chat/map | 4–6 |
| P4 concierge/admin | 2–3 |
| P5 QA/beta | 2–3 |

## GO criteria

Founder accepts ranges + spend caps + staffing for moderation SLA.

## Acceptance

- [x] Ranges + assumptions documented
- [ ] Founder budget GO (G0)

**Proposed status:** In review
