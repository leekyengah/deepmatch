export {
  LOCALES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  LOCALE_LABELS,
  isLocale,
  resolveLocale,
  htmlLang,
  setActiveLocale,
  getActiveLocale,
  type Locale,
} from "./locales";

export {
  createTranslator,
  interpolate,
  type MessageTree,
  type MessagesByLocale,
  type TranslateVars,
  type Translator,
} from "./translate";

export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
} from "./format";

export { messages, getMessages, NAMESPACES, type Namespace } from "./messages";

import { createTranslator } from "./translate";
import { messages } from "./messages";
import type { Locale } from "./locales";
import type { TranslateVars } from "./translate";

export function t(locale: Locale, key: string, vars?: TranslateVars): string {
  return createTranslator(messages, locale).t(key, vars);
}

export function getTranslator(locale: Locale) {
  return createTranslator(messages, locale);
}
