import Link from "next/link";
import { formatDateTime } from "@deepmatch/i18n";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale, getServerTranslator } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function MeHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getServerTranslator();
  const locale = await getRequestLocale();

  if (!user) {
    return (
      <EmptyState
        title={t("auth.needLoginTitle")}
        action={
          <Link href="/login">
            <Button type="button">{t("auth.login")}</Button>
          </Link>
        }
      />
    );
  }

  const { data: matches } = await supabase
    .from("mutual_matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: pairs } = await supabase
    .from("pairs")
    .select("id, status, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: bookings } = await supabase
    .from("service_bookings")
    .select("id, status, created_at")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const empty = !matches?.length && !pairs?.length && !bookings?.length;

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("profile.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("profile.history")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("profile.historyIntro")}</p>

      {empty ? (
        <div className="mt-8">
          <EmptyState
            title={t("profile.historyEmptyTitle")}
            description={t("profile.historyEmptyBody")}
            action={
              <Link href="/likes">
                <Button type="button" size="sm">
                  {t("profile.viewMatches")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <section>
            <h2 className="font-semibold text-dm-raspberry">
              {t("profile.sectionMatches")}
            </h2>
            <ul className="mt-2 space-y-2">
              {(matches ?? []).map((m) => (
                <li key={m.id}>
                  <Card className="text-sm">
                    {t("profile.matchRow", {
                      id: m.id.slice(0, 8),
                      when: formatDateTime(m.created_at, locale),
                    })}
                    <div className="mt-2">
                      <Link href="/chat">
                        <Button type="button" size="sm" variant="outline">
                          {t("profile.openChat")}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-dm-raspberry">
              {t("profile.sectionPairs")}
            </h2>
            <ul className="mt-2 space-y-2">
              {(pairs ?? []).map((p) => (
                <li key={p.id}>
                  <Card className="text-sm">
                    {p.status} · {p.id.slice(0, 8)}…
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-dm-raspberry">
              {t("profile.sectionBookings")}
            </h2>
            <ul className="mt-2 space-y-2">
              {(bookings ?? []).map((b) => (
                <li key={b.id}>
                  <Card className="text-sm">
                    {b.status} · {formatDateTime(b.created_at, locale)}
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
