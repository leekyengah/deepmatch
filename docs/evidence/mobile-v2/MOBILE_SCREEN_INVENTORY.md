# Mobile Screen Inventory (post V2 wave)

| ID | Name | Route | Role | UI | Functional | Test | Blockers |
|---|---|---|---|---|---|---|---|
| M01 | Auth & Onboarding | `/(auth)/welcome` | Guest | DONE | Auth real | PARTIAL | Device QA |
| M02 | Relationship Goals | `/onboarding/goals` | Member | DONE | needs API | PARTIAL | — |
| M03 | Discovery | `/(tabs)/discover` | Member | DONE | likes API | PARTIAL | — |
| M04 | Profile Detail | `/profile/[id]` | Member | DONE | likes API | PARTIAL | Rich media depth |
| M05 | Messaging | `/(tabs)/chat` | Member | DONE | chat API | PARTIAL | — |
| M06 | Couple Space | `/(tabs)/couple` | Member | DONE | couples API | PARTIAL | — |
| M07 | DateMap | `/places` | Member | LIST | places API | PARTIAL | Maps keys |
| M08 | Lifestyle | `/lifestyle` | Member | DONE | DEMO | PARTIAL | Catalog depth |
| M09 | Concierge | `/services` | Member | DONE | sandbox book | PARTIAL | — |
| M10 | Payment | `/premium` | Member | DONE | sandbox/IAP stub | PARTIAL | LIVE/Store |
| M11 | My Account | `/(tabs)/me` | Member | DONE | media/legal | PARTIAL | — |
| M12 | Notifications | `/notifications` | Member | DONE | derived inbox | PARTIAL | Push |
| A01 | Dashboard | `/(admin)` | Staff | DONE | live counts | PARTIAL | Staff E2E |
| A02 | Users | `/(admin)/users` | Staff | DONE | RPC suspend | PARTIAL | Staff E2E |
| A03 | Moderation | `/(admin)/moderation` | Staff | DONE | media/reports | PARTIAL | Approve actions |
| A04 | Concierge Ops | `/(admin)/concierge` | Staff | DONE | bookings | PARTIAL | Assign on Web |
| A05 | Finance | `/(admin)/finance` | Staff | DONE | payments | PARTIAL | LIVE PSP |
| A06 | Support | `/(admin)/support` | Staff | DONE | reports | PARTIAL | No tickets table |
| A07 | Analytics | `/(admin)/analytics` | Staff | DONE | aggregates | PARTIAL | — |
| A08 | System | `/(admin)/system` | Staff | DONE | flags RO | PARTIAL | Toggle on Web |

## Navigation

- Member tabs: Home · Discover · Messages · Couple · Me  
- Admin tabs: Dashboard · Users · Ops · Finance · System (+ hidden subroutes)
