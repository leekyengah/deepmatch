# ACL + content hygiene — 2026-10-13

## Accounts

- Created: `e2e_c039@deepmatch.test` (`.ai/e2e.env.ps1`)
- Exercised: `qa_couple_a@deepmatch.test` (+ renamed display names Lan Anh / Minh Khoa / …)

## Fixes shipped (`7735224` + `7ccd448`)

- Removed **Staging** badge from AppShell
- Replaced user-facing `ff_*` / kill switch / staging / docs/ops / Stripe keys / SANDBOX_ONLY / founder wording
- Softened DEMO/sandbox microcopy (still clearly DEMO, no ops jargon)
- Hardened `scripts/no-leak-public.mjs` (visible HTML surface)

## Verification on https://datingvn.com

| Check | Result |
|---|---|
| `npm run test:no-leak` | PASS |
| Guest + auth route copy scan (`scripts/_acl-content-scan.mjs`) | **0 findings** |
| `/api/v1/discovery/candidates` as session user | 200 |

Raw JSON: `ACL-CONTENT-SCAN-2026-10-13.json`
