"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";
import { adminNav, adminPageTitleKey, isAdminNavActive } from "./nav";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useT();
  const title = t(adminPageTitleKey(pathname));
  const bare = pathname === "/login" || pathname === "/denied";

  if (bare) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen overflow-auto border-r border-dm-line bg-dm-panel px-4 py-7 md:block">
        <div className="mb-6 px-2.5">
          <BrandLogo variant="full" className="h-8 w-auto max-w-[180px]" />
          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[1.6px] text-dm-primary">
            {t("admin.opsBadge")}
          </p>
        </div>
        <nav aria-label={t("admin.navAria")} className="flex flex-col">
          {adminNav.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
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
        <p className="mt-8 px-3 text-[11px] leading-relaxed text-dm-muted">
          {t("admin.rbacNote")}
        </p>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-dm-line bg-[#fff9]/backdrop-blur-md px-5 md:px-10">
          <div>
            <p className="text-xs text-dm-muted">{t("admin.headerLabel")}</p>
            <p className="text-sm font-semibold text-dm-raspberry">{title}</p>
          </div>
          <LanguageSwitcher />
        </header>

        <div className="border-b border-dm-line px-3 py-2 md:hidden">
          <nav
            aria-label={t("admin.navAriaMobile")}
            className="flex gap-2 overflow-x-auto text-xs font-semibold"
          >
            {adminNav.map((item) => {
              const active = isAdminNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2",
                    active
                      ? "bg-dm-primary text-white"
                      : "bg-dm-surface text-dm-raspberry",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="mx-auto max-w-6xl px-5 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
