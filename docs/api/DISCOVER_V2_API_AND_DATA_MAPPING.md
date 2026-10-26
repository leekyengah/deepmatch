# DISCOVER V2 — API & Data Mapping

## GET `/api/v1/discovery/candidates`

Query:

| Param | Effect |
|---|---|
| `intent` | `all` \| `friendship` \| `dating` \| `marriage` — soft boost goals |
| `min_age` / `max_age` | Override prefs |
| `region` | Soft filter unless `strict=1` |
| `q` | Search name/region/interests |
| `strict=1` | Hard region + goal filters |
| `page_size` | Max 50 |

Response candidate fields: `avatarUrl`, `age`, `bio`, `jobTitle`, `goals`, `interests`, `values`, `reasons`, `score`, `compatibility`.

Empty codes: `NO_POOL` \| `ACTED_ALL` \| `FILTERS_STRICT` \| `NO_MATCH`.

## Actions

- Like/Pass → `POST /api/v1/likes` (`like` \| `pass`)
- Save → device `localStorage` key `dm_discover_saved_v1` (no DB migration)
