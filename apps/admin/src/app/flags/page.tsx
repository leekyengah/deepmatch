import { createClient } from "@/lib/supabase/server";
import { defaultFlags } from "@deepmatch/shared";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { toggleFlagAction } from "./actions";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function FlagsPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("name, enabled, updated_at")
    .order("name");

  const rows =
    data && data.length > 0
      ? data
      : Object.entries(defaultFlags).map(([name, enabled]) => ({
          name,
          enabled,
          updated_at: null as string | null,
        }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">
        Feature flags / kill switches
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.flagsIntro")}
      </p>
      {error ? (
        <p className="mt-4 text-sm text-dm-muted">
          {t("admin.flagsDbError", { error: error.message })}
        </p>
      ) : null}
      <ul className="mt-6 space-y-2">
        {rows.map((row) => (
          <li key={row.name}>
            <Card className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <span className="font-medium text-dm-ink">{row.name}</span>
                {row.updated_at ? (
                  <p className="text-xs text-dm-muted">
                    {new Date(row.updated_at).toLocaleString("vi-VN")}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={row.enabled ? "good" : "warn"}>
                  {row.enabled ? "ON" : "OFF"}
                </Badge>
                {data && data.length > 0 ? (
                  <form action={toggleFlagAction}>
                    <input type="hidden" name="name" value={row.name} />
                    <input
                      type="hidden"
                      name="enabled"
                      value={row.enabled ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="rounded-dm border border-dm-line px-2 py-1 text-xs font-semibold"
                    >
                      {row.enabled ? t("admin.disable") : t("admin.enable")}
                    </button>
                  </form>
                ) : null}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
