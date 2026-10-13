import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CouplePlansClient } from "@/components/couple/CouplePlansClient";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CouplePromisesPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const coupleId = await getActiveCoupleId(user.id);

  const { data: pins } = coupleId
    ? await supabase
        .from("pins")
        .select("id, title, note, place_label, created_at")
        .eq("pair_id", coupleId)
        .eq("layer", "wishlist")
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  let dates: Array<{
    id: string;
    title: string;
    starts_at: string;
    place_label: string | null;
    status: string;
  }> = [];

  if (coupleId) {
    const datesRes = await supabase
      .from("couple_dates")
      .select("id, title, starts_at, place_label, status")
      .eq("pair_id", coupleId)
      .neq("status", "cancelled")
      .order("starts_at", { ascending: true });
    if (!datesRes.error && datesRes.data) dates = datesRes.data;
  }

  return (
    <div className="dm-page-frame dm-page-frame--standard">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("couple.plansHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("couple.plansIntro")}</p>

      {!coupleId ? (
        <div className="mt-8">
          <EmptyState
            title={t("couple.emptySpaceTitle")}
            action={
              <Link href="/couple/invite">
                <Button type="button" size="sm">
                  {t("memories.inviteCta")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold text-dm-ink">
              {t("couple.upcomingDate")}
            </h2>
            <div className="mt-4">
              <CouplePlansClient coupleId={coupleId} initialDates={dates} />
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-dm-ink">
                  {t("couple.wishTogether")}
                </h2>
                <p className="mt-1 text-sm text-dm-muted">
                  {t("couple.promisesIntro")}
                </p>
              </div>
              <Link href="/couple/add">
                <Button type="button" size="sm" variant="outline">
                  {t("couple.promisesAddCta")}
                </Button>
              </Link>
            </div>

            {!pins?.length ? (
              <div className="mt-4">
                <EmptyState
                  title={t("couple.promisesEmptyTitle")}
                  description={t("couple.promisesEmptyBody")}
                  action={
                    <Link href="/couple/add">
                      <Button type="button" size="sm">
                        {t("couple.promisesAddCta")}
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {pins.map((p) => (
                  <li key={p.id}>
                    <Card className="overflow-hidden p-0">
                      <div className="aspect-[16/10] bg-gradient-to-br from-dm-blush via-dm-surface to-dm-champagne/40" />
                      <div className="p-4">
                        <h3 className="font-semibold text-dm-ink">{p.title}</h3>
                        {p.place_label || p.note ? (
                          <p className="mt-1 line-clamp-2 text-sm text-dm-muted">
                            {p.place_label ?? p.note}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
