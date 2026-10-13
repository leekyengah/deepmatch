import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { DeepSafeClient } from "@/components/safety/DeepSafeClient";

export default async function DeepSafePage() {
  const { t } = await getServerTranslator();
  return (
    <div className="dm-page-frame dm-page-frame--narrow">
      <Link href="/me" className="text-sm text-dm-muted underline">
        {t("safety.backMe")}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {t("safety.deepSafe")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("safety.pageIntro")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="good">{t("safety.badgeFree")}</Badge>
        <Badge tone="warn">{t("safety.badgeNotDispatch")}</Badge>
      </div>
      <div className="mt-8">
        <DeepSafeClient />
      </div>
    </div>
  );
}
