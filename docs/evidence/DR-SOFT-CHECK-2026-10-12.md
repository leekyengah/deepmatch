# DR Soft-Check — 2026-10-12

| Check | OK | ms | Detail |
|---|---|---|---|
| health_v1 | PASS | 3816 | `{"productionDeploy":false,"flags":{"ff_matching":true,"ff_chat":true,"ff_media_upload":true,"ff_concierge":true,"ff_disc` |
| chat_page | PASS | 1184 | `{"bytes":14980}` |
| forgot_password_page | PASS | 627 | `{"bytes":10549}` |
| admin_health_reachable | FAIL | 14 | `"fetch failed"` |
| supabase_rest | PASS | 869 | `{"status":200}` |

Summary: 4/5 PASS, 1 FAIL

Note: soft-check only (no PITR restore). Full drill still required for G5.
