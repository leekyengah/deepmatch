import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  createTranslator,
  htmlLang,
  messages,
  resolveLocale,
  type Locale,
  type Translator,
} from "@deepmatch/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (fromCookie) return resolveLocale(fromCookie);
  const accept = (await headers()).get("accept-language");
  if (accept) {
    const first = accept.split(",")[0]?.trim();
    return resolveLocale(first);
  }
  return DEFAULT_LOCALE;
}

export async function getServerTranslator(): Promise<Translator> {
  const locale = await getRequestLocale();
  return createTranslator(messages, locale);
}

export async function getHtmlLang(): Promise<string> {
  return htmlLang(await getRequestLocale());
}
