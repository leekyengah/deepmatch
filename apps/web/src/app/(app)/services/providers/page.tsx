import Link from "next/link";
import { flagEnabled } from "@/lib/flags";
import { getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

const SAMPLE = [
  {
    id: "p-listen-01",
    nameVi: "Chuyên viên lắng nghe A",
    nameEn: "Listening provider A",
    region: "Hà Nội · online",
    capacity: "3 buổi/tuần",
    verified: false,
  },
  {
    id: "p-match-01",
    nameVi: "Chuyên viên mai mối B",
    nameEn: "Matchmaking advisor B",
    region: "TP.HCM · online",
    capacity: "waitlist",
    verified: false,
  },
];

export default async function ProvidersPage() {
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
    <div className="dm-page-frame dm-page-frame--standard pb-16">
      <Link href="/services" className="text-sm text-dm-muted underline">
        {t("booking.backToServices")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-dm-ink">
        {t("booking.providersTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("booking.providersIntro")}</p>
      <ul className="mt-6 space-y-3">
        {SAMPLE.map((p) => (
          <li key={p.id}>
            <Card className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-dm-ink">{p.nameVi}</h2>
              </div>
              <p className="text-dm-muted">{p.region}</p>
              <p>
                {t("booking.providersCapacity")}: {p.capacity}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}