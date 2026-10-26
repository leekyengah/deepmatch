# DM-016 / DM-019 — Wireframes & UI states (as-built)

Live routes on staging `datingvn.com` implement the wireframe set:

| Surface | Route | Empty / loading / error |
|---|---|---|
| Landing | `/` | Brand hero + CTA |
| Auth | `/login`, `/signup` | Form validation |
| Onboarding | `/onboarding` | Mode + discovery |
| Discover | `/discover` | Empty when no candidates / opt-in off |
| Likes | `/likes` | Empty matches |
| Chat | `/chat` | No mutual / flag off / report-block |
| Couple | `/couple/*` | Invite gate, pin empty |
| Services | `/services`, `/bookings` | Flag off / empty bookings |
| Me | `/me/*` | Privacy, deep, history, account |
| Admin | admin app | Staff RLS empty queues |

Design tokens: `docs/p1/DM-017-design-tokens.md` + Tailwind `dm-*`.

Usability (DM-018): QA seeded accounts + Playwright `qa-journeys` = automated smoke; real-user sessions still Founder-scheduled.
