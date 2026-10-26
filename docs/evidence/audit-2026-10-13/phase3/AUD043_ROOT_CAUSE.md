# AUD-043 — Root cause (Phase 3A)

**Date:** 2026-10-13  
**Baseline fail log:** `docs/evidence/audit-2026-10-13/phase2/vercel-deploy-web.log`

## Symptom

Vercel build of `tradingbase/deepmatch` failed with:

```
Module not found: Can't resolve '@deepmatch/shared'
Module not found: Can't resolve '@deepmatch/i18n'
```

while running:

```
> @deepmatch/web@0.1.0 build
> next build
```

Install phase: `added 4 packages, removed 957 packages` — workspace graph not linked.

## Root cause (not a tsconfig alias issue)

1. **Wrong build entry for a npm-workspaces monorepo.**  
   Dashboard/default build fell through to `npm run build` in a context that executed **only** `@deepmatch/web`'s `next build`, skipping monorepo workspace linking/`-w @deepmatch/shared` orchestration.

2. **`apps/web/vercel.json` lacked monorepo install/build.**  
   Unlike `apps/admin/vercel.json` (`cd ../.. && npm install`), web config only set `framework`/`regions`. When the Next builder ran from the web package context, `@deepmatch/*` workspace packages were not installed/linked → webpack `Module not found`.

3. **Project settings were Framework=Other** with placeholder build/output, so root `vercel.json` buildCommand was not reliably authoritative.

`transpilePackages` in `next.config.ts` was already correct; packages exist under `packages/*` and resolve locally after root `npm install`.

## Fix

- Root scripts: `vercel-build`, `vercel-build:web`, `vercel-build:admin`, `check:workspaces`
- `scripts/vercel-build-web.mjs` — assert packages present, check resolution, build shared then web
- `apps/web/vercel.json` — `cd ../.. && npm install` + `npm run vercel-build:web`
- Align root/`vercel.web.json`/`vercel.prod.json` build commands
- Vercel project update: Framework=Next.js, Build=`npm run vercel-build:web`, Install=`npm install`, Output=`apps/web/.next`, Root=`.`
- Export `./package.json` on workspace packages for tooling

## Local verification

- `npm run check:workspaces` PASS  
- `npm run typecheck` PASS  
- `npm run test:unit` + web auth tests PASS  
- `npm run i18n:parity` PASS (1823 keys)  
- `next build` via `vercel-build:web` **Compiled successfully** (BUILD_ID present); script exit 1 was post-check only (fixed)
