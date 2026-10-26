# NEXT ACTION

Sánh đôi Premium UI landed on branch (mockup-driven). Apply DB migration + ship.

## Done
- Refs in `docs/design/references/sanh-doi-v1.png`
- `/couple` hero/overview/empty + plans/dates/settings APIs
- Checkout + places map fidelity pass
- `tsc --noEmit` PASS

## Next
1. `supabase db push` (or apply `20261013100000_couple_premium_meta.sql`)
2. Commit + `vercel --prod` + EAS update
3. QA-SD visual overlay vs `sanh-doi-v1.png`
4. Cover upload media picker; two-sided date confirm

## Still NO GO
- Store / LIVE PSP / Mapbox billing keys
