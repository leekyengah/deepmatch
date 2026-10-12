import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default async function LifestyleHomePage() {
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");
  const { t } = await getServerTranslator();

  const pillars = [
    { href: "/lifestyle/gift", label: "DeepGift", descKey: "commerce.pillarGift" },
    {
      href: "/lifestyle/fashion",
      label: "DeepStyle",
      descKey: "commerce.pillarFashion",
    },
    {
      href: "/lifestyle/beauty",
      label: "DeepBeauty",
      descKey: "commerce.pillarBeauty",
    },
    { href: "/lifestyle/venue", label: "DeepDate", descKey: "commerce.pillarVenue" },
    {
      href: "/lifestyle/travel",
      label: "DeepTravel",
      descKey: "commerce.pillarTravel",
    },
    { href: "/safe", label: "DeepSafe", descKey: "commerce.pillarSafe" },
    {
      href: "/lifestyle/safety",
      label: "DeepSafe catalog",
      descKey: "commerce.pillarSafeCatalog",
    },
    {
      href: "/lifestyle/orders",
      label: t("commerce.ordersDemo"),
      descKey: "commerce.pillarOrders",
    },
    {
      href: "/lifestyle/cart",
      label: t("commerce.cartDemo"),
      descKey: "commerce.pillarOrders",
    },
    { href: "/ai", label: t("ai.title"), descKey: "commerce.pillarAi" },
    {
      href: "/ai/deepmind",
      label: "DeepMind",
      descKey: "commerce.pillarDeepmind",
    },
  ];

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("commerce.lifestyleEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("commerce.lifestyleHeading")}
      </h1>
      <p className="mt-2 font-editorial text-sm text-dm-muted">
        {t("commerce.lifestyleIntro")}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="warn">{t("commerce.lifestyleBadge")}</Badge>
        <Badge>{t("marketing.lifestyleDemoBadge")}</Badge>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {pillars.map((p) => (
          <Link key={p.href} href={p.href}>
            <Card className="h-full border-dm-line text-sm transition hover:border-dm-primary">
              <p className="font-display text-lg font-semibold text-dm-ink">
                {p.label}
              </p>
              <p className="mt-1 text-dm-muted">{t(p.descKey)}</p>
              <p className="mt-3 text-[11px] font-semibold text-dm-champagne">
                {t("common.optional")}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
