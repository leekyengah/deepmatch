import { LikesClient } from "@/components/likes/LikesClient";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function LikesPage() {
  const { t } = await getServerTranslator();
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("discovery.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("matching.title")}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-dm-muted">
        {t("matching.pageIntro")}
      </p>
      <div className="mt-8">
        <LikesClient />
      </div>
    </div>
  );
}
