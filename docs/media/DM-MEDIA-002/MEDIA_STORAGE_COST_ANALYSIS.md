# MEDIA_STORAGE_COST_ANALYSIS — DM-MEDIA-002

**Task:** DM-MEDIA-002  
**Date:** 2026-10-13  
**Currency:** USD (indicative; Cloudflare R2 / Worker / CDN public list pricing assumptions)  
**Status:** Planning estimate — not a billing commitment

---

## 1. Cost levers (priority order)

1. Direct-to-R2 upload (no app-server bytes)
2. Compress before durable store
3. Thumbnails + responsive sizes
4. Lazy loading
5. CDN cache for PUBLIC only
6. Limit video autoplay
7. Quotas by account tier
8. Temp upload TTL + orphan GC with reconciliation delay
9. Meter storage, Class A/B, processing CPU
10. Prefer FFmpeg Worker over paid transcode SaaS
11. Separate private vs public cost pools

---

## 2. Usage model (assumptions)

| Metric | Per active user / month | Notes |
|---|---|---|
| Profile images stored | 6 × 0.8 MB durable WebP | After resize; originals temp only |
| Profile videos | 0.3 × 8 MB (≤30s 720p) | Sparse uptake |
| Chat media | 4 × 0.5 MB | Mix image-heavy |
| Couple memories | 2 × 1.0 MB | Pair-scoped |
| Thumbnails overhead | +25% of durable bytes | 320px + display size |
| Class A (write/list) | ~25 / user / mo | intents + confirms + GC |
| Class B (read) | ~120 / user / mo | feeds, chat, couple |
| Video CPU | 0.15 min encode / user / mo | avg across all users |
| CDN egress (PUBLIC only) | 20% of reads × 0.4 MB | Private stays signed R2 |

**Active users ≈ 40% of registered** for mid/large scenarios.

Unit prices used (illustrative 2026 planning bands):

| Component | Unit price |
|---|---|
| R2 storage | $0.015 / GB-month |
| Class A | $4.50 / M |
| Class B | $0.36 / M |
| R2 egress to Internet | $0 (R2 list) — CDN egress separate |
| CDN egress | $0.04 / GB (band) |
| Worker/CPU video | $0.02 / encode-minute |
| Ops / backup / monitoring | 15% of infra subtotal |

---

## 3. Scenario A — 10,000 registered users

Active ≈ 4,000.

| Line | Calc | Monthly USD |
|---|---|---|
| Durable storage | 4k × (~6×0.8 + 0.3×8 + 4×0.5 + 2×1) × 1.25 ≈ 4k × 11.4 MB = **45.6 GB** | 45.6 × 0.015 ≈ **0.68** |
| Class A | 4k × 25 = 100k → 0.1 M × 4.50 | **0.45** |
| Class B | 4k × 120 = 480k → 0.48 M × 0.36 | **0.17** |
| Video CPU | 4k × 0.15 = 600 min × 0.02 | **12.00** |
| CDN PUBLIC | 4k × 24 reads × 0.4 MB ≈ 38.4 GB × 0.04 | **1.54** |
| Backup/ops 15% | | **~2.2** |
| **Total** | | **≈ $17 / mo** |

Rounded planning band: **$15–40 / mo** (spike if video uptake high).

---

## 4. Scenario B — 100,000 registered users

Active ≈ 40,000. Linear scale ×10 on A.

| Line | Monthly USD |
|---|---|
| Storage (~456 GB) | ~6.8 |
| Class A / B | ~6.2 |
| Video CPU | ~120 |
| CDN PUBLIC | ~15 |
| Ops/backup 15% | ~22 |
| **Total** | **≈ $170 / mo** |

Planning band: **$150–350 / mo**. Dominant cost = **video CPU**, not storage.

---

## 5. Scenario C — 1,000,000 registered users

Active ≈ 400,000. ×10 on B.

| Line | Monthly USD |
|---|---|
| Storage (~4.6 TB) | ~68 |
| Class A / B | ~62 |
| Video CPU | ~1,200 |
| CDN PUBLIC | ~154 |
| Ops/backup 15% | ~220 |
| **Total** | **≈ $1.7k / mo** |

Planning band: **$1.5k–4k / mo** unless video concurrency/quotas tighten.

---

## 6. Private vs public cost split (planning)

| Pool | Share of bytes | Share of $ |
|---|---|---|
| PRIVATE + COUPLE_PRIVATE (signed R2) | ~80% | Storage + Class B dominated; no CDN |
| PUBLIC (CDN) | ~20% | CDN egress + cache HIT savings |

---

## 7. Controls that move TCO most

1. Cap video encodes / user / day; queue concurrency.
2. Reject >30s early (no encode spend).
3. Delete temp originals after READY + retention window.
4. Prefer image WebP; avoid full-res originals long-term.
5. Keep private media off CDN.

---

## 8. Open pricing risks

- Actual Cloudflare/Worker plan discounts differ.
- Sudden viral video uptake dominates CPU.
- Supabase Storage dual-run during migration doubles storage briefly — budget a migration window.

**Release note:** Cost model is advisory; re-measure after staging metrics.
