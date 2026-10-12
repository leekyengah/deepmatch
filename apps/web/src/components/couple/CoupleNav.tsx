"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";

const items = [
  { href: "/couple", labelKey: "couple.title", exact: true },
  { href: "/couple/map", labelKey: "couple.navMap" },
  { href: "/couple/memories", labelKey: "couple.navMemories" },
  { href: "/couple/add", labelKey: "couple.navAdd" },
  { href: "/couple/promises", labelKey: "couple.navPromises" },
  { href: "/couple/us", labelKey: "couple.navUs" },
  { href: "/couple/invite", labelKey: "couple.invite" },
];

export function CoupleNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      aria-label={t("couple.spaceFull")}
      className="mb-6 flex gap-2 overflow-x-auto pb-1 text-xs font-semibold"
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
              "whitespace-nowrap rounded-full px-3 py-2",
              active
                ? "bg-dm-primary text-white"
                : "bg-dm-surface text-dm-raspberry",
            )}
            aria-current={active ? "page" : undefined}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
