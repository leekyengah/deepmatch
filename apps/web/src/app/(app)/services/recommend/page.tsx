import { flagEnabled } from "@/lib/flags";
import { ErrorState } from "@/components/ui/ErrorState";
import { RecommendWizard } from "@/components/services/RecommendWizard";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ServicesRecommendPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_concierge"))) {
    return (
      <ErrorState
        title={t("booking.flagOffTitle")}
        description={t("booking.flagOffBodyStaging")}
      />
    );
  }
  return <RecommendWizard />;
}
