"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@deepmatch/i18n";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useI18n } from "./I18nProvider";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={t("accessibility.languageSwitcher")}
      value={locale}
      disabled={pending}
      className="rounded border border-dm-line bg-white px-2 py-1 text-xs"
      onChange={(e) => {
        const next = e.target.value as Locale;
        startTransition(async () => {
          await setLocaleAction(next);
          router.refresh();
        });
      }}
    >
      {LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
