"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, type Locale } from "@deepmatch/i18n";

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return { ok: false as const };
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return { ok: true as const, locale: locale as Locale };
}
