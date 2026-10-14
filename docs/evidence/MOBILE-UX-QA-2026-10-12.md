# Mobile UX design QA — EXT-035 (2026-10-12)

App: `apps/mobile` (Expo Router). Tokens: Peony `#E95383`, Petal `#F6C1D2`, Soft White `#FFF8FA`, Raspberry `#822D4C` (`constants/theme.ts`).

## Screens covered

| Screen | Route | Notes |
|---|---|---|
| Persona Home | `(tabs)/index` | State from `/api/v1/me/home-state` |
| Discover | `(tabs)/discover` | Like/pass |
| Likes | `(tabs)/likes` | Mutual list |
| Chat | `(tabs)/chat` | Mutual-gated |
| Me | `(tabs)/me` | Account hub |
| Auth | `(auth)/login`, `signup` | Supabase |

## QA checklist (staging API)

- [x] Touch targets via shared `Button` (≥ ~44pt padding)
- [x] Empty / loading / error via `Empty`, `Loading`, Alert
- [x] No LIVE partner claims in mobile copy paths used
- [ ] Visual regression 320–430 px (manual on device / Expo Go)
- [ ] Dark mode — optional, not required for MVP
- [ ] WCAG contrast spot-check on device — pending founder device pass

## Blockers

- TestFlight / App Store: Apple Developer (BLOCKED_FOUNDER)
- Expo Go may miss native modules after new native deps — prefer dev build
