import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function MatchingOpsPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const { count: discoverable } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("discovery_opt_in", true)
    .eq("hidden_from_discovery", false)
    .eq("suspended", false);

  const { count: mutual } = await supabase
    .from("mutual_matches")
    .select("id", { count: "exact", head: true });

  const { data: flags } = await supabase
    .from("feature_flags")
    .select("name, enabled")
    .in("name", ["ff_matching", "ff_discovery"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.matchingOps")}</h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.matchingIntro")}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-dm-muted">{t("admin.discoverable")}</p>
          <p className="mt-1 text-2xl font-bold text-dm-raspberry">
            {discoverable ?? "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-dm-muted">Mutual matches</p>
          <p className="mt-1 text-2xl font-bold text-dm-raspberry">
            {mutual ?? "—"}
          </p>
        </Card>
      </div>
      <ul className="mt-6 space-y-2">
        {(flags ?? []).map((f) => (
          <li
            key={f.name}
            className="flex items-center justify-between rounded-dm border border-dm-line px-3 py-2 text-sm"
          >
            <span>{f.name}</span>
            <Badge tone={f.enabled ? "good" : "warn"}>
              {f.enabled ? "ON" : "OFF"}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
