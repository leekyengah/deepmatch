import Link from "next/link";
import { notFound } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import {
  companionBySlug,
  formatVnd,
} from "@/lib/companion-packages";
import { getRequestLocale, getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { PackageBookButton } from "@/components/services/PackageBookButton";

export default async function ServicePackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { t } = await getServerTranslator();
  const locale = await getRequestLocale();
  if (!(await flagEnabled("ff_concierge"))) {
    return (
      <ErrorState
        title={t("booking.flagOffTitle")}
        description={t("booking.flagOffBodyStaging")}
      />
    );
  }

  const pkg = companionBySlug(slug);
  if (!pkg) notFound();

  const vi = locale.startsWith("vi");
  const title = vi ? pkg.titleVi : pkg.titleEn;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/services" className="text-sm text-dm-muted underline">
        {t("booking.backToServices")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {pkg.group === "matchmaking"
          ? t("booking.groupMatchmaking")
          : t("booking.groupCompanion")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{pkg.code}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="good">{formatVnd(pkg.salePriceVnd)}</Badge>
        <Badge tone="default">
          {t("booking.listPrice")}: {formatVnd(pkg.listPriceVnd)}
        </Badge>
        <Badge>{vi ? pkg.durationVi : pkg.durationEn}</Badge>
      </div>

      <Card className="mt-8 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-dm-ink">
            {t("booking.suitableFor")}
          </h2>
          <p className="mt-1 text-dm-muted">
            {vi ? pkg.suitableVi : pkg.suitableEn}
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-dm-ink">{t("booking.benefits")}</h2>
          <p className="mt-1 text-dm-muted">
            {vi ? pkg.benefitsVi : pkg.benefitsEn}
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-dm-ink">{t("booking.process")}</h2>
          <p className="mt-1 text-dm-muted">
            {vi ? pkg.processVi : pkg.processEn}
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-dm-ink">{t("booking.howToUse")}</h2>
          <p className="mt-1 text-dm-muted">
            {vi ? pkg.usageVi : pkg.usageEn}
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-dm-ink">{t("booking.limits")}</h2>
          <p className="mt-1 text-dm-muted">
            {vi ? pkg.limitsVi : pkg.limitsEn}
          </p>
        </section>
      </Card>

      <p className="mt-4 text-xs text-dm-muted">{t("booking.sandboxPaymentNote")}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <PackageBookButton packageCode={pkg.code} slug={pkg.slug} />
        <Link href="/bookings">
          <Button type="button" variant="outline">
            {t("booking.viewBookings")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
