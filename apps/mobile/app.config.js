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

  const strict =
    process.env.EAS_BUILD === "true" ||
    process.env.CI === "true" ||
    process.env.DEEPMATCH_REQUIRE_MOBILE_ENV === "1";

  if (strict && missing.length) {
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
