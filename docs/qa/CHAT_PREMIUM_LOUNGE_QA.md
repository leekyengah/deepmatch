# CHAT PREMIUM LOUNGE — QA Matrix

| Case | Status |
|---|---|
| Mutual match can open chat | PASS (existing ACL) |
| Non-mutual denied | PASS (existing ACL) |
| Block either way denies | PASS (existing) |
| Realtime INSERT dedupe | PASS (code) |
| Media signed upload no client secrets | PASS (code) |
| Offline banner | PASS (code) |
| AI tips require consent; insert≠send | PASS (code) |
| Voice/video disabled | PASS (intentional) |
| E2E two accounts | NOT_TESTED |
| Visual mockup screenshots | NOT_TESTED |
| tsc | PENDING |

**Outstanding:** reply/reaction/edit/unsend, delivery ticks, server-side pin/archive, WebRTC, mobile native redesign.
