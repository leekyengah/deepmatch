"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/I18nProvider";

export function PublicNav() {
  const t = useT();

  return (
    <header className="sticky top-0 z-30 border-b border-dm-line/80 bg-dm-canvas/95 backdrop-blur-md">
      <div className="dm-page-frame mx-auto flex w-full items-center justify-between gap-4 px-dm-gutter py-4">
        <Link href="/" aria-label={t("nav.homeAria")}>
          <BrandLogo variant="full" className="h-8 w-auto max-w-[190px]" />
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm font-medium text-dm-ink/80 md:flex"
          aria-label="Primary"
        >
          <a href="#explore">{t("marketing.navExplore")}</a>
          <a href="#how">{t("marketing.navHow")}</a>
          <a href="#stories">{t("marketing.navStories")}</a>
        </nav>
        <div className="flex items-center gap-3 text-sm font-medium text-dm-ink/80">
          <LanguageSwitcher />
          <Link href="/login" className="hidden sm:inline">
            {t("marketing.ctaLogin")}
          </Link>
          <Link
            href="/signup"
            className="rounded-dm bg-dm-primary px-4 py-2.5 text-white transition hover:bg-[var(--dm-primary-hover)]"
          >
            {t("marketing.ctaSignup")}
          </Link>
        </div>
      </div>
    </header>
  );
}
