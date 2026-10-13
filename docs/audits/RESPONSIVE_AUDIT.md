# DEEPMATCH — Full Responsive & Full Frame Audit

| Field | Value |
|---|---|
| Date | 2026-10-13 |
| Branch | `feature/responsive-full-frame` |
| Scope | `apps/web` (datingvn.com), `apps/admin`, `apps/mobile` (Expo) |
| Rule | No business logic / API / DB / payment changes in this wave |
| Status | **AUDIT COMPLETE** — implementation NOT started until Founder GO |

---

## 1. Stack inventory

| Surface | Framework | Styling | Layout shell |
|---|---|---|---|
| Web | Next.js 15 + React 19 | Tailwind 3.4 + CSS vars (`globals.css`) | `AppShell` (sidebar md+, bottom nav mobile) |
| Admin | Next.js + React | Tailwind 3.4 + CSS vars (**legacy pink**) | `AdminShell` |
| Mobile | Expo SDK 57 + Expo Router | RN StyleSheet + `constants/theme.ts` (wine OK) | Tab layout `(tabs)` |
| Shared UI (web) | — | `components/ui/*` | Button, Input, Card, Modal, Avatar, states |

**PWA:** Web can be installed as PWA only if manifest/service-worker exist; responsive rules apply to mobile web regardless.

---

## 2. Design tokens — current state

### Web (`apps/web/src/app/globals.css`) — Visual Standard v3

Wine / ivory / champagne present (`--dm-primary #6B2D3C`, canvas `#F7F3EE`, champagne `#A88A62`).

Gaps vs Full Frame brief:

| Area | Current | Gap |
|---|---|---|
| Breakpoints | Tailwind defaults only (`sm` 640 … `2xl` 1536) | No named DeepMatch breakpoints for 320–2560 matrix |
| Container | Ad-hoc `max-w-[1510|1440|1280|1200|1000|720|…]` | No single `--dm-container-*` scale |
| Spacing | Tailwind default 4px grid; many one-off `px-3.5`, `rounded-[22px]` | Incomplete token map in Tailwind `theme.extend` |
| Typography | Display / editorial / body fonts wired | No fluid type scale (`clamp`) |
| Safe area | Mobile bottom nav `h-14` fixed | No `env(safe-area-inset-*)` |
| Hex drift | `AppShell` hardcodes `#F7F3EE`, `#6B2D3C`, … | Bypasses `dm.*` tokens |

### Admin (`apps/admin/src/app/globals.css`)

Still **legacy peony pink** (`#E95383`). Out of sync with web v3 and mobile `theme.ts`.

### Mobile (`apps/mobile/constants/theme.ts`)

Color tokens aligned with web v3. `Colors.ts` still Expo template blue tint — unused by premium screens but confusing.

### Docs debt

`docs/p1/DM-017-design-tokens.md` still documents **pink** values — superseded by web `globals.css` v3; needs rewrite (this wave → `DEEPMATCH_DESIGN_TOKENS.md`).

---

## 3. Layout / Full Frame findings

| Finding | Evidence | Severity |
|---|---|---|
| AppShell content `max-w-[1510px]` for all routes (home + non-home identical) | `AppShell.tsx` L123–127 | Medium — wastes intentional hierarchy |
| Module containers nest second max-width (1440 / 1280 / 1200) | ChatLounge, DiscoverHub, ConciergeMarketplace, MemberCenter, Lifestyle | Medium — inconsistent gutters |
| No CSS `zoom` / page-level `transform: scale` for UI shrink | repo grep | **PASS** (constraint OK) |
| Mapbox/Leaflet `zoom` is map camera only | CoupleMapCanvas | N/A |
| Mobile bottom nav can collide with iOS home indicator | `fixed … h-14` without safe-area | High (mobile web) |
| Services compare table `min-w-[720px]` inside `overflow-x-auto` | ConciergeMarketplace | Low — intentional horizontal scroll |
| Hardcoded chat badge `"3"` in AppShell | L50–58 | Out of scope (logic), visual noise |
| Profile photos: Discover uses `aspect-[3/4]` + `object-cover` | DiscoverHub | Partial PASS |
| Landing hero uses `aspect-[4/5]` / `5/6` | `app/page.tsx` | Drift from 3:4 standard |
| Couple hero polaroids use fixed `h-16 w-14` | CoupleHero | Medium — not 3:4 tokenized |

---

## 4. Route / screen inventory (web)

~76 `page.tsx` routes under `apps/web/src/app`. Priority modules for viewport matrix:

| Module | Routes (sample) | Shell | Responsive risk |
|---|---|---|---|
| Home | `/home` | AppShell | Hero collage + search header |
| Discover | `/discover`, `/likes` | AppShell | Card grid 3:4 |
| Chat | `/chat` | AppShell + ChatLounge 3-col | High — desktop 3-col → mobile panes |
| Couple | `/couple`, `/couple/map`, memories, invite, … | AppShell | Map min-heights |
| Me | `/me`, privacy, premium, orders, … | AppShell | Member Center groups |
| Services | `/services`, `[slug]`, recommend, bookings | AppShell | Compare table scroll |
| Lifestyle | `/lifestyle`, category, cart, checkout | AppShell | Marketplace hero |
| AI | `/ai`, deepmind, coach | AppShell | Chat workspace min-h |
| Places / Date map | `/places/map`, `[id]`, top | AppShell | Map canvas |
| Auth / legal | `/`, login, signup, legal/* | PublicNav | Marketing hero |
| Ops (light) | `/ops/venues` | AppShell | Form density |
| Admin | separate app | AdminShell | Legacy theme + chip nav |

Mobile Expo tabs: discover, likes, chat, couple, companion, me (+ chat `[id]`). Fewer screens than web; token sync only in this wave unless GO expands.

---

## 5. Breakpoint usage (observed)

| Tailwind | px | Used for |
|---|---|---|
| (default) | <640 | stacked mobile |
| `sm` | 640 | padding / type bumps |
| `md` | 768 | **sidebar appears**; bottom nav hides |
| `lg` | 1024 | avatar label, multi-col |
| `xl` / `2xl` | 1280 / 1536 | rare |

**Missing vs brief matrix:** explicit checks at 320, 360, 375, 390, 414, 1440, 1920, 2560. No Playwright visual suite wired to those widths yet.

---

## 6. Accessibility / QA gaps (pre-implementation)

| Check | Status |
|---|---|
| Touch target ≥ 44×44 on mobile nav | **FAIL risk** — text-only tabs, `py-2` |
| Focus-visible ring | PASS (globals) |
| Reduced motion | PASS (globals) |
| Zoom 200% / font scaling | **NOT TESTED** |
| Horizontal overflow audit | **NOT TESTED** (screenshots pending) |
| WCAG 2.2 AA full pass | **NOT CLAIMED** |
| Visual regression suite | **NOT PRESENT** |

---

## 7. Dependency / constraint map

- **Do not change:** API, RLS, payments, feature flags semantics, chat ACL, booking LIVE flags.
- **Prefer change:** `globals.css`, `tailwind.config.ts`, `AppShell`, shared `ui/*`, thin wrapper `PageFrame` / `MediaFrame`.
- **Avoid:** per-page one-off max-width patches.
- **Admin:** theme sync optional P1 if Founder wants staff UI on wine (not required for datingvn.com user paths).
- **Mobile native:** token + safe-area alignment; no Expo rewrite.

---

## 8. Priority backlog (implementation proposal)

### P0 — Foundation (shared)

1. Canonical tokens: breakpoints, containers, spacing, type, media aspect, nav heights, safe-area.
2. Tailwind `theme.extend` maps those tokens.
3. `PageFrame` (full-bleed shell + readable content width) + `MediaFrame` (3:4 / video).
4. AppShell: token colors, safe-area bottom nav, content width roles (`frame-app` vs `frame-narrow`).
5. Kill nested conflicting max-widths on premium hubs (use frame props).

### P1 — Module pass

Home, Discover, Chat, Couple, Me, Services, Lifestyle, AI, Places, Checkout/settings — overflow + touch + keyboard.

### P2 — Admin theme sync + mobile Colors cleanup + Playwright viewport smoke.

### P3 — Foldables / landscape edge cases + visual regression baseline commit.

---

## 9. Honest PASS/FAIL snapshot (audit-time)

| Criterion | Result | Notes |
|---|---|---|
| No page-level CSS zoom/scale | **PASS** | — |
| Unified container scale | **FAIL** | 1510/1440/1280/1200 drift |
| Safe-area mobile nav | **FAIL** | missing insets |
| Profile 3:4 everywhere | **PARTIAL** | Discover OK; landing/couple drift |
| Tokens web↔mobile colors | **PARTIAL** | mobile theme OK; Colors.ts stale; admin pink |
| Viewport matrix evidence | **FAIL** | no screenshots yet |
| WCAG 2.2 AA | **NOT VERIFIED** | — |

---

## 10. Next gate

**Await Founder GO** to implement P0 foundation on `feature/responsive-full-frame` (docs already started). Production deploy only after gates + evidence (lint/typecheck/build + viewport probes).
