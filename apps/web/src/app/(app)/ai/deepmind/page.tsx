import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { DeepMindClient } from "@/components/ai/DeepMindClient";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function DeepMindPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/ai" className="text-sm text-dm-muted underline">
        {t("ai.backAiHub")}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {t("ai.deepmind")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("ai.deepmindIntro")}
      </p>
      <div className="mt-4">
        <Badge tone="warn">{t("ai.notClinical")}</Badge>
      </div>
      <div className="mt-8">
        <DeepMindClient />
      </div>
    </div>
  );
}
