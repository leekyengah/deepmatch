import { flagEnabled } from "@/lib/flags";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { DiscoverHub } from "@/components/discover/DiscoverHub";
import { ErrorState } from "@/components/ui/ErrorState";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function DiscoverPage() {
  const { t } = await getServerTranslator();
  const flagsOn =
    (await flagEnabled("ff_discovery")) && (await flagEnabled("ff_matching"));

  return (
    <div>
      <AnalyticsBeacon event="discover_view" />
      {!flagsOn ? (
        <ErrorState
          title={t("discovery.flagOffTitle")}
          description={t("discovery.flagOffBody")}
        />
      ) : (
        <DiscoverHub flagsOn={flagsOn} />
      )}
    </div>
  );
}
