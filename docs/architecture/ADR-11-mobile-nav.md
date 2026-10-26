# ADR-11 — Mobile bottom navigation (5 tabs)

Status: Accepted 2026-10-12 (Founder choice B1)

## Decision

Canonical mobile tabs:

1. **Khám phá** → `/discover`
2. **Sánh đôi** → `/couple` (memories / map hub)
3. **Đồng hành** → `/services` (companion / lifestyle entry)
4. **Tin nhắn** → `/chat`
5. **Cá nhân** → `/me`

Reference contact sheets that used 4-item nav or “Kỷ niệm” wording are visual only; product label remains **Sánh đôi**.

## Consequences

- Deep links preserved.
- Likes remains reachable from Discover / Me, not a bottom tab.
- Home persona (`/home`) remains web primary; mobile opens on Discover.
