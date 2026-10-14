# Hide DEMO sandbox — product surfaces (2026-10-13)

## Decision
Hide Lifestyle catalog / AI commerce sandbox UI. Do **not** fake LIVE partners or real checkout (EXT-040 still BLOCKED).

## Flags (staging DB)
| Flag | Enabled |
|------|---------|
| ff_lifestyle | false |
| ff_ai | false |
| ff_matching | true |
| ff_discovery | true |
| ff_chat | true |
| ff_concierge | true |

## Code / copy
- Removed Lifestyle from primary nav; home tiles already flag-gated; couple commerce bridge gated; services DEMO badge removed; DeepSafe lifestyle catalog CTA removed; mobile companion uses product copy.
- Scrubbed DEMO/sandbox from open-surface i18n (+ commerce/ai/errors/admin bundle strings).
- ACL scan now fails on visible `DEMO` / `sandbox`.

## Deploy
- Commit: `3b7a500` — `fix(product): hide DEMO sandbox surfaces and scrub open-surface copy`
- Production: `dpl_ALrb48DQ31xxjkZFpSKb23WPfZ9j` → https://datingvn.com

## Security gates
- `npm run test:no-leak -- https://datingvn.com` → **PASSED**
- `node scripts/_acl-content-scan.mjs` → **0 findings**
  - `/lifestyle` → `/me`
  - `/ai` → `/me`
- Evidence JSON: `docs/evidence/ACL-CONTENT-SCAN-2026-10-13.json`

## Still blocked
- EXT-040 LIVE providers / real PSP charge / G-PREMIUM-LIVE
