# Journey Runtime Notes (Staging Web)

**Host:** https://datingvn.com  
**Session:** Existing matched synthetic pair (Elena Nguyen / Dương Lương) in browser profile  
**Viewports this pass:** Desktop ~1440 (automation). Mobile 360/390 **NOT_TESTED** this turn.

| Journey | Result | Notes |
|---------|--------|-------|
| Health | PASS | `/api/health` staging, productionDeploy false |
| Couple overview | PASS | Loads memories/map empty states; brand OK |
| Lifestyle | PASS load / FAIL content | Marketplace loads; DEMO/Sandbox badge + partner seed names visible (pre-redeploy) |
| Discover | PASS after ~8s | Spinner then candidates; filters present; “Thiếu dữ liệu” ubiquitous |
| Guest landing | NOT_TESTED | Session already authenticated |
| Logout/login web | NOT_TESTED this turn | |
| Chat send/receive | NOT_TESTED | Need controlled dual account |
| Checkout charge | SKIPPED | LIVE HOLD; sandbox only |

## Screenshots

Captured in Cursor browser session for `/couple`, `/lifestyle`, `/discover` (agent turn 2026-10-27). Store under browser tool artifacts; not duplicated as binaries in git.  
