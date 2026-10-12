# Analytics event taxonomy (EXT-036 / EXT-063)

Privacy-first. **Never** send chat text, journals, emails, phone, precise GPS, or AI prompts.

## Consent

- Public marketing funnel: anonymous, no account id.
- Authenticated product events: only after `consent_events` key `analytics_product` granted (default off until UX opt-in).

## Allowlisted events

| Event | Surface | Properties (allowlist) |
|---|---|---|
| `home_view` | `/` guest | `locale`, `path` |
| `cta_click` | marketing | `cta_id` ∈ {signup,login,discover,couple,lifestyle} |
| `signup_start` | `/signup` | `locale` |
| `login_ok` | auth | none |
| `home_state_view` | `/home` | `state` ∈ onboarding/dating/matched/couple |
| `ai_hub_open` | `/ai` | none |
| `ai_assist_request` | AI | `task` only |
| `lifestyle_browse` | catalog | `category` |
| `cart_checkout_demo` | cart | `line_count` |
| `couple_invite_create` | couple | `channel` ∈ {code,email} |

## Forbidden

- Message bodies, pin notes, DeepMind answers, payment PAN, admin queues, feature-flag internals, docs paths.

## Transport

Staging: `POST /api/v1/analytics/events` → append-only table or no-op sink when `ANALYTICS_SINK=off` (default).
No third-party pixel with PII query params.
