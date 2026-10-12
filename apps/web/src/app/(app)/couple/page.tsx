import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";
import { getServerTranslator } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CoupleHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const coupleId = await getActiveCoupleId(user.id);
  let pinCount = 0;
  if (coupleId) {
    const { count } = await supabase
      .from("pins")
      .select("id", { count: "exact", head: true })
      .eq("pair_id", coupleId);
    pinCount = count ?? 0;
  }

  const tabs: Array<[string, string]> = [
    [t("couple.navMap"), "/couple/map"],
    [t("couple.navMemories"), "/couple/memories"],
    [t("couple.navAdd"), "/couple/add"],
    [t("couple.navPromises"), "/couple/promises"],
    [t("couple.navUs"), "/couple/us"],
  ];

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("couple.spaceHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("couple.spaceIntro")}</p>
      <p className="mt-2 text-sm">
        <Link href="/legal/couple-data" className="text-dm-primary underline">
          {t("couple.dataPolicyLink")}
        </Link>
      </p>

      {coupleId ? (
        <p className="mt-4 rounded-dm bg-dm-surface px-3 py-2 text-sm text-dm-raspberry">
          {t("couple.connectedPins", { count: pinCount })}
        </p>
      ) : (
        <div className="mt-6">
          <Link href="/couple/invite">
            <Button type="button">{t("couple.inviteOrPair")}</Button>
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {tabs.map(([label, href]) => (
          <Link key={href} href={href}>
            <Card className="h-full font-medium text-dm-raspberry transition hover:border-dm-primary">
              {label}
            </Card>
          </Link>
        ))}
      </div>

      {coupleId ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl text-dm-raspberry">
            {t("couple.commerceBridgeTitle")}
          </h2>
          <p className="mt-2 text-sm text-dm-muted">
            {t("couple.commerceBridgeBody")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/lifestyle/gift">
              <Button type="button" variant="secondary">
                {t("couple.ctaGiftIdeas")}
              </Button>
            </Link>
            <Link href="/lifestyle/venue">
              <Button type="button" variant="secondary">
                {t("couple.ctaDatePlan")}
              </Button>
            </Link>
            <Link href="/ai">
              <Button type="button" variant="secondary">
                {t("couple.ctaAiHub")}
              </Button>
            </Link>
          </div>
        </section>
      ) : null}

      {!coupleId ? (
        <div className="mt-8">
          <EmptyState
            title={t("couple.emptySpaceTitle")}
            description={t("couple.emptySpaceBody")}
            action={
              <Link href="/couple/invite">
                <Button type="button" variant="secondary">
                  {t("couple.openInvite")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : pinCount === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t("couple.emptyPinsTitle")}
            description={t("couple.emptyPinsBody")}
            action={
              <Link href="/couple/add">
                <Button type="button" variant="secondary">
                  {t("couple.addPin")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
