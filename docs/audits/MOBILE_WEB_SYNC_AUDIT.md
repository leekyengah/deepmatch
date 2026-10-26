# MOBILE ↔ WEB AUTO SYNC — Repository Audit

| Field | Value |
|---|---|
| Date | 2026-10-13 |
| Branch | `feature/web-mobile-sync` |
| Node | ≥20 (local observed v24.18.0) |
| Package manager | npm workspaces |

## Stack

| Surface | Stack |
|---|---|
| Web | Next.js 15 · React 19.3 · Tailwind · Supabase SSR |
| Mobile | Expo SDK **57** · Expo Router · RN 0.86 · React **19.2.3** |
| Shared today | `@deepmatch/shared`, `@deepmatch/i18n`, `@deepmatch/legal-content` |
| New this wave | `@deepmatch/design-tokens` |

## React version tension (important)

Root `package.json` overrides React to **19.3.0** for web. Mobile requires **19.2.3** for Expo Go. Metro already forces a single React copy from `apps/mobile/node_modules`. Nested override added for `@deepmatch/mobile` → 19.2.3. **Do not bump Expo/RN without SDK-compatible matrix.**

## Auth / API

- Mobile: `EXPO_PUBLIC_API_URL` (default datingvn.com) + Supabase anon + Bearer session (`apps/mobile/lib/api.ts`, `lib/supabase.ts`, SecureStore).
- Web: Next BFF `/api/v1/*` + cookie session.
- Same Supabase project / RLS — single data plane.
- **Never** ship service-role or R2 secrets in the mobile bundle.

## Navigation

| Web | Mobile (Expo Router) |
|---|---|
| AppShell + routes | `(tabs)`: discover, couple, companion, chat, me |
| `/chat` | `/chat` + `/chat/[id]` |
| `/places/map` DateMap | **GAP** — no native DateMap screen |
| `/ai`, `/lifestyle`, `/services` | companion tab partial / deep-link style |

## Expo Go compatibility

| Area | Status |
|---|---|
| expo-router, secure-store, image-picker | Compatible with Expo Go |
| react-native-iap | **Excluded** via autolinking — Store IAP needs Dev Build |
| Mapbox native | Not in mobile; couple map web-only for now |
| ffmpeg / sharp | Web-only server |

## Scripts (this wave)

- `npm run dev:web`
- `npm run dev:mobile` → `expo start --go --lan`
- `npm run dev:mobile:tunnel`
- `npm run dev:all` → `scripts/dev-all.mjs` (skips Metro if :8081 busy)

## Parity summary

See `docs/qa/MOBILE_PARITY_MATRIX.md`. Full feature parity is **not** claimed; many modules remain GAP/PARTIAL.

## Production safety

- No prod DB migration in this wave.
- No kill-all-node automation.
- Expo points at datingvn.com API by default — use staging URL in `.env` for isolated QA when available.
