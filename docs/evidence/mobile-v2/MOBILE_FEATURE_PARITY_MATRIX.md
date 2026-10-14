# Mobile Feature Parity Matrix (Web ↔ Mobile ↔ Mockup)

Status: `EXISTS` | `PARTIAL` | `MISSING` | `BLOCKED`

| ID | Feature | Web | Mobile (pre-V2) | Target V2 | Notes |
|---|---|---|---|---|---|
| M01 | Auth / onboarding | EXISTS | EXISTS (welcome+forgot) | EXISTS | Device QA pending |
| M02 | Relationship goals / needs | EXISTS | EXISTS | EXISTS | C01 via needs API |
| M03 | Discovery swipe | EXISTS | EXISTS | EXISTS | Score honesty disclaimer |
| M04 | Profile detail | PARTIAL | EXISTS | EXISTS | From candidates list |
| M05 | Messaging | EXISTS | EXISTS | EXISTS | Block/report UI still PARTIAL |
| M06 | Couple Space | EXISTS | EXISTS (native) | EXISTS | Active couple API |
| M07 | DateMap / places | PARTIAL | PARTIAL (list) | PARTIAL/BLOCKED | Maps keys |
| M08 | Lifestyle | PARTIAL | PARTIAL (DEMO) | PARTIAL | DEMO labeled |
| M09 | Concierge 7 packages | PARTIAL | EXISTS (native) | EXISTS | Sandbox booking |
| M10 | Payment / subscription | PARTIAL | PARTIAL | PARTIAL | LIVE/Store blocked |
| M11 | My Account | EXISTS | EXISTS | EXISTS | Hub links + staff entry |
| M12 | Notifications | MISSING | PARTIAL | PARTIAL | Derived inbox; no push |
| A01 | Admin dashboard | EXISTS | EXISTS | EXISTS | Live counts |
| A02 | User management | EXISTS | EXISTS | EXISTS | RPC + confirm |
| A03 | Moderation | PARTIAL | EXISTS | EXISTS | Queue read |
| A04 | Concierge ops | PARTIAL | EXISTS | EXISTS | Bookings list |
| A05 | Finance | PARTIAL | EXISTS | PARTIAL | bank_hd only |
| A06 | Support tickets | MISSING | PARTIAL (reports) | PARTIAL | No tickets table |
| A07 | Analytics | PARTIAL | EXISTS | PARTIAL | Aggregates only |
| A08 | System / flags | PARTIAL | EXISTS (RO) | EXISTS | Mobile toggles restricted |

## Navigation parity

| Role | Mockup tabs | Mobile V2 tabs |
|---|---|---|
| Member | Home · Discover · Messages · Couple · Me | Home · Discover · Messages · Couple · Me |
| Admin | Dashboard · Users · Ops · Finance · System | Dashboard · Users · Ops · Finance · System |
