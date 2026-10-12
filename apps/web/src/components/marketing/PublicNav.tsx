"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/I18nProvider";

export function PublicNav() {
  const t = useT();

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
      <Link href="/" aria-label={t("nav.homeAria")}>
        <BrandLogo variant="full" className="h-9 w-auto max-w-[180px]" />
      </Link>
      <nav
        className="hidden items-center gap-5 text-sm font-medium text-dm-raspberry/85 md:flex"
        aria-label="Primary"
      >
        <a href="#pillars">{t("marketing.navFind")}</a>
        <a href="#couple">{t("marketing.navCouple")}</a>
        <a href="#companion">{t("marketing.navCompanion")}</a>
        <a href="#ai">{t("marketing.navAi")}</a>
        <a href="#lifestyle">{t("marketing.navLifestyle")}</a>
        <a href="#safety">{t("marketing.navSafe")}</a>
        <Link href="/faq">{t("marketing.navFaq")}</Link>
      </nav>
      <div className="flex items-center gap-3 text-sm font-medium text-dm-raspberry/85">
        <LanguageSwitcher />
        <Link href="/login" className="hidden sm:inline">
          {t("marketing.ctaLogin")}
        </Link>
        <Link
          href="/signup"
          className="rounded-dm bg-dm-primary px-3 py-2 text-white shadow-dm transition hover:brightness-105"
        >
          {t("marketing.ctaSignup")}
        </Link>
      </div>
    </header>
  );
}
