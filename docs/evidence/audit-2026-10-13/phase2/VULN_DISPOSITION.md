# Vulnerability disposition — Phase 2

**Baseline:** 35 packages (`npm audit --omit=dev`) — 1 critical / 23 high / 11 moderate  
**After Next.js 15.1.11 → 15.5.27:** 33 packages — **0 critical** / 21 high / 12 moderate  

| Disposition | Count | Notes |
|---|---|---|
| FIXED | 1 (next critical cluster) | Pinned `next@15.5.27` (same major 15); critical middleware bypass + RCE advisories addressed |
| MITIGATED | ~2 (playwright/postcss residual via tooling) | Dev/test surface; not runtime datingvn.com path |
| ACCEPTED / BLOCKED_MAJOR | 29 | Expo/RN/metro/sharp force-fixes would downgrade or break SDK 57 — **no `--force`** |
| OPEN residual on next | moderate | Remaining Next advisories require further 15.5.x patches or Next 16 (major) — track |

## Exploitability (prod staging)

| Area | Assessment |
|---|---|
| next (was critical) | **FIXED** in lockfile; **requires staging deploy** to protect datingvn.com |
| Expo/metro/node-forge | Build-time / mobile toolchain — LOW_IN_PROD for Vercel Node runtime |
| sharp | Image pipeline — REVIEW; major bump blocked pending regression |
| playwright | CI-only — ACCEPTED for runtime |

## Policy

- Do not `npm audit fix --force`.  
- Maps / LIVE PSP / Store remain **BLOCKED_EXTERNAL** (unrelated to npm).  
