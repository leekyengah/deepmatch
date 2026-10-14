# Full UX Route Audit — DM-109 / EXT-085

**Scope:** Read-only inventory from `apps/web/src/app` and `apps/mobile/app` (2026-10-13).  
**Flags (staging/prod per `docs/evidence/HIDE-SANDBOX-GO-LIVE-2026-10-13.md`):** `ff_lifestyle=false`, `ff_ai=false`; `ff_matching`, `ff_discovery`, `ff_chat`, `ff_concierge` true unless DB overrides.

**Legend**

| Status | Meaning |
|--------|---------|
| VERIFIED | Route file exists; UI/API wiring present; reachable under current flags |
| PARTIAL | Exists but stub, duplicate nav, hidden tab, flag-degraded UI, or web-only bridge |
| MISSING | Expected member surface not present in that app |
| BLOCKED | `redirect("/me")`, API 403, or hard error when flag off |

**Auth roles:** `guest` (no session) · `user` (signed-in member) · `couple` (active pair; enforced in page/API, not always at layout) · `staff` (`admin_roles` or hardcoded allowlist on `/me` only)

**UXA mapping:** No `UXA-*` IDs in repo; screen IDs below use existing doc labels (`WEB-*`, `DATING-*`, `COUPLE-*`, `UI-*` from `docs/p1/DM-015-sitemap.md`) where obvious. Otherwise **TBD**.

---

## Web — member-facing pages (43)

| Path | Status | Role | Flags / gates | UXA |
|------|--------|------|---------------|-----|
| `/` | VERIFIED | guest; authed non-guest → `resolveHomeState` redirect | — | WEB-01..06 |
| `/login` | VERIFIED | guest | — | TBD |
| `/signup` | VERIFIED | guest | — | TBD |
| `/forgot-password` | VERIFIED | guest | — | TBD |
| `/auth/reset` | VERIFIED | guest | — | TBD |
| `/onboarding` | VERIFIED | user | redirects if no session | DATING-01 |
| `/privacy` | VERIFIED | guest | — | TBD |
| `/terms` | VERIFIED | guest | — | TBD |
| `/faq` | VERIFIED | guest | — | TBD |
| `/support` | VERIFIED | guest | — | TBD |
| `/account-deletion` | VERIFIED | guest/user | — | TBD |
| `/legal` | VERIFIED | guest | — | TBD |
| `/legal/[slug]` | VERIFIED | guest | — | TBD |
| `/couple/join` | VERIFIED | guest/user | invite `code` query | TBD |
| `/home` | VERIFIED | user | lifestyle/AI tiles hidden when flags off | TBD |
| `/discover` | PARTIAL | user* | needs `ff_discovery` ∧ `ff_matching`; no SSR login redirect | DATING-02/03 |
| `/likes` | VERIFIED | user* | client → `/api/v1/likes` | UI-02 |
| `/chat` | VERIFIED | user matched* | `ff_chat` → `ChatShell`; client auth | DATING-04 |
| `/services` | VERIFIED | user* | `ff_concierge` off → ErrorState (on in prod evidence) | COUPLE-03 |
| `/bookings` | VERIFIED | user* | same as services | TBD |
| `/safe` | VERIFIED | user* | `DeepSafeClient` → safety APIs | TBD |
| `/me` | PARTIAL | user | see § `/me` issues | UI-11 |
| `/me/edit` | VERIFIED | user | server redirect if no session | UI-11 |
| `/me/deep` | VERIFIED | user | | UI-22 |
| `/me/privacy` | VERIFIED | user | | UI-12 |
| `/me/history` | VERIFIED | user | | UI-11 |
| `/me/account` | VERIFIED | user | billing UI gated by `ff_billing` | UI-29 |
| `/me/premium` | VERIFIED | user | `ff_premium` / `ff_billing` | TBD |
| `/couple` | VERIFIED | user | commerce bridge cards gated `ff_lifestyle` ∨ `ff_ai` | COUPLE-01 |
| `/couple/map` | VERIFIED | couple* | login required | COUPLE-01 |
| `/couple/memories` | VERIFIED | couple* | | COUPLE-02 |
| `/couple/add` | VERIFIED | couple* | | TBD |
| `/couple/promises` | VERIFIED | couple* | | TBD |
| `/couple/us` | VERIFIED | couple* | | COUPLE-04 |
| `/couple/invite` | VERIFIED | user | client → couple-invitations API | TBD |
| `/lifestyle` | BLOCKED | user | `ff_lifestyle` → `/me` | TBD |
| `/lifestyle/[category]` | BLOCKED | user | DEMO catalog when flag on | TBD |
| `/lifestyle/[category]/[mockId]` | BLOCKED | user | | TBD |
| `/lifestyle/cart` | BLOCKED | user | | TBD |
| `/lifestyle/orders` | BLOCKED | user | | TBD |
| `/ai` | BLOCKED | user | `ff_ai` → `/me` | TBD |
| `/ai/coach` | BLOCKED | user | | TBD |
| `/ai/deepmind` | BLOCKED | user | | TBD |

\*Several `(app)` routes lack server-side `redirect("/login")`; session enforced via APIs/RLS and client components.

**Web shell / nav (`AppShell`, `nav.ts`):** Desktop sidebar: Home, Discover, Likes, Chat, Couple, Services, Me. Mobile bottom (ADR-11): Discover, Couple (memories label), Companion → `/services`, Chat, Me — **no `/home`**, **no `/likes`**, lifestyle/AI not linked (intentional hide).

---

## Web — API routes (48)

| Path | Member-facing | Flag / notes |
|------|---------------|--------------|
| `/auth/callback` | auth | OAuth |
| `/api/health`, `/api/v1/health` | ops | public health |
| `/api/v1/me/profile`, `/api/v1/me/home-state`, `/api/v1/me/consents`, `/api/v1/me/delete` | user | core profile |
| `/api/v1/discovery/candidates` | user | discovery |
| `/api/v1/likes`, `/api/likes` | user | legacy + v1 |
| `/api/v1/matches`, `/api/v1/messages`, `/api/messages` | user | chat |
| `/api/v1/chat/access`, `/api/chat/access`, `/api/v1/chat/read` | user | chat gate |
| `/api/v1/matching/rank`, `/api/matching/rank` | user | ranking |
| `/api/v1/blocks`, `/api/v1/reports` | user | safety |
| `/api/v1/safety/contacts`, `/api/v1/safety/checkins` | user | DeepSafe |
| `/api/v1/couple-invitations`, `.../accept` | user | pair |
| `/api/v1/couples/[id]/*` | couple | pins, journals, export, disconnect |
| `/api/pairs/invites`, `/api/pairs/accept` | user | legacy pair |
| `/api/v1/services/offerings`, `/api/v1/services/bookings` | user | concierge |
| `/api/v1/catalog/*` | user | **BLOCKED** when `ff_lifestyle` off |
| `/api/v1/ai/*` | user | **BLOCKED** when `ff_ai` off |
| `/api/v1/media/upload-intents`, `/api/v1/media/export` | user | `ff_media_upload` (not audited here) |
| `/api/v1/payments/*` | user | webhooks + checkout; staff/system for notifications |
| `/api/v1/analytics/events` | user | beacon |
| `/api/v1/geocode` | user | map helper |

---

## Mobile — Expo Router (11 screens)

| Route | URL | Status | Role | Notes | UXA |
|-------|-----|--------|------|-------|-----|
| `(auth)/login` | `/login` | VERIFIED | guest | root `Gate` | TBD |
| `(auth)/signup` | `/signup` | VERIFIED | guest | | TBD |
| `(tabs)/discover` | `/discover` | VERIFIED | user | `GET /api/v1/discovery/candidates` | DATING-02 |
| `(tabs)/chat` | `/chat` | VERIFIED | user | → `chat/[id]` | DATING-04 |
| `chat/[id]` | `/chat/:id` | VERIFIED | user | messages API | DATING-04 |
| `(tabs)/me` | `/me` | PARTIAL | user | IAP + legal URLs; no native profile subroutes | UI-11 |
| `(tabs)/couple` | — | PARTIAL | user | marketing card; opens `${WEB}/couple` | COUPLE-01 |
| `(tabs)/companion` | — | PARTIAL | user | opens `${WEB}/services` | COUPLE-03 |
| `(tabs)/likes` | — | PARTIAL | user | **hidden tab** (`href: null`); screen wired | TBD |
| `(tabs)/index` | — | PARTIAL | user | **hidden** persona home; not in 5-tab bar | TBD |
| `+not-found` | — | VERIFIED | — | | TBD |

**Mobile MISSING (vs web member surfaces):** `/home`, `/onboarding`, `/likes` (in tab bar), native `/couple/*`, `/safe`, `/me/edit|deep|privacy|…`, `/lifestyle/*`, `/ai/*`, `/bookings`.

---

## Feature flags — lifestyle / AI

| Surface | Flag | When OFF (current) |
|---------|------|---------------------|
| Pages `/lifestyle`, `/lifestyle/*` | `ff_lifestyle` | `redirect("/me")` |
| Pages `/ai`, `/ai/coach`, `/ai/deepmind` | `ff_ai` | `redirect("/me")` |
| APIs `/api/v1/catalog/*` | `ff_lifestyle` | rejected in route handlers |
| APIs `/api/v1/ai/*` | `ff_ai` | rejected |
| `/home` tiles | both | omitted from grid |
| `/couple` commerce bridge | either | bridge section hidden |
| Primary nav | — | lifestyle/AI not listed (`nav.ts`) |

Env + DB: `apps/web/src/lib/flags.ts` merges `FF_*` env with `feature_flags` table (service role on SSR).

---

## `/me` page structure (web)

Source: `apps/web/src/app/(app)/me/page.tsx`

| Issue | Detail |
|-------|--------|
| Menu box duplication | Grid links repeat **primary nav** destinations (Discover, Chat, Couple, Services) already in `AppShell` sidebar / bottom bar |
| Missing hub links | No `/home`, `/safe`, `/likes`, `/bookings`; lifestyle/AI absent while flags off (expected) |
| Flat card UX | All subpages same visual weight; no grouping (profile vs journey vs account) |
| Admin affordance | **Staff-only** card linking to external admin (`NEXT_PUBLIC_ADMIN_URL`); `isStaff` includes `admin_roles` **and hardcoded member email** in source — policy/ops smell, not shown to all users |
| Role of `/me` vs `/home` | Both persona hubs; `/home` in nav, `/me` is profile + duplicate links |

---

## Status counts (member-facing pages only)

| App | VERIFIED | PARTIAL | BLOCKED | MISSING† |
|-----|----------|---------|---------|----------|
| Web (43 routes) | 28 | 7 | 8 | 0 |
| Mobile (9 member screens‡) | 4 | 5 | 0 | 14+ vs web parity |

†MISSING = major web routes with no native mobile equivalent ( counted as one row, not per-path).  
‡Excludes `+not-found`.

**Combined member page classifications (web rows + mobile screens):** VERIFIED **32**, PARTIAL **12**, BLOCKED **8**, MISSING **0** at file level (parity gaps listed separately).

---

## Top 5 blockers (UX / routing)

1. **`ff_lifestyle` / `ff_ai` off** — 8 web routes and catalog/AI APIs hard-blocked; direct URLs redirect to `/me`.
2. **Mobile couple + companion** — tabs defer to external browser for `/couple` and `/services`; no in-app COUPLE-01..04 parity.
3. **`/me` hub clutter** — card grid duplicates shell nav; weak separation from `/home` persona dashboard.
4. **Inconsistent auth guards on web `(app)`** — e.g. `/discover`, `/likes`, `/chat` rely on client/API vs SSR redirect (guest may see shell + empty/error).
5. **Mobile nav drift** — hidden `index` + `likes` screens vs ADR-11 5-tab; no native onboarding/home/lifestyle/AI path.

---

## References

- `docs/evidence/HIDE-SANDBOX-GO-LIVE-2026-10-13.md`
- `docs/architecture/ADR-11-mobile-nav.md`
- `docs/audits/PREMIUM_AS_IS_UX_AUDIT.md` (DATING-/COUPLE- IDs)
- Tasks: **DM-109**, **EXT-085** (audit evidence only; no product code changed)
