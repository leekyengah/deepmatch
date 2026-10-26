# HOME INFORMATION ARCHITECTURE

## Web public (guest)

1. Header — brand, anchors (Tìm nhau / Sánh đôi / Đồng hành / AI / Lifestyle / An toàn), FAQ, Login, Signup
2. Hero — headline + two CTAs → `/signup`
3. Three pillars — independent entry paths
4. How it works — 4 steps
5. AI showcase — no diagnosis / no compatibility %
6. Sánh đôi preview — marketing illustration only
7. Lifestyle teasers — DEMO label
8. Privacy & safety — no internal moderation recipes
9. FAQ teaser → `/faq`
10. Final CTA + legal footer

## Authenticated routing (`resolveHomeState`)

| State | Condition | Redirect |
|---|---|---|
| suspended | `profiles.suspended` | `/me/account` |
| couple | active `pairs` | `/couple` |
| matched | `mutual_matches` row | `/chat` |
| onboarding | missing display_name/birth_date | `/onboarding` |
| dating | otherwise | `/discover` |

API allowlist: `GET /api/v1/me/home-state` → `{ state, redirectTo, hasMutualMatch, coupleActive }` only.

## Deep links

- Couple invite fallback: `/couple/invite` (auth required)
- Lifestyle cart: `/lifestyle/cart` (sandbox)
- No fake app-store badges until URLs verified (EXT-050)
