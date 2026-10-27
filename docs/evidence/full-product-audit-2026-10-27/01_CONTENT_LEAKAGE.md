# Internal Content Exposure Report

**Date:** 2026-10-27 · Staging runtime + source

## Classification key

INTERNAL_ONLY · ADMIN_AUTHORIZED · CUSTOMER_VISIBLE_VALID · CUSTOMER_VISIBLE_DEFECT · SECURITY_EXPOSURE · UNVERIFIED

## High-priority findings

| ID | Surface | Class | Evidence | Disposition |
|----|---------|-------|----------|-------------|
| LEAK-01 | Web Lifestyle hero | CUSTOMER_VISIBLE_DEFECT | Runtime `datingvn.com/lifestyle`: badge **DEMO / SANDBOX** + “Thanh toán LIVE chưa bật…” | i18n fixed in repo (`commerce.demoBadge/Note`); **needs staging redeploy** |
| LEAK-02 | Web Lifestyle partners | CUSTOMER_VISIBLE_DEFECT | “DEMO An toàn Partner”, “Fictional seed — not a real business”, hints with `EXT-040` / `commerce_providers` | Hints i18n fixed; **seed/catalog names residual** |
| LEAK-03 | Mobile home/lifestyle/services/premium | CUSTOMER_VISIBLE_DEFECT | Hardcoded `DEMO`, `DEMO / sandbox`, `Sandbox · no LIVE charge`, `Sandbox checkout` | Fixed → i18n preview language in `apps/mobile` + `packages/i18n` |
| LEAK-04 | Discover detail | CUSTOMER_VISIBLE_VALID→borderline | “Độ phù hợp (thử nghiệm)” | Softened to “gợi ý” in i18n |
| LEAK-05 | Discover bios | CUSTOMER_VISIBLE_DEFECT | “Synthetic Mebertes” visible in profile detail | **Residual** — seed data / display filter needed |
| LEAK-06 | Checkout sandbox APIs | INTERNAL_ONLY / VALID | `sandbox` fields, webhook routes | Keep; not LIVE |
| LEAK-07 | service_role in client | NOT FOUND this pass | — | Continue guard in CI |
| LEAK-08 | Checkout simulate CTAs | SECURITY_EXPOSURE | Member `sandbox_succeed`/`fail` | **Removed** from `CheckoutClient` |
| LEAK-09 | Auth error reflection | SECURITY_EXPOSURE | Raw Supabase messages in query/UI | **Fixed** → generic `auth.*` keys |
| LEAK-10 | Home DEMO / Concierge BETA | CUSTOMER_VISIBLE_DEFECT | HomeDashboard | Softened labels |
| LEAK-11 | AI/Couple eng jargon | CUSTOMER_VISIBLE_DEFECT | ai.json / couple.json | Softened (RLS/R2/LIVE) |

Follow-up scan: [Customer UI leakage scan](61b83407-a618-4425-a1b3-61b10a470da1)

## Policy applied

- Did **not** remove honest “no charge” messaging.  
- Removed engineer jargon (`LIVE`, `Sandbox`, `EXT-040`, `CHECKOUT_OK`) from customer strings.  
- Did **not** fake successful LIVE payment.  
