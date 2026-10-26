# DeepMatch — API Contracts v1

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Owner | Backend |
| Updated | 2026-10-11 |
| OpenAPI | `openapi/openapi.v1.yaml` |
| Legacy markdown | `docs/p1/DM-020-api-contracts.md` |

## Versioning

- Canonical public BFF: **`/api/v1/*`**
- Legacy aliases: `/api/*` (same handlers during transition)
- Errors use unified envelope (see below)

## Implemented routes (as-is → v1)

| Method | Legacy | v1 | Status |
|---|---|---|---|
| GET | `/api/health` | `/api/v1/health` | live |
| POST | `/api/matching/rank` | `/api/v1/matching/rank` | live |
| POST | `/api/likes` | `/api/v1/likes` | live |
| GET/POST | `/api/messages` | `/api/v1/messages` | live |
| POST | `/api/chat/access` | `/api/v1/chat/access` | live |
| POST | `/api/pairs/invites` | `/api/v1/couple-invitations` | live (alias) |
| POST | `/api/pairs/accept` | `/api/v1/couple-invitations/accept` | live (alias) |

## Target catalog (Master §V)

| Domain | Method | Path | Status |
|---|---|---|---|
| Profile | GET/PATCH | `/api/v1/me/profile` | live |
| Consent | POST | `/api/v1/me/consents` | PARTIAL (DB only) |
| Discovery | GET | `/api/v1/discovery/candidates` | live |
| Matches | GET | `/api/v1/matches` | live |
| Couples | GET | `/api/v1/couples/{id}` | MISSING |
| Couples | POST | `/api/v1/couples/{id}/disconnect` | live |
| Map | GET/POST/DELETE | `/api/v1/couples/{id}/pins` | live |
| Journals | GET/POST | `/api/v1/couples/{id}/journals` | live |
| Media | POST | `/api/v1/media/upload-intents` | live (bucket `media` private) |
| Blocks | GET/POST | `/api/v1/blocks` | live |
| Consent | GET/POST | `/api/v1/me/consents` | live |
| Services | GET | `/api/v1/services/offerings` | live |
| Services | GET/POST | `/api/v1/services/bookings` | live |
| Reports | POST | `/api/v1/reports` | live |
| Payments | POST | `/api/v1/payments/webhooks/{provider}` | MISSING |

## Error envelope

```json
{
  "error": {
    "code": "RESOURCE_NOT_ACCESSIBLE",
    "message": "Không thể truy cập tài nguyên.",
    "request_id": "<uuid>"
  }
}
```

HTTP: 400/422 invalid, 401 unauthenticated, 403 forbidden, 404 hide existence, 409 conflict, 429 rate, 500/503 system.

## Like success shape (target)

Align Master sample: `like_id`, `result` (`LIKED`|`MUTUAL_MATCH`), `match_id`, `conversation_id`, `meta.request_id`. Current response uses `{ ok, mutual, matchId, createsPairSpace }` — migrate under v1.
