# npm vulnerability triage (prod omit=dev)

Source: `docs/evidence/audit-2026-10-13/phase2/npm-audit-prod-after.json`
Generated: 2026-10-13T16:33:29.201Z

## Counts by severity

- critical: 1
- high: 23
- moderate: 11

## Disposition

- patchable_same_major: 6
- blocked_major_upgrade: 29

## Inventory

| Package | Sev | Direct | Disposition | Action | Advisory |
|---|---|---|---|---|---|
| next | critical | true | patchable_same_major | npm audit fix (non-force) for next | https://github.com/advisories/GHSA-3h52-269p-cp9r |
| @expo/cli | high | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/cli |
| @expo/code-signing-certificates | high | false | blocked_major_upgrade | BLOCKED major → expo-updates@0.11.7 | @expo/code-signing-certificates |
| @expo/metro | high | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/metro |
| @expo/metro-config | high | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/metro-config |
| @playwright/test | high | true | patchable_same_major | npm audit fix (non-force) for @playwright/test | @playwright/test |
| @react-native/community-cli-plugin | high | false | blocked_major_upgrade | BLOCKED major → react-native@0.72.17 | @react-native/community-cli-plugin |
| @react-native/metro-config | high | false | blocked_major_upgrade | BLOCKED major → react-native@0.72.17 | @react-native/metro-config |
| @react-native/virtualized-lists | high | false | blocked_major_upgrade | BLOCKED major → react-native@0.72.17 | @react-native/virtualized-lists |
| braces | high | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | https://github.com/advisories/GHSA-vfj7-8cjw-p6xm |
| expo | high | true | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | expo |
| expo-updates | high | true | blocked_major_upgrade | BLOCKED major → expo-updates@0.11.7 | expo-updates |
| metro | high | false | blocked_major_upgrade | BLOCKED major → react-native@0.72.17 | metro |
| metro-config | high | false | blocked_major_upgrade | BLOCKED major → react-native@0.72.17 | metro-config |
| metro-file-map | high | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | metro-file-map |
| metro-transform-worker | high | false | patchable_same_major | npm audit fix (non-force) for metro-transform-worker | metro-transform-worker |
| micromatch | high | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | micromatch |
| node-forge | high | false | blocked_major_upgrade | BLOCKED major → expo-updates@0.11.7 | https://github.com/advisories/GHSA-86w9-cpqp-85rv |
| playwright | high | false | patchable_same_major | npm audit fix (non-force) for playwright | https://github.com/advisories/GHSA-7mvr-c777-76hp |
| postcss | high | false | patchable_same_major | npm audit fix (non-force) for postcss | https://github.com/advisories/GHSA-qx2v-qp2m-jg93 |
| react-native | high | true | blocked_major_upgrade | BLOCKED major → react-native@0.72.17 | react-native |
| react-native-reanimated | high | true | blocked_major_upgrade | BLOCKED major → react-native-reanimated@4.2.2 | react-native-reanimated |
| react-native-worklets | high | true | blocked_major_upgrade | BLOCKED major → react-native-worklets@0.7.4 | react-native-worklets |
| sharp | high | true | blocked_major_upgrade | BLOCKED major → sharp@0.35.5 | https://github.com/advisories/GHSA-f88m-g3jw-g9cj |
| @expo/config | moderate | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/config |
| @expo/config-plugins | moderate | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/config-plugins |
| @expo/inline-modules | moderate | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/inline-modules |
| @expo/local-build-cache-provider | moderate | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | @expo/local-build-cache-provider |
| @expo/prebuild-config | moderate | false | patchable_same_major | npm audit fix (non-force) for @expo/prebuild-config | @expo/prebuild-config |
| decode-uri-component | moderate | false | blocked_major_upgrade | BLOCKED major → expo-router@58.0.18 | https://github.com/advisories/GHSA-vcc3-ghjq-m6fr |
| expo-router | moderate | true | blocked_major_upgrade | BLOCKED major → expo-router@58.0.18 | expo-router |
| expo-splash-screen | moderate | true | blocked_major_upgrade | BLOCKED major → expo-splash-screen@55.0.25 | expo-splash-screen |
| query-string | moderate | false | blocked_major_upgrade | BLOCKED major → expo-router@58.0.18 | query-string |
| uuid | moderate | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | https://github.com/advisories/GHSA-w5hq-g745-h8pq |
| xcode | moderate | false | blocked_major_upgrade | BLOCKED major → expo@44.0.6 | xcode |
