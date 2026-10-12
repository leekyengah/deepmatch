import Link from "next/link";
import { flagEnabled } from "@/lib/flags";
import { bankTransferInfo, formatVnd } from "@/lib/billing";
import { getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BankTransferClient } from "@/components/me/BankTransferClient";

export default async function PremiumPage() {
  const premiumOn = await flagEnabled("ff_premium");
  const billingOn = await flagEnabled("ff_billing");
  const bank = bankTransferInfo();
  const { t } = await getServerTranslator();
  const priceLabel = t("commerce.priceMonth", {
    price: formatVnd(bank.priceVnd),
  });

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("profile.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("commerce.premiumHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("commerce.premiumIntro", { price: priceLabel })}
      </p>
      <p className="mt-2 text-sm text-dm-muted">{t("commerce.noFalseUrgency")}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="good">{priceLabel}</Badge>
        {billingOn ? (
          <Badge tone="good">{t("commerce.bankTransferHd")}</Badge>
        ) : (
          <Badge tone="warn">{t("commerce.billingOff")}</Badge>
        )}
        {!premiumOn ? <Badge>{t("commerce.premiumOff")}</Badge> : null}
      </div>

      <Card className="mt-8 space-y-2 text-sm">
        <p className="font-semibold text-dm-raspberry">{t("commerce.benefits")}</p>
        <ul className="list-disc space-y-1 pl-5 text-dm-ink">
          <li>{t("commerce.benefitFilter")}</li>
          <li>{t("commerce.benefitSupport")}</li>
          <li>{t("commerce.benefitConcierge")}</li>
        </ul>
        <p className="pt-2 text-xs text-dm-muted">{t("commerce.refundPolicy")}</p>
      </Card>

      <div className="mt-8">
        {premiumOn && billingOn ? (
          <BankTransferClient />
        ) : (
          <p className="text-sm text-dm-muted">{t("commerce.billingDisabledHint")}</p>
        )}
      </div>

      <div className="mt-6">
        <Link href="/me">
          <Button type="button" variant="outline" size="sm">
            {t("commerce.backToMe")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
