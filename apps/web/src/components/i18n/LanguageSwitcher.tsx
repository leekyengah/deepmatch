"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@deepmatch/i18n";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useI18n } from "./I18nProvider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className={className}>
      <span className="sr-only">{t("accessibility.languageSwitcher")}</span>
      <select
        aria-label={t("accessibility.languageSwitcher")}
        value={locale}
        disabled={pending}
        className="rounded-dm border border-dm-line bg-dm-panel px-2 py-1.5 text-[11px] font-semibold text-dm-raspberry"
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
    </label>
  );
}
