# FIX26-011 — pin_id migration unlock (2026-10-26)

**Status:** DONE_PENDING_QA (not DONE_VERIFIED)  
**Safety:** Chat-provided DB password **rejected** (28P01). Staging+prod DB passwords were **rotated via Supabase Management API** using authenticated CLI token. New passwords stored only in gitignored `.ai/prod-db-password*.txt` — **not** written to Sheet/git/evidence body.

## Staging (`zzqpvjdyvjarpphqhaze` / datingvn.com)
| Check | Result |
|-------|--------|
| `supabase db push --linked` | Remote already up to date |
| `schema_migrations` `20261014120000` pin_media | present |
| `information_schema` `media_objects.pin_id` | **uuid** |
| REST `GET /rest/v1/media_objects?select=id,pin_id&limit=1` | **HTTP 200** |

## Production (`iofrimcbvqrhefqkkyrx` / deepmatch-prod)
| Check | Result |
|-------|--------|
| Before | `pin_id` **missing**; migration history lagged (~18 pending) |
| `supabase db push --db-url` (pooler) | **Finished** including `20261014120000_pin_media.sql` |
| `information_schema` `media_objects.pin_id` | **uuid** confirmed |
| REST probe | one timeout (network); SQL confirmation is authoritative |

## Critical advisory (do not auto-fix)
Supabase advisor on **prod**: RLS disabled on `public.matching_rule_versions` (anon/authenticated fully exposed).  
Suggested (owner decide + add policies first):  
`ALTER TABLE public.matching_rule_versions ENABLE ROW LEVEL SECURITY;`  
Docs: https://supabase.com/docs/guides/database/postgres/row-level-security

## Residual
- Independent QA: couple memory upload attach `pin_id` E2E on staging  
- Operator must update any local notes with **new** DB passwords (chat password invalid)  
- Prefer rotate again if password was ever pasted into chat logs
