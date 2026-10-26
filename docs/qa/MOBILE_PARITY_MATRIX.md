# Mobile Parity Checklist — DeepMatch

| Module | Web | Mobile | Status | Evidence / Notes |
|---|---|---|---|---|
| Auth login/signup | `/login` `/signup` | `(auth)/*` | PARTIAL | Same Supabase; device session via SecureStore |
| Home | `/home` | tabs index | PARTIAL | Not full HomeDashboard parity |
| Discover | `/discover` V2 | `(tabs)/discover` | PARTIAL | Uses API; UI not premium V2 |
| Likes / Matching | `/likes` | `(tabs)/likes` | PARTIAL | Basic |
| Chat | `/chat` Lounge | `(tabs)/chat` + `[id]` | PARTIAL | Realtime path via API; no 3-col lounge |
| AI Concierge | `/ai` | — | **GAP** | No dedicated Expo screen |
| Couple Space | `/couple/*` | `(tabs)/couple` | PARTIAL | Overview/pins limited |
| DateMap | `/places/map` V2 | — | **GAP** | Web-only Leaflet hub |
| Lifestyle | `/lifestyle` | — | **GAP** | |
| Services / Concierge | `/services` | `(tabs)/companion` | PARTIAL | List/booking thin |
| Subscription / Premium | `/me/premium` | LEGAL_URLS / IAP stub | PARTIAL | IAP excluded from Expo Go |
| Payment | sandbox web | — | **GAP** | No live charges; sandbox web only |
| Media upload | signed intents | `lib/media.ts` + picker | PARTIAL | Expo Go OK for images; video limits TBD |
| Notifications | bell UI | — | **GAP** | |
| Settings / Privacy | `/me/privacy` | me + legal links | PARTIAL | |
| Design tokens | web CSS vars | `@deepmatch/design-tokens` | PASS (infra) | Shared package wired |
| Expo Go Metro | n/a | `dev:mobile` | PENDING device | Server start ≠ device QA |

**Rule:** PASS only with device evidence. This matrix is living; update after each feature.
