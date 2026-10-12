"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/I18nProvider";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/components/ui/cn";
import { isNavActive, mobileNav, pageTitleKey, primaryNav } from "./nav";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useT();
  const title = t(pageTitleKey(pathname));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen overflow-auto border-r border-dm-line bg-dm-panel px-4 py-7 md:block">
        <Link
          href="/"
          className="mb-7 block px-2.5"
          aria-label={t("nav.homeAria")}
        >
          <BrandLogo variant="full" className="h-10 w-auto max-w-[200px]" />
          <span className="mt-1 block text-[10px] text-dm-muted">
            {t("common.tagline")}
          </span>
        </Link>

        <p className="px-3.5 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[1.6px] text-[#B49FAC]">
          {t("nav.journey")}
        </p>
        <nav aria-label={t("nav.primaryAria")} className="flex flex-col">
          {primaryNav.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "my-0.5 rounded-dm px-3.5 py-3 text-[13px] font-semibold text-[#6E5363] transition hover:bg-[#FFE9F0] hover:text-dm-raspberry",
                  active &&
                    "bg-[#FFE9F0] text-dm-raspberry shadow-[inset_3px_0_0_var(--dm-primary)]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-[#F9DDE8] bg-gradient-to-br from-[#FFF0F5] to-[#FFF9FB] p-4 text-xs leading-relaxed text-dm-raspberry">
          {t("nav.coupleNote")}
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-dm-line bg-[#fff9]/backdrop-blur-md px-5 md:px-10">
          <div>
            <p className="text-xs text-dm-muted">{t("common.brand")}</p>
            <p className="text-sm font-semibold text-dm-raspberry">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden rounded-full border border-dm-line bg-dm-panel px-3 py-2 text-[11px] font-bold text-dm-raspberry sm:inline">
              {t("common.staging")}
            </span>
            <Link href="/me" aria-label={t("nav.meAria")}>
              <Avatar label={t("nav.avatarMe")} />
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1510px] px-5 py-8 md:px-10 md:py-9">
          {children}
        </main>
      </div>

      <nav
        aria-label={t("nav.mobileAria")}
        className="fixed inset-x-0 bottom-0 z-20 flex h-14 items-center justify-around border-t border-dm-line bg-dm-panel text-[11px] font-semibold text-dm-raspberry md:hidden"
      >
        {mobileNav.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center px-1 py-2",
                active ? "text-dm-primary" : "text-dm-muted",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
