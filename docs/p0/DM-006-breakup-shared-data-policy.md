# DM-006 — Breakup & Shared Data Policy (Draft for Privacy/Product)

**Status:** In review — **ADR-03 Blocking until Founder/Privacy countersign**  
**Dependency:** DM-005

## Principles

1. Pair space is a tenant boundary; new pair never inherits old pair data.
2. Either partner may initiate unpair.
3. Private notes remain owned by author; sharing is explicit and revocable.
4. Shared pins/media are co-contributed; post-unpair rules below.

## Proposed lifecycle (needs Founder signoff)

| Asset | During pair | On unpair | After unpair window (N=30 days proposed) |
|---|---|---|---|
| Private notes | Author only (+explicit share) | Author retains; shares revoked | Author export/delete |
| Shared pins metadata | Both | Both may export copy | Original pair archive frozen; not visible in new pair |
| Shared media | Both via signed URLs | Export window for both | Access revoked; storage GC per retention |
| Chat (pre-pair) | Mutual match thread | Unaffected by unpair of different pair | Separate retention ADR-06 |
| Advisor case notes | Scoped | Closed; no transfer | Retention per legal |

## Unpair rules

- Immediate: revoke live access to pair resources for both in app UI.
- Export: self-service package of own + previously shared-with-me content.
- Re-pair same two people: **new** pair id; optional re-invite only; no silent restore.

## Consent journal

Every grant/revoke logged with version, timestamp, actor.

## Acceptance

- [x] Draft policy text
- [ ] Product + Privacy approval (G0)
- [ ] Legal market review (DM-007)

**Proposed status:** In review (Blocking ADR-03)
