import Link from "next/link";
import { flagEnabled } from "@/lib/flags";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { ServicesClient } from "@/components/services/ServicesClient";
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {t("booking.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
            {t("booking.servicesHeading")}
          </h1>
          <p className="mt-2 max-w-xl font-editorial text-sm text-dm-muted">
            {t("booking.servicesIntroSeven")}
          </p>
        </div>
        <Link href="/bookings">
          <Button type="button" variant="outline" size="sm">
            {t("booking.viewBookings")}
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <ServicesClient />
      </div>
    </div>
  );
}
