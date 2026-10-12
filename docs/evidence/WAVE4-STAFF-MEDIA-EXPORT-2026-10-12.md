# Evidence — Wave 4: chat media + staff ops + export (2026-10-12)

## Shipped

| Area | Detail |
|---|---|
| Chat media | Image + video (mp4/webm ≤50MB) attach + render |
| Couple export | `GET /api/v1/couples/{id}/export` JSON (pins only) |
| Staff suspend | RPC `staff_set_user_suspended` + Safety UI button |
| Staff assign | RPC `staff_assign_booking` + Admin Services queue |
| RLS | `20261012130000_staff_ops_rls` + `20261012131000_staff_suspend_assign` |

## Verify

| Check | Result |
|---|---|
| typecheck web/admin | PASS |
| migration list 12131000 | local=remote |
| E2E (7) | PASS |
| Web deploy | READY → datingvn.com |
| Admin deploy | READY → https://deepmatch-admin.vercel.app (`dpl_8VKFo6CxDu3ojcW3Wwr1yL6eadAx`) |

## Ops

- Mapbox / Sentry: chưa có token — Founder set trên Vercel khi sẵn sàng
- Admin deploy from **repo root**: swap `vercel.admin.json` → `vercel.json` (or keep `vercel.web.json` / `vercel.admin.json`)
- `.vercelignore` no longer excludes `apps/admin`
