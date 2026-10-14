# Legal / privacy — HUMAN_REVIEW pack

**Status:** HUMAN_REVIEW_REQUIRED — not legal advice; counsel / founder sign-off required before treating copy as production-final.  
**Date:** 2026-10-12  
**i18n keys:** `legal.*` (+ FAQ commercial claims in `faq.a5` / `faq.a6`)

## Surfaces to review

| Surface | Route | Keys |
|---|---|---|
| Terms of use | `/terms` | `legal.termsTitle`, `legal.termsP1`–`P3`, `legal.contact`, `legal.updated` |
| Privacy policy | `/privacy` | `legal.privacyTitle`, `legal.privacyP1`–`P3`, `legal.contact` |
| Account deletion | `/account-deletion` + `POST /api/v1/me/delete` | `legal.delete*` + anonymized `auth.deletedDisplayName` |
| FAQ commercial / domain claims | `/faq` | `faq.a5` (price + bank details), `faq.a6` (DNS/domain) |
| Safety disclaimers (API + UI) | DeepSafe / check-in | `errors.safetyDisclaimer`, `errors.safetyCheckinNote`, `safety.*` |
| AI mental-health adjacent | AI hub / DeepMind | `ai.disclaimer`, `ai.notClinical`, `ai.deepmindIntro` |
| Billing / refund disclosures | Premium / bank transfer | `commerce.bank*`, `commerce.refundPolicy`, `commerce.billingStripeHint` |

## Catalog files

- `packages/i18n/locales/vi-VN/legal.json`
- `packages/i18n/locales/en-US/legal.json`
- Related: `faq.json`, `commerce.json`, `ai.json`, `safety.json`, `errors.json` (safety/demo banners)

## Review checklist

- [ ] Age gate (18+) language matches counsel guidance  
- [ ] Data retention / deletion wording matches actual Supabase flows  
- [ ] Bank transfer / Premium pricing and STK details are accurate  
- [ ] “Not emergency service” DeepSafe wording approved  
- [ ] AI “not clinical diagnosis” / no mind-reading claims approved  
- [ ] EN-US translations reviewed (not machine-only)  
- [ ] Remove or keep `legal.humanReview` badge after sign-off  

## Staging note

UI may show `legal.humanReview` until this pack is cleared. Do not treat staging copy as counsel-approved.
