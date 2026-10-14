# Mobile V2.0 Implementation Plan

## Principles

1. Reuse Web APIs + `@deepmatch/shared` / i18n / design-tokens.  
2. No fake buttons in production paths; BLOCKED features show honest empty/error.  
3. Approved brand tokens > mockup hex deltas.  
4. Gates G0–G8 tracked; no PASS_PARTIAL → PASS inflation.  
5. Admin actions always backend-authorized.

## Waves

| Wave | Scope | Exit |
|---|---|---|
| W0 | Phase 0 docs + mockup register | G0 |
| W1 | Design system + UI kit + dark mode tokens | G1 |
| W2 | Nav remodel + M01–M05 functional | Partial G2 |
| W3 | M06–M12 native modules | G2 |
| W4 | Admin A01–A08 + RBAC gate | G3 |
| W5 | Parity tests, security, sandbox payment/media | G4–G5 |
| W6 | Device / store | G6–G7 (may stay BLOCKED) |

## File layout (target)

```
apps/mobile/
  app/(auth)/welcome.tsx, forgot-password.tsx
  app/(tabs)/index.tsx          # Home hub M01 landing post-auth
  app/onboarding/goals.tsx      # M02
  app/profile/[id].tsx          # M04
  app/places/index.tsx          # M07
  app/lifestyle/index.tsx       # M08
  app/services/index.tsx        # M09
  app/premium/index.tsx         # M10
  app/notifications.tsx         # M12
  app/(admin)/_layout.tsx + screens A01–A08
  components/premium/*          # reusable kit
```

## Risk order

Maps keys · LIVE PSP · Store signing · Push credentials · Admin support API gap

## Wave status (2026-10-14)

| Wave | Status |
|---|---|
| W0–W4 | Code landed (Member + Admin shells, nav, tokens) |
| W5 | typecheck + i18n PASS; device/E2E NOT RUN → PARTIAL_TESTED |
| W6 | BLOCKED (Maps / LIVE / Store / physical QA) |

Release: **NO-GO** — see `MOBILE_FINAL_EXECUTION_REPORT.md`.
