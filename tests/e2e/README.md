# E2E (Playwright)

```bash
npm run test:e2e
# with auth journey:
npm run seed:e2e
# then load .ai/e2e.env.ps1 and:
npm run test:e2e
```

Env:

- `E2E_BASE_URL` (default `https://datingvn.com`)
- `E2E_EMAIL` / `E2E_PASSWORD` — required for `auth-chat.spec.ts`

Minimum journeys:

1. Public smoke (home, health, login/signup, chat/discover) — always
2. Login → chat shell — when creds set
3. Pair invite / report / kill-switch — TODO
