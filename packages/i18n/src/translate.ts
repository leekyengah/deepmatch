import { FALLBACK_LOCALE, type Locale } from "./locales";

export type MessageTree = { [key: string]: string | MessageTree };
export type MessagesByLocale = Record<Locale, MessageTree>;

export type TranslateVars = Record<string, string | number | boolean | null | undefined>;

function getPath(tree: MessageTree | undefined, path: string): string | undefined {
  if (!tree) return undefined;
  const parts = path.split(".");
  let cur: string | MessageTree | undefined = tree;
  for (const part of parts) {
    if (cur == null || typeof cur === "string") return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

/**
 * Lightweight ICU-style interpolator:
 * - `{name}` simple substitution
 * - `{count, plural, =0 {…} one {…} other {…}}` (English one/other; Vietnamese uses other)
 */
export function interpolate(template: string, vars: TranslateVars = {}, locale?: Locale): string {
  return template.replace(
    /\{(\w+)(?:,\s*plural\s*,\s*((?:=0\s*\{[^}]*\}\s*)?(?:one\s*\{[^}]*\}\s*)?other\s*\{[^}]*\}))\}/g,
    (full, name: string, pluralBody: string | undefined) => {
      if (!pluralBody) {
        const v = vars[name];
        return v == null ? "" : String(v);
      }
      const count = Number(vars[name] ?? 0);
      const zero = /=0\s*\{([^}]*)\}/.exec(pluralBody)?.[1];
      const one = /one\s*\{([^}]*)\}/.exec(pluralBody)?.[1];
      const other = /other\s*\{([^}]*)\}/.exec(pluralBody)?.[1] ?? "";
      let chosen = other;
      if (count === 0 && zero != null) chosen = zero;
      else if (count === 1 && one != null && locale !== "vi-VN") chosen = one;
      return chosen.replace(/#/g, String(count));
    },
  ).replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = vars[name];
    return v == null ? "" : String(v);
  });
}

export function createTranslator(messages: MessagesByLocale, locale: Locale) {
  const primary = messages[locale];
  const fallback = messages[FALLBACK_LOCALE];

  function t(key: string, vars?: TranslateVars): string {
    const raw =
      getPath(primary, key) ??
      getPath(fallback, key) ??
      (process.env.NODE_ENV === "production" ? key : `[missing: ${key}]`);
    return interpolate(raw, vars, locale);
  }

  function has(key: string): boolean {
    return getPath(primary, key) != null || getPath(fallback, key) != null;
  }

  return { t, has, locale };
}

export type Translator = ReturnType<typeof createTranslator>;
