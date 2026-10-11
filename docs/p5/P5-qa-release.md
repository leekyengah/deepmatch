# P5 — QA & Release (DM-048–053, 089, 090, 058)

## Unit evidence (local)

Run: `npm run test -w @deepmatch/shared`  
Covers: age eligibility, ranking exclusions, mutual≠pair, chat ACL (QA05/QA06/QA11 logic).

## Gates

| Gate | Status |
|---|---|
| G0 | Package ready — Founder countersign pending |
| G1–G4 | Pending staging integration |
| G5 closed beta | Pending |
| G6 public | **NO-GO until Founder + Safety** |

## Production

Cursor **will not** deploy production. DM-058 requires explicit Founder GO.

## Restore / kill switch

- Flags table + env overrides documented
- Backup/restore rehearsal requires Ops credentials (B5)
