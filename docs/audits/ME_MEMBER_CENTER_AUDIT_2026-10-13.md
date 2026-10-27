# Audit — Personal Member Center `/me` (pre-change)

**Date:** 2026-10-13  
**Branch target:** `feat/me-member-center-redesign`  
**Task:** DEEPMATCH — REDESIGN PERSONAL MEMBER CENTER (P1)

## 1. Current surface

| Route | Purpose | Auth |
|---|---|---|
| `/me` | Hub: greeting + 4 journey cards + flat 13 settings links | Session required |
| `/me/edit` | Profile edit + avatar | Session |
| `/me/media` | Media gate (≥3 photos) | Session |
| `/me/deep` | Deep profile form | Session |
| `/me/preferences` | Matching preferences | Session |
| `/me/understand` | Needs questionnaire (100) | Session |
| `/me/understand/refresh` | Refresh flow | Session |
| `/me/journey` | Companion journey tracker | Session |
| `/me/premium` | Premium + bank transfer | Session |
| `/me/orders` | Orders + entitlements | Session |
| `/me/privacy` | Discovery / hide toggles | Session |
| `/me/account` | Account + billing prefs | Session |
| `/me/history` | Activity history | Session |
| `/safe` | Safety center (linked from hub) | Session (partial guest) |
| `/checkout/confirm` | Checkout entry from hub | Session |

## 2. Components / APIs / DB

- **Components:** `AvatarUpload`, `MediaGateClient`, `DeepProfileForm`, `BillingClient`, `BankTransferClient`
- **APIs:** `/api/v1/me/profile`, `/consents`, `/home-state`, `/delete`; checkout/orders; entitlements
- **DB:** `profiles`, `consent_events`, `admin_roles`, `pairs`, likes/matches (via `resolveHomeState`), commerce orders/entitlements
- **Flags:** lifestyle/billing via env; staff gate uses `admin_roles` + founder email allowlist

## 3. Gaps vs objective

1. Hub is a **flat list of 13 links** — no 5-group IA, no 4-layer composition.
2. Weak **Member Identity** (initial avatar only; no verification / completion ring).
3. No **Relationship Dashboard** stats (connections, dates, completion).
4. **Next actions** limited to one CTA card.
5. Staff/admin links mixed at footer only — OK but not visually separated as environments.
6. Duplicate mental models: journey appears both as card and `/me/journey`; checkout vs orders.

## 4. Constraints (non-negotiable)

- Do **not** drop tables, APIs, entitlements, payment history, or matching logic.
- Keep all leaf URLs reachable (redirect/alias if renamed).
- Preserve brand tokens (wine/ivory/champagne, display fonts).
- Separate member vs admin vs sandbox (UI labels only where needed; no fake LIVE PSP claims).

## 5. Redesign approach

- Rebuild **`/me` page only** as 4-layer Member Center.
- Keep leaf pages intact; group them under 5 management clusters.
- Add curated **presentation fixtures** for dashboard visuals (photos/stats) when live counts are empty — clearly presentation layer, APIs unchanged.
- Add redirects: `/me/profile` → `/me/edit`, `/me/settings` → `/me/account`, `/me/billing` → `/me/orders`, `/me/safety` → `/safe`.
