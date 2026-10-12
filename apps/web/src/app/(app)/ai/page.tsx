import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { AiAssistClient } from "@/components/ai/AiAssistClient";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AiHubPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        {t("ai.backLifestyle")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("ai.hubEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("ai.hubHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("ai.hubIntro")}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="warn">
          {t("ai.adapterBadge")}
        </Badge>
        <Badge tone="good">{t("ai.consentBadge")}</Badge>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/ai/deepmind" className="font-semibold text-dm-primary underline">
          {t("ai.deepmindLink")}
        </Link>
      </p>
      <div className="mt-8">
        <AiAssistClient />
      </div>
    </div>
  );
}
