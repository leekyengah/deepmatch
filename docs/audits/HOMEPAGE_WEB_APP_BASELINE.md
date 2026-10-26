# HOMEPAGE WEB APP BASELINE — 2026-10-12

Branch: `feat/ext-lifestyle-ai-commerce`

## Surfaces audited

| Surface | Path | Status |
|---|---|---|
| Public web home | `/` | Implemented (HOME-W01–W11 sections) |
| FAQ | `/faq` | Implemented; internal `docs/ops` path removed |
| Privacy / Terms | `/privacy`, `/terms` | Public legal pages |
| App shell home | `/me` + state redirect | Partial — `resolveHomeState` + `/api/v1/me/home-state` |
| Lifestyle hub | `/lifestyle` | Implemented (DEMO catalog) |
| AI hub | `/ai` | Implemented |
| DeepSafe | `/safe` | Implemented |

## Prior gaps (fixed this wave)

- Thin marketing stub (hero + staging footer only)
- Public footer leaked “Môi trường staging · Feature flags”
- FAQ hardcoded link to `docs/ops/DOMAIN_DATINGVN.md`

## Design tokens (present)

Peony `#E95383`, Petal `#F6C1D2`, Soft White `#FFF8FA`, Raspberry `#822D4C` in `globals.css` / Tailwind `dm.*`.

## Auth states

| State | Routing |
|---|---|
| Guest | Public `/` |
| Authenticated | Server redirect via `resolveHomeState` → onboarding / discover / chat / couple / account |
