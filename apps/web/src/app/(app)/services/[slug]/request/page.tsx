import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { companionBySlug, formatVnd } from "@/lib/companion-packages";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale, getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { PackageRequestClient } from "@/components/services/PackageRequestClient";

export default async function ServiceRequestPage({
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/services/${slug}/request`);

  const pkg = companionBySlug(slug);
  if (!pkg) notFound();
  const vi = locale.startsWith("vi");
  const title = vi ? pkg.titleVi : pkg.titleEn;

  return (
    <div className="mx-auto max-w-lg pb-16">
      <Link href={`/services/${slug}`} className="text-sm text-dm-muted underline">
        {t("booking.backToPackage")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("booking.intakeEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-dm-ink">
        {t("booking.intakeTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {title} · {pkg.code}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="good">{formatVnd(pkg.salePriceVnd)}</Badge>
        <Badge>{vi ? pkg.durationVi : pkg.durationEn}</Badge>
      </div>
      <p className="mt-4 text-sm text-dm-muted">{t("booking.intakeIntro")}</p>
      <div className="mt-6">
        <PackageRequestClient packageCode={pkg.code} slug={pkg.slug} />
      </div>
    </div>
  );
}
