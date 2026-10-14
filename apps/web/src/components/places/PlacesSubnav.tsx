import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";

export async function PlacesSubnav({ active }: { active: "map" | "top" | "memories" }) {
  const { t } = await getServerTranslator();
  const items = [
    { id: "map" as const, href: "/places/map", label: t("places.navMap") },
    { id: "top" as const, href: "/places/top", label: t("places.navTop") },
    { id: "memories" as const, href: "/couple/memories", label: t("places.navMemories") },
  ];
  return (
    <nav
      aria-label={t("places.moduleNav")}
      className="mt-4 flex flex-wrap gap-2 text-sm font-semibold"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={
            active === item.id
              ? "rounded-full bg-dm-primary px-3 py-1.5 text-white"
              : "rounded-full border border-dm-line bg-dm-panel px-3 py-1.5 text-dm-ink"
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
