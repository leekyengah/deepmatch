import Link from "next/link";
import { notFound } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { redirect } from "next/navigation";
import {
  companionByCode,
  companionBySlug,
  formatVnd,
} from "@/lib/companion-packages";
import { getRequestLocale, getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { PackageBookButton } from "@/components/services/PackageBookButton";

function processSteps(raw: string): string[] {
  return raw
    .split(/\s*→\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

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

  const byCode = companionByCode(slug);
  if (byCode && byCode.slug !== slug) redirect(`/services/${byCode.slug}`);
  const pkg = companionBySlug(slug) ?? byCode;
  if (!pkg) notFound();

  const vi = locale.startsWith("vi");
  const title = vi ? pkg.titleVi : pkg.titleEn;
  const steps = processSteps(vi ? pkg.processVi : pkg.processEn);
  const faq = [
    {
      q: t("booking.faqPriceQ"),
      a: t("booking.faqPriceA", { price: formatVnd(pkg.salePriceVnd) }),
    },
    {
      q: t("booking.faqSandboxQ"),
      a: t("booking.sandboxPaymentNote"),
    },
    {
      q: t("booking.faqLimitsQ"),
      a: vi ? pkg.limitsVi : pkg.limitsEn,
    },
  ];

  return (
    <div className="dm-page-frame dm-page-frame--standard pb-28">
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
          <ol className="mt-3 space-y-2">
            {steps.map((step, i) => (
              <li
                key={`${i}-${step}`}
                className="flex gap-3 rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
              >
                <span className="font-display text-lg font-semibold text-dm-champagne">
                  {i + 1}
                </span>
                <span className="text-dm-ink">{step}</span>
              </li>
            ))}
          </ol>
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

      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {t("booking.faqTitle")}
        </h2>
        <div className="mt-3 space-y-2">
          {faq.map((item) => (
            <details
              key={item.q}
              className="rounded-dm border border-dm-line bg-dm-panel px-4 py-3 text-sm"
            >
              <summary className="cursor-pointer font-semibold text-dm-ink">
                {item.q}
              </summary>
              <p className="mt-2 text-dm-muted leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-dm-line bg-dm-panel/95 px-dm-gutter py-3 pb-[max(0.75rem,var(--dm-safe-bottom))] backdrop-blur md:pb-3">
        <div className="dm-page-frame dm-page-frame--standard mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-semibold text-dm-ink">{formatVnd(pkg.salePriceVnd)}</p>
            <p className="text-xs text-dm-muted">{t("booking.stickySandbox")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/services/${pkg.slug}/request`}>
              <Button type="button">{t("booking.openIntake")}</Button>
            </Link>
            <PackageBookButton packageCode={pkg.code} slug={pkg.slug} />
            <Link href="/bookings">
              <Button type="button" variant="outline">
                {t("booking.viewBookings")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
