# HOME DATA CLASSIFICATION

## Public allowlist (guest HTML / SEO / OG)

- Brand name, marketing copy (i18n marketing.*)
- Public routes: `/`, `/faq`, `/privacy`, `/terms`, `/login`, `/signup`
- Brand SVG assets under `/brand/`
- DEMO labels as product honesty (not live inventory claims)

## Forbidden on public surfaces

- Internal task IDs (DM-/EXT-/LEAK-/HOME-*)
- Staging/ops footers, feature-flag operational notes
- Internal docs paths (`docs/ops`, `docs/evidence`, `docs/audits`)
- Service-role keys, JWT secrets, `.env*`
- Private profiles, couple journals, map pins, chat bodies
- Admin moderation workflows / reviewer names
- Raw DB rows

## Authenticated Home BFF

- `GET /api/v1/me/home-state` — enum state + redirect only
- Never embed partner PII, journals, or admin fields in homepage SSR

## Cache

- Public pages: cacheable marketing only
- Authenticated responses: no-store / vary by auth (BFF routes)
