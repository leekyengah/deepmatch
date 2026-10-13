import Link from "next/link";
import { flagEnabled } from "@/lib/flags";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConciergeMarketplace } from "@/components/services/ConciergeMarketplace";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ServicesPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_concierge"))) {
    return (
      <ErrorState
        title={t("booking.flagOffTitle")}
        description={t("booking.flagOffBodyStaging")}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Link href="/bookings">
          <Button type="button" variant="outline" size="sm">
            {t("booking.viewBookings")}
          </Button>
        </Link>
      </div>
      <ConciergeMarketplace />
    </div>
  );
}
