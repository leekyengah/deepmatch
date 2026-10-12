import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { AiAssistClient } from "@/components/ai/AiAssistClient";
import { AiUsageBadge } from "@/components/ai/AiUsageBadge";
import { getServerTranslator } from "@/lib/i18n/server";

const ENTRIES = [
  { href: "/ai/coach", titleKey: "ai.taskProfileCoach", bodyKey: "ai.entryCoachBody" },
  { href: "/ai/deepmind", titleKey: "ai.taskDeepmind", bodyKey: "ai.entryDeepmindBody" },
  { href: "/lifestyle/gift", titleKey: "ai.taskGift", bodyKey: "ai.entryGiftBody" },
  { href: "/lifestyle/fashion", titleKey: "ai.taskStyle", bodyKey: "ai.entryStyleBody" },
  { href: "/lifestyle/beauty", titleKey: "ai.taskBeauty", bodyKey: "ai.entryBeautyBody" },
  { href: "/lifestyle/venue", titleKey: "ai.taskDatePlan", bodyKey: "ai.entryDateBody" },
  { href: "/lifestyle/travel", titleKey: "ai.taskTravel", bodyKey: "ai.entryTravelBody" },
  { href: "/safe", titleKey: "ai.taskSafety", bodyKey: "ai.entrySafeBody" },
] as const;

export default async function AiHubPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <AnalyticsBeacon event="ai_hub_open" />
      <Link href="/home" className="text-sm text-dm-muted underline">
        {t("home.eyebrow")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("ai.hubEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("ai.hubHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("ai.hubIntro")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="warn">{t("ai.adapterBadge")}</Badge>
        <Badge tone="good">{t("ai.consentBadge")}</Badge>
        <AiUsageBadge />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {ENTRIES.map((e) => (
          <Link key={e.href} href={e.href}>
            <Card className="h-full text-sm transition hover:border-dm-primary">
              <p className="font-semibold text-dm-raspberry">{t(e.titleKey)}</p>
              <p className="mt-1 text-dm-muted">{t(e.bodyKey)}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl text-dm-raspberry">
        {t("ai.taskPicker")}
      </h2>
      <p className="mt-2 text-sm text-dm-muted">{t("ai.taskPickerHint")}</p>
      <div className="mt-6">
        <AiAssistClient />
      </div>
    </div>
  );
}
