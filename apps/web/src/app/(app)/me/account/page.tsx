import Link from "next/link";
import { flagEnabled } from "@/lib/flags";
import { getServerTranslator } from "@/lib/i18n/server";
import { BillingClient } from "@/components/me/BillingClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function MeAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const sp = await searchParams;
  const billingOn = await flagEnabled("ff_billing");
  const { t } = await getServerTranslator();

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("profile.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("profile.account")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("profile.accountIntro")}</p>

      {sp.billing === "success" ? (
        <p className="mt-4 rounded-dm bg-dm-surface px-3 py-2 text-sm" role="status">
          {t("profile.billingSuccess")}
        </p>
      ) : null}
      {sp.billing === "cancel" ? (
        <p className="mt-4 rounded-dm bg-dm-surface px-3 py-2 text-sm" role="status">
          {t("profile.billingCancel")}
        </p>
      ) : null}

      <div className="mt-8 space-y-3">
        <Card>
          <h2 className="font-semibold text-dm-raspberry">
            {t("profile.billingSection")}
          </h2>
          <div className="mt-2">
            <BillingClient billingOn={billingOn} />
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-dm-raspberry">
            {t("profile.sessionsSection")}
          </h2>
          <p className="mt-1 text-sm text-dm-muted">{t("profile.sessionsHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/forgot-password">
              <Button type="button" size="sm" variant="outline">
                {t("profile.resetPasswordEmail")}
              </Button>
            </Link>
            <Link href="/auth/reset">
              <Button type="button" size="sm" variant="secondary">
                {t("profile.changePasswordSignedIn")}
              </Button>
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-dm-raspberry">
            {t("profile.notificationsSection")}
          </h2>
          <p className="mt-1 text-sm text-dm-muted">
            {t("profile.notificationsHint")}
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-dm-raspberry">
            {t("profile.dataSection")}
          </h2>
          <p className="mt-1 text-sm text-dm-muted">{t("profile.dataHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/me/privacy">
              <Button type="button" size="sm" variant="outline">
                {t("profile.privacy")}
              </Button>
            </Link>
            <Link href="/account-deletion">
              <Button type="button" size="sm" variant="outline">
                {t("profile.deleteAccount")}
              </Button>
            </Link>
            <Link href="/privacy">
              <Button type="button" size="sm" variant="secondary">
                {t("profile.privacyPublic")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
