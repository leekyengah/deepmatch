/**
 * Dynamic Expo config. `config` already merges static app.json.
 * Validates public env on EAS/CI. Never embeds service-role secrets.
 */
const REQUIRED_PUBLIC = [
  "EXPO_PUBLIC_API_URL",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
];

module.exports = ({ config }) => {
  const missing = REQUIRED_PUBLIC.filter((k) => {
    const v = process.env[k];
    return !v || !String(v).trim();
  });

  // Fail-fast only on explicit local gate. EAS early phases (e.g. Calculate
  // expo-updates runtime version) may evaluate this file before Dashboard
  // Sensitive EXPO_PUBLIC_* are injected; throwing there aborts the build.
  // Metro still inlines EAS-injected EXPO_PUBLIC_* during the JS bundle step.
  if (process.env.DEEPMATCH_REQUIRE_MOBILE_ENV === "1" && missing.length) {
    throw new Error(
      `Missing mobile public env: ${missing.join(", ")}. ` +
        `Configure EAS project env/secrets (anon + URL only).`,
    );
  }

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      appEnv: process.env.EXPO_PUBLIC_APP_ENV || "staging",
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://datingvn.com",
    },
  };
};
