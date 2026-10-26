"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";

const items: Array<{ href: string; labelKey: string; exact?: boolean }> = [
  { href: "/couple", labelKey: "couple.navOverview", exact: true },
  { href: "/couple/memories", labelKey: "couple.navMemories" },
  { href: "/couple/map", labelKey: "couple.navMap" },
  { href: "/couple/promises", labelKey: "couple.navPlans" },
  { href: "/couple/us", labelKey: "couple.navUs" },
];

export function CoupleSubNav({
  hasCouple,
  showInvite,
}: {
  hasCouple: boolean;
  showInvite?: boolean;
}) {
  const pathname = usePathname();
  const t = useT();

  return (
    <div className="flex flex-col gap-3 border-b border-dm-line/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <nav
        aria-label={t("couple.spaceFull")}
        className="flex gap-1 overflow-x-auto overscroll-x-contain text-sm font-medium [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap px-3 py-2 transition",
                active
                  ? "border-b-2 border-dm-primary font-semibold text-dm-primary"
                  : "border-b-2 border-transparent text-dm-muted hover:text-dm-ink",
              )}
              aria-current={active ? "page" : undefined}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
        {showInvite || !hasCouple ? (
          <Link
            href="/couple/invite"
            className={cn(
              "whitespace-nowrap px-3 py-2 transition",
              pathname.startsWith("/couple/invite")
                ? "border-b-2 border-dm-primary font-semibold text-dm-primary"
                : "border-b-2 border-transparent text-dm-muted hover:text-dm-ink",
            )}
          >
            {t("couple.invite")}
          </Link>
        ) : null}
      </nav>
      {hasCouple ? (
        <Link
          href="/couple/add"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-dm-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          {t("couple.addMemoryCtaPlus")}
        </Link>
      ) : null}
    </div>
  );
}
