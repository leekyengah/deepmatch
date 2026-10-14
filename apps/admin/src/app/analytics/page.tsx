import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AnalyticsPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const [{ count: users }, { count: pairs }, { count: msgs }, { count: bookings }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("pairs")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("service_bookings").select("id", { count: "exact", head: true }),
    ]);

  const rows = [
    [t("admin.statSignups"), users],
    [t("admin.statActivePairs"), pairs],
    [t("admin.statMessages"), msgs],
    [t("admin.statServiceBookings"), bookings],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.analyticsTitle")}</h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.analyticsIntro")}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-dm-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-dm-raspberry">
              {value ?? "—"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
