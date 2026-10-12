import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { AiAssistClient } from "@/components/ai/AiAssistClient";
import { getServerTranslator } from "@/lib/i18n/server";

/** EXT-009 — Profile Coach entry (never auto-publish). */
export default async function ProfileCoachPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/ai" className="text-sm text-dm-muted underline">
        {t("ai.backAiHub")}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {t("ai.coachTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("ai.coachIntro")}
      </p>
      <div className="mt-4">
        <Badge tone="warn">{t("ai.noAutoPublish")}</Badge>
      </div>
      <div className="mt-8">
        <AiAssistClient />
      </div>
      <p className="mt-6 text-sm">
        <Link href="/me/edit" className="underline">
          {t("ai.openEditProfile")}
        </Link>
      </p>
    </div>
  );
}
