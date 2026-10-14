# Deep links & notifications (EXT-032)

## Web deep links (live)

| Intent | URL | Notes |
|---|---|---|
| Couple invite join | `/couple/join?code=…` | Guest → signup/login with `next` |
| Login continue | `/login?next=/path` | Sanitized relative next only |
| Persona home | `/home` | Auth required |
| AI hub | `/ai` | Flag `ff_ai` |
| Lifestyle cart | `/lifestyle/cart` | DEMO sandbox |
| Chat thread | `/chat?c={conversationId}` | Mutual only |

## App (Expo)

- Scheme: configure in `apps/mobile/app.json` (`scheme` / associated domains when Apple ready).
- Fallback: open `https://datingvn.com/...` in browser.

## Notification rules

- Opt-out: account notifications section + no lock-screen message bodies.
- Invite email: no chat content; link only.
- Never push private journal / DeepMind answers.
