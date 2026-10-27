import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AdminHome() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const [
    { count: users },
    { count: matches },
    { count: openReports },
    { count: bookings },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("mutual_matches").select("id", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("service_bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "requested"),
  ]);

  const stats = [
    [t("admin.statUsers"), users ?? "—"],
    [t("admin.statMatches"), matches ?? "—"],
    [t("admin.statReports"), openReports ?? "—"],
    [t("admin.statBookings"), bookings ?? "—"],
  ] as const;

  const modules = [
    [t("admin.users"), "/users"],
    [t("admin.modLink"), "/moderation"],
    [t("admin.matchLink"), "/matching"],
    [t("admin.safetyLink"), "/safety"],
    [t("admin.servicesLink"), "/services"],
    [t("admin.billing"), "/billing"],
    [t("admin.cms"), "/cms"],
    [t("admin.analytics"), "/analytics"],
    [t("admin.flagsLink"), "/flags"],
  ];

  return (
    <div>
      <p className="text-sm font-semibold tracking-wide text-dm-primary">
        {t("admin.homeBrand")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-dm-raspberry">
        {t("admin.dashboard")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-dm-muted">{t("admin.homeIntro")}</p>
      <div className="mt-4">
        <Badge tone="good">{t("admin.liveCounts")}</Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="text-sm">
            <p className="text-dm-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-dm-raspberry">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {modules.map(([label, href]) => (
          <Link key={href} href={href}>
            <Card className="text-sm font-semibold text-dm-raspberry transition hover:border-dm-primary">
              {label}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
