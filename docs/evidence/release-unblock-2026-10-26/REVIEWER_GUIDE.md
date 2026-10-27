# Store / Independent Reviewer Guide — DeepMatch

**Environment:** Staging `https://datingvn.com` · `productionDeploy=false` · `LIVE_PSP=false`  
**Do not use production credentials in this pack.**

## Demo accounts (seeded staging — never commit secrets)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Reviewer A (discoverable) | `reviewer_a@deepmatch.test` | **1Password / sealed note** (from `.ai/reviewer.env.ps1` on seed host) | Email verified; mutual with B; add ≥3 photos for discover |
| Reviewer B (mutual match with A) | `reviewer_b@deepmatch.test` | same vault | Opens chat + couple surfaces |
| Disposable delete subject | `reviewer_delete@deepmatch.test` | same vault | Only account allowed for delete UAT |

Re-seed: `node --env-file=.env.local scripts/seed-reviewer-accounts.mjs`  
Password delivery: 1Password / sealed note — **not** Master Sheet, **not** git, **not** this file.

## Reviewer happy path (Web)

1. Open `/` — brand DeepMatch visible; no staging banners on public pages.  
2. `/signup` → create or use Reviewer A; complete email verify if required.  
3. `/me` profile + media upload (≥3 photos) to clear media gate.  
4. `/discover` — candidates or `MEDIA_GATE` empty reason if under-photo.  
5. Mutual like with Reviewer B → `/chat` thread.  
6. `/me/privacy` — toggle discovery; **Revoke AI consents** (expect redirect `?ai=revoked`).  
7. Concierge `/services` — browse offerings; sandbox booking only.  
8. Premium `/me/premium` — CK instructions; **do not** expect LIVE card charge.  
9. Account deletion: use **disposable** account only → `/account-deletion` confirm DELETE.

## Mobile (after internal preview build)

1. Install APK / TestFlight / internal distribution (not Expo Go for RC claims).  
2. Point to staging API (`EXPO_PUBLIC_API_URL=https://datingvn.com`).  
3. Repeat discover → match → chat → privacy revoke.  
4. Camera/photo permission prompts expected for profile media.

## Security notes for reviewers

- Public no-leak: `/privacy`, `/terms`, `/faq`, `/robots.txt` must not expose service role or private admin.  
- Guest `/chat` and `/discover` must redirect to login.  
- Do not unmatch the shared QA mutual fixture used by automated accept (use disposable pair).

## Contacts

| Function | Contact |
|----------|---------|
| Founder / release | _TBD_ |
| Staging ops | _TBD_ |
| Independent QA lead | _TBD_ |
