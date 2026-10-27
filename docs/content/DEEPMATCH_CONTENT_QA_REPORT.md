# DEEPMATCH Content QA Report

**Date:** 2026-10-12  
**Wave:** Global language & UX content standardization (foundation + priority surfaces)

## Automated checks

| Check | Command | Result |
|---|---|---|
| Catalog key parity + placeholders | `npm run i18n:parity` | PASS (576 keys × 2) |
| i18n unit tests | `npm run test -w @deepmatch/i18n` | PASS 8/8 |
| Shared AI gateway tests | `npm run test -w @deepmatch/shared` | PASS 17/17 |
| Typecheck i18n/shared/web/admin | `npm run typecheck -w …` | PASS |
| Typecheck mobile | `npm run typecheck -w @deepmatch/mobile` | FAIL pre-existing ExternalLink typing |

## Manual / product checks

| # | Check | Status |
|---|---|---|
| 1 | Missing/duplicate keys | Automated via parity script |
| 2 | Placeholder compatibility | Automated |
| 3 | Pluralization / interpolation | Unit tests + ICU-lite |
| 4 | Date/currency helpers | Unit tests (`formatCurrency`, `formatNumber`) |
| 5 | UI overflow critical screens | Partial — nav/switcher added; full visual QA pending |
| 6 | Locale switch + persistence | Implemented (cookie / SecureStore); manual smoke pending |
| 7 | API error display | Client keys ready; many routes still free-text |
| 8 | Accessibility labels | Switcher + nav aria localized |
| 9 | Commerce / legal / safety copy | HUMAN_REVIEW_REQUIRED for legal; DEMO labels retained |
| 10 | Lint / typecheck / regression | Run in evidence |

## Open risks

- Secondary screens still hardcoded → EN locale incomplete outside migrated surfaces.
- Legal pages not rewritten this wave.
- Email/push templates not wired to `notifications.*` yet.
- Visual QA for long Vietnamese strings on small breakpoints still needed.

## Definition of Done (this wave)

| Criterion | Met? |
|---|---|
| No severe language defects on migrated surfaces | Yes (code) |
| Consistent glossary on nav / discover / match / couple / AI disclaimer | Yes |
| `vi-VN` + `en-US` catalogs + runtime switch | Yes |
| Business logic unchanged | Yes (copy/i18n only) |
| Full-app zero hardcoded UI | No — tracked in audit backlog |

## Evidence paths

- `packages/i18n/`
- `docs/audits/DEEPMATCH_LANGUAGE_CONTENT_AUDIT.md`
- `docs/content/DEEPMATCH_*.md`
- `docs/evidence/LANGUAGE-I18N-2026-10-12.md`
