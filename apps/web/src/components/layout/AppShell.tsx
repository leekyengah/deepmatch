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
  const isHome = pathname === "/home";

  return (
    <div className="min-h-screen bg-[#F7F3EE] md:grid md:grid-cols-[272px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen overflow-auto border-r border-[#E8DCD4] bg-[#FAF6F3] px-4 py-7 md:flex md:flex-col">
        <Link
          href="/home"
          className="mb-6 block px-2.5"
          aria-label={t("nav.homeAria")}
        >
          <BrandLogo variant="full" className="h-10 w-auto max-w-[200px]" />
          <span className="mt-1.5 block text-[10px] leading-snug text-dm-muted">
            {t("common.tagline")}
          </span>
        </Link>

        <nav aria-label={t("nav.primaryAria")} className="flex flex-col gap-0.5">
          {primaryNav.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "my-0.5 rounded-xl px-3.5 py-3 text-[13px] font-semibold transition",
                  active
                    ? "bg-[#6B2D3C] text-white shadow-sm"
                    : "text-dm-muted hover:bg-[#F4E9E4] hover:text-[#6B2D3C]",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{t(item.labelKey)}</span>
                  {item.href === "/chat" ? (
                    <span
                      className={cn(
                        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                        active ? "bg-white text-[#6B2D3C]" : "bg-[#A63E52] text-white",
                      )}
                    >
                      3
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <div className="rounded-2xl border border-[#E8DCD4] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#241A1C]">
              Nâng cấp DeepMatch+
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dm-muted">
              Lọc nâng cao và kết nối có chiều sâu cho hành trình của bạn.
            </p>
            <Link
              href="/me/premium"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#6B2D3C] px-3 py-2.5 text-xs font-semibold text-white"
            >
              Khám phá ngay →
            </Link>
          </div>
          <p className="px-1 text-[10px] leading-relaxed text-dm-muted">
            {t("nav.coupleNote")}
          </p>
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex h-[72px] items-center gap-3 border-b border-[#E8DCD4] bg-[#F7F3EE]/92 px-4 backdrop-blur-md md:gap-4 md:px-8">
          {isHome ? (
            <label className="relative mx-auto hidden min-w-0 max-w-xl flex-1 md:block">
              <span className="sr-only">Tìm kiếm</span>
              <input
                type="search"
                placeholder="Tìm kiếm người, địa điểm, chủ đề..."
                className="w-full rounded-full border border-[#E8DCD4] bg-white px-5 py-2.5 text-sm text-[#241A1C] outline-none ring-0 placeholder:text-dm-muted focus:border-[#6B2D3C]"
              />
            </label>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="text-xs text-dm-muted">{t("common.brand")}</p>
              <p className="truncate text-sm font-semibold text-[#6B2D3C]">{title}</p>
            </div>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E8DCD4] bg-white text-[#6B2D3C]"
              aria-label="Thông báo"
            >
              <BellIcon />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#A63E52]" />
            </button>
            <LanguageSwitcher />
            <Link href="/me" aria-label={t("nav.meAria")} className="flex items-center gap-2">
              <Avatar label={t("nav.avatarMe")} />
              <span className="hidden text-sm font-medium text-[#241A1C] lg:inline">
                {t("nav.avatarMe")}
              </span>
            </Link>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto px-4 py-6 md:px-8 md:py-8",
            isHome ? "max-w-[1510px]" : "max-w-[1510px]",
          )}
        >
          {children}
        </main>
      </div>

      <nav
        aria-label={t("nav.mobileAria")}
        className="fixed inset-x-0 bottom-0 z-20 flex h-14 items-center justify-around border-t border-[#E8DCD4] bg-[#FAF6F3] text-[11px] font-semibold text-[#6B2D3C] md:hidden"
      >
        {mobileNav.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center px-1 py-2",
                active ? "text-[#6B2D3C]" : "text-dm-muted",
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

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 2 6H4c.5-1 2-2.5 2-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
