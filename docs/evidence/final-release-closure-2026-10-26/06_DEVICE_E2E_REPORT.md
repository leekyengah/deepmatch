# 06 — Device E2E Report

**DEVICE_VERIFIED:** **NO**  
**Status:** `BLOCKED_EXTERNAL` (no signed binary + no device farm run this session)

## Required journeys (checklist for Independent/Device QA)

| # | Journey | Automated staging proxy | Device |
|---|---------|-------------------------|--------|
| 1 | Register + email verify | Partial (unit/middleware) | BLOCKED |
| 2 | Onboarding intents | Unit + web | BLOCKED |
| 3 | Profile media 3–10 | Accept media upload | BLOCKED |
| 4 | Discover filters | Web+mobile code | BLOCKED |
| 5 | Match / Chat | Accept chat PASS | BLOCKED |
| 6 | Unmatch / Block / Report | API/web/mobile UI | BLOCKED |
| 7 | AI consent revoke | Unit/API | BLOCKED |
| 8 | Couple map/media | Staging code | BLOCKED |
| 9 | Lifestyle DEMO honesty | Web | BLOCKED |
| 10 | Services booking sandbox | Commerce 18/18 | BLOCKED |
| 11 | Account deletion | API present | BLOCKED |
| 12 | Network / bg-fg | Not run | BLOCKED |

## Rule

Simulator/emulator alone **cannot** claim DEVICE_VERIFIED. Require: build ID, device model, OS version, screenshots/logs, tester identity.
