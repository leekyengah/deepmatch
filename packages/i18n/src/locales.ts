export const LOCALES = ["vi-VN", "en-US"] as const;

export type Locale = (typeof LOCALES)[number];

/** Product default for VN-first launch; fallback for missing keys. */
export const DEFAULT_LOCALE: Locale = "vi-VN";
export const FALLBACK_LOCALE: Locale = "en-US";

export const LOCALE_COOKIE = "dm_locale";
export const LOCALE_STORAGE_KEY = "dm_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  "vi-VN": "Tiếng Việt",
  "en-US": "English",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(input?: string | null): Locale {
  if (!input) return DEFAULT_LOCALE;
  const normalized = input.trim();
  if (isLocale(normalized)) return normalized;
  const lower = normalized.toLowerCase();
  if (lower.startsWith("vi")) return "vi-VN";
  if (lower.startsWith("en")) return "en-US";
  return DEFAULT_LOCALE;
}

export function htmlLang(locale: Locale): string {
  return locale === "vi-VN" ? "vi" : "en";
}

/** Process-local active locale for non-React call sites (auth helpers, etc.). */
let activeLocale: Locale = DEFAULT_LOCALE;

export function setActiveLocale(locale: Locale) {
  activeLocale = locale;
}

export function getActiveLocale(): Locale {
  return activeLocale;
}
