import { flagEnabled } from "@/lib/flags";
import { DiscoverClient } from "@/components/discover/DiscoverClient";
import { ErrorState } from "@/components/ui/ErrorState";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function DiscoverPage() {
  const { t } = await getServerTranslator();
  const flagsOn =
    (await flagEnabled("ff_discovery")) && (await flagEnabled("ff_matching"));

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("discovery.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("discovery.pageHeading")}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-dm-muted">
        {t("discovery.pageIntro")}
      </p>

      <div className="mt-8">
        {!flagsOn ? (
          <ErrorState
            title={t("discovery.flagOffTitle")}
            description={t("discovery.flagOffBody")}
          />
        ) : (
          <DiscoverClient flagsOn={flagsOn} />
        )}
      </div>
    </div>
  );
}
