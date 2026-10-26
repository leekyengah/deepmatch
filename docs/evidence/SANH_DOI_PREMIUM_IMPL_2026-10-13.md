# Sánh đôi Premium — implementation note (2026-10-13)

## Reference
- `docs/design/references/sanh-doi-v1.png` (+ Love Map / Payment PNGs)
- Manifest: `docs/design/references/SANH_DOI_MANIFEST.md`
- Master tab38 statuses updated (SD-REF complete; core UI in progress; share/QA/gate still open)

## Shipped in code
- `/couple` premium empty onboarding + hero + overview grid (latest / upcoming / map / wishlist)
- Inner nav: Tổng quan · Kỷ niệm · Bản đồ · Kế hoạch · Hai đứa + CTA Thêm kỷ niệm
- Hai đứa: space title / started_on / motto (no invented 365 days)
- Kế hoạch: wishlist cards + propose couple date API
- Migration `20261013100000_couple_premium_meta.sql` (pairs meta + `couple_dates`)
- Checkout client: desktop 2-col + 6-step sandbox screens
- Places map: floating featured card + detail CTAs (public vs private copy)

## Still open vs mockup
- Real cover photo upload crop/persist (path field ready; media picker UX)
- Two-sided date confirm action
- Mapbox live provider (token blocker)
- Share export 1:1 / 4:5 / 9:16
- Visual overlay QA pack + G-SANH-DOI-PREMIUM signoff
- Apply migration on staging/prod Supabase

## Typecheck
- `apps/web` `tsc --noEmit` PASS (2026-10-13)
