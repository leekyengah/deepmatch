# Founder Visual Review Checklist — G-VISUAL-FIDELITY

**Status:** AWAITING FOUNDER — do not self-PASS  
**Staging:** https://datingvn.com  
**Commit:** `444c52f` (+ brand/flags follow-up)  
**Refs:** `docs/design/references/REF-{WEB,DATING,COUPLE}.png`

## How to review

Open each pair side-by-side. Approve layout, color (wine/ivory/champagne), type hierarchy, spacing, CTA — not pixel-perfect phone chrome.

| # | Frame | Reference | Staging evidence | Staging URL |
|---|---|---|---|---|
| 1 | WEB homepage | REF-WEB.png | WEB-01-full-1440.png / WEB-01-mobile-390.png | `/` |
| 2 | Onboarding values | REF-DATING (frame 1) | DATING-01-onboarding.png | `/onboarding` |
| 3 | Discover feed | REF-DATING (frame 2) | DATING-02-discover.png | `/discover` |
| 4 | Profile detail | REF-DATING (frame 3) | DATING-02-discover.png (detail panel) | `/discover` (inline DATING-03) |
| 5 | Chat | REF-DATING (frame 4) | DATING-04-chat.png | `/chat` |
| 6 | Couple map | REF-COUPLE (frame 1) | COUPLE-01-map.png | `/couple/map` |
| 7 | Memories | REF-COUPLE (frame 2) | COUPLE-02-memories.png | `/couple/memories` |
| 8 | Companion | REF-COUPLE (frame 3) | COUPLE-03-companion.png | `/services` |
| 9 | Privacy | REF-COUPLE (frame 4) | COUPLE-04-privacy.png | `/me/privacy` |

## Known deviations (pre-approved product rules)

1. Canonical label **Sánh đôi** (not REF “chúng mình”).
2. Bottom nav **5 tabs** (ADR-11 B1), not 4-tab contact sheet.
3. Photos: Unsplash stand-ins, not REF people crops.
4. Discover was empty while `ff_matching` env/RLS mismatch hid DB ON — fixed via service-role flag read.
5. DEMO lifestyle/companion clearly labeled sandbox.

## Sign-off

| Decision | Initials / date |
|---|---|
| G-VISUAL-FIDELITY GO | |
| G-VISUAL-FIDELITY NO-GO (list gaps) | |
