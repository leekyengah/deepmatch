# Product Capability Coverage Matrix (source inventory)

**Source:** [Capability inventory matrix](a222ccef-22e9-473c-a296-65b91042cb49) · 2026-10-27  
**Status legend:** IMPLEMENTED | PARTIAL | MISSING | UNKNOWN — **no runtime PASS**

| # | Module | Web | Mobile | Admin | Highest gap |
|---|--------|-----|--------|-------|-------------|
| 1 | Public/Landing | IMPLEMENTED | PARTIAL | MISSING | Mobile ≠ full landing |
| 2 | Auth | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | — |
| 3 | Onboarding | IMPLEMENTED | PARTIAL | MISSING | Mobile goals only |
| 4 | Profile | IMPLEMENTED | PARTIAL | PARTIAL | Mobile subset |
| 5 | Discover | IMPLEMENTED | IMPLEMENTED | PARTIAL | — |
| 6 | Matching/Unmatch | IMPLEMENTED | IMPLEMENTED | PARTIAL | — |
| 7 | Chat | IMPLEMENTED | IMPLEMENTED | MISSING | — |
| 8 | AI Concierge | IMPLEMENTED | **MISSING** | MISSING | No mobile AI UI |
| 9 | Lifestyle | IMPLEMENTED | PARTIAL | PARTIAL | Demo/sandbox-heavy |
| 10 | Services | IMPLEMENTED | PARTIAL | PARTIAL | — |
| 11 | Couple | IMPLEMENTED | PARTIAL | MISSING | Mobile thinner |
| 12 | Love Map | IMPLEMENTED | PARTIAL | PARTIAL | Fixture places, no `places` table |
| 13 | Media | IMPLEMENTED | PARTIAL | PARTIAL | — |
| 14 | Booking | IMPLEMENTED | PARTIAL | PARTIAL | No mobile bookings inbox |
| 15 | Checkout/Subs | IMPLEMENTED | PARTIAL | IMPLEMENTED | LIVE blocked |
| 16 | Privacy/Deletion | IMPLEMENTED | PARTIAL | PARTIAL | Mobile → web deep-link |
| 17 | Admin | PARTIAL | PARTIAL | IMPLEMENTED | Split consoles |
| 18 | CMS | MISSING | MISSING | PARTIAL stub | No CMS API/tables |
| 19 | Reports/Mod | PARTIAL | PARTIAL | IMPLEMENTED | Scattered report UI |
| 20 | Notif/Settings | PARTIAL | PARTIAL | PARTIAL | No push prefs API |

**Highest-impact gaps:** CMS · Love Map fixtures · Mobile AI · Notifications/push · Native account deletion.  
