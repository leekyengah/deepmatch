# Expo / React Native dependency migration plan (no blind major bumps)

**Context:** `npm audit --omit=dev` reports **33** advisories (0 critical / 21 high / 12 moderate) after Next 15.5.27. Remaining HIGH packages are almost entirely Expo SDK 57 / Metro / RN toolchain (`braces`/`micromatch` → metro → expo). `npm audit fix --force` would install **expo@44** / **react-native@0.72** — rejected.

## Policy

- Do **not** `npm audit fix --force`.
- Keep Expo SDK **~57** / RN **0.86** until a coordinated SDK upgrade.
- Prefer upstream patched releases inside the current SDK line.

## Wave plan

| Wave | Goal | Trigger | Validation |
|---|---|---|---|
| W0 (now) | Accept Expo/Metro transitive HIGH as LOW_IN_PROD exploitability; document | Phase 3 | Audit disposition table |
| W1 | Track Expo SDK 58+ changelog for braces/micromatch/node-forge remediation | Upstream release notes | `npx expo-doctor`, Expo Go smoke |
| W2 | Upgrade Expo SDK + RN together via `npx expo install --fix` | SDK 58+ stable | typecheck, Expo Go, EAS preview |
| W3 | Re-run `npm audit --omit=dev`; remove ACCEPTED items only with evidence | After W2 | CI + device matrix |

## Out of scope for W0

- Store submission, push notification certs, IAP sandbox (remain BLOCKED_EXTERNAL / NOT_TESTED)

## sharp (web)

- Direct HIGH; force → sharp@0.35.x major.  
- Mitigation: keep 0.33.x; revisit after Next/image pipeline regression tests on preview.
