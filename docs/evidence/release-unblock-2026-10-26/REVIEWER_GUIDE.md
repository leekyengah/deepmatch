# Store / Independent Reviewer Guide — DeepMatch

**Environment:** Staging `https://datingvn.com` · `productionDeploy=false` · `LIVE_PSP=false`  
**Do not use production credentials in this pack.**

## Demo accounts (Founder fills — never commit secrets)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Reviewer A (discoverable) | _TBD by FAR-07_ | _out-of-band_ | ≥3 approved photos; email verified; 18+ |
| Reviewer B (mutual match with A) | _TBD_ | _out-of-band_ | Opens chat + couple surfaces |
| Disposable delete subject | _TBD_ | _out-of-band_ | Only account allowed for delete UAT |

Password delivery: 1Password / sealed note — **not** Master Sheet, **not** git.

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
