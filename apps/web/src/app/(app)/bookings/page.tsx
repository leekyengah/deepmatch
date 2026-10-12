import { flagEnabled } from "@/lib/flags";
import { ErrorState } from "@/components/ui/ErrorState";
import { BookingsClient } from "@/components/services/BookingsClient";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function BookingsPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_concierge"))) {
    return (
      <ErrorState
        title={t("booking.flagOffTitle")}
        description={t("booking.flagOffBody")}
      />
    );
  }

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("booking.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("booking.heading")}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-dm-muted">
        {t("booking.intro")}
      </p>
      <BookingsClient />
    </div>
  );
}
