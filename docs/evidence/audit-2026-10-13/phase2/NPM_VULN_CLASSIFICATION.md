# npm vulnerability classification (omit=dev)

Generated: 2026-10-13T16:51:27.390Z
Source: `D:\DỰ ÁN CÔNG NGHỆ\DEEPMATCH\docs\evidence\audit-2026-10-13\phase2\npm-audit-after-next.json`

## Summary

- Total packages with advisories: **33**
- Metadata vulns: {"info":0,"low":0,"moderate":12,"high":21,"critical":0,"total":33}
- By severity: {"high":21,"moderate":12}
- By disposition: {"BLOCKED_MAJOR":31,"FIXABLE_SAFE":2}

## Policy

- Do **not** `npm audit fix --force` if it downgrades Expo/RN major.
- Prefer overrides only when compatible and regression-tested.
- Maps / LIVE PSP / Store keys remain BLOCKED_EXTERNAL (unrelated).

## Table

| Package | Sev | Direct | Disposition | Exploitability | Notes |
|---|---|---|---|---|---|
| @expo/cli | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| @expo/code-signing-certificates | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo-updates@0.11.7 (major/breaking) |
| @expo/metro | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| @expo/metro-config | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| @react-native/community-cli-plugin | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native@0.72.17 (major/breaking) |
| @react-native/metro-config | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native@0.72.17 (major/breaking) |
| @react-native/virtualized-lists | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native@0.72.17 (major/breaking) |
| braces | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| expo | high | true | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| expo-updates | high | true | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo-updates@0.11.7 (major/breaking) |
| metro | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native@0.72.17 (major/breaking) |
| metro-config | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native@0.72.17 (major/breaking) |
| metro-file-map | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| metro-transform-worker | high | false | FIXABLE_SAFE | LOW_IN_PROD | npm audit fix available without force |
| micromatch | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| node-forge | high | false | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install expo@44.0.6 (major/breaking) |
| postcss | high | false | BLOCKED_MAJOR | MODERATE | Force fix would install next@16.4.0 (major/breaking) |
| react-native | high | true | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native@0.72.17 (major/breaking) |
| react-native-reanimated | high | true | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native-reanimated@4.2.2 (major/breaking) |
| react-native-worklets | high | true | BLOCKED_MAJOR | LOW_IN_PROD | Force fix would install react-native-worklets@0.7.4 (major/breaking) |
| sharp | high | true | BLOCKED_MAJOR | REVIEW | Force fix would install sharp@0.35.5 (major/breaking) |
| @expo/config | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo@44.0.6 (major/breaking) |
| @expo/config-plugins | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo@44.0.6 (major/breaking) |
| @expo/inline-modules | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo@44.0.6 (major/breaking) |
| @expo/local-build-cache-provider | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo@44.0.6 (major/breaking) |
| @expo/prebuild-config | moderate | false | FIXABLE_SAFE | LOW | npm audit fix available without force |
| decode-uri-component | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo-router@58.0.18 (major/breaking) |
| expo-router | moderate | true | BLOCKED_MAJOR | LOW | Force fix would install expo-router@58.0.18 (major/breaking) |
| expo-splash-screen | moderate | true | BLOCKED_MAJOR | LOW | Force fix would install expo-splash-screen@55.0.25 (major/breaking) |
| next | moderate | true | BLOCKED_MAJOR | LOW | Force fix would install next@16.4.0 (major/breaking) |
| query-string | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo-router@58.0.18 (major/breaking) |
| uuid | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo@44.0.6 (major/breaking) |
| xcode | moderate | false | BLOCKED_MAJOR | LOW | Force fix would install expo@44.0.6 (major/breaking) |
