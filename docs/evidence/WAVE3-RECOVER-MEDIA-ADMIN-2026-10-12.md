# Evidence — Wave 3: recover / media / admin / map (2026-10-12)

## Shipped

| Area | Detail |
|---|---|
| Password recover | `/forgot-password`, `/auth/callback`, `/auth/reset` |
| Avatar upload | `AvatarUpload` on `/me/edit` via upload-intents + signed URL |
| Chat images | ChatShell “Ảnh” → media intent → `messages.media_id` + signed view |
| Mapbox canvas | `CoupleMapCanvas` when `NEXT_PUBLIC_MAPBOX_TOKEN` + pin lat/lng |
| Admin safety | Live reports queue + triage/resolve |
| Admin moderation | Recent `media_objects` list + open report count |
| RLS | `20261012120000_reports_staff_rls.sql` (staff select/update reports + media) |

## Verify

| Check | Result |
|---|---|
| `npm run typecheck -w @deepmatch/web` | PASS |
| `npm run typecheck -w @deepmatch/admin` | PASS |
| `npm run test:e2e` (7) | PASS |
| Vercel web prod | READY → https://datingvn.com (`dpl_9vuwvVqAjfzK6bbKVeQFnph5vLLX`) |
| Admin Vercel | chưa link local — deploy riêng khi cần |

## Ops notes

1. Supabase Auth → Redirect URLs phải gồm `{APP_URL}/auth/callback`  
2. Mapbox: set `NEXT_PUBLIC_MAPBOX_TOKEN` trên Vercel (repo root project)  
3. Deploy: `npx vercel deploy --prod --yes` **from repo root only**
