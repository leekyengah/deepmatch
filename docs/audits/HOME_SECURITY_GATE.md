# HOME SECURITY GATE (G-HOME-SEC / EXT-066)

Deny-by-default public content contract.

## Automated checks

```bash
# Against local or staging base URL
npm run test:no-leak -- http://127.0.0.1:3000
npx playwright test tests/e2e/no-leak-public.spec.ts
```

## Fail closed on

- Internal task/backlog IDs on public HTML
- Staging/ops footers or docs paths
- Service-role / JWT / sk_live canaries in HTML or bundles
- Served `.env` / `.git` / internal audit markdown with secrets
- Private couple/profile data on guest routes

## Manual review before production

- [ ] OG / sitemap / robots inspected
- [ ] Guest HTML grep for canaries
- [ ] No source maps publicly downloadable with app sources
- [ ] DEMO labels present on staging catalog teasers; LIVE partners absent

**Any verified severe leak ⇒ FAIL G-HOME-SEC.**
