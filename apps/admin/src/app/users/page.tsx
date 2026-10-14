import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { setUserSuspendedAction } from "./actions";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function UsersAdminPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, fuzzy_region, mode, discovery_opt_in, suspended, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.usersTitle")}</h1>
      <p className="mt-3 text-sm text-dm-muted">
        {t("admin.usersIntro")}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      ) : null}

      {!data?.length ? (
        <div className="mt-6">
          <EmptyState
            title={t("admin.usersEmptyTitle")}
            description={t("admin.usersEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {data.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-dm border border-dm-line bg-dm-panel px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-dm-raspberry">
                  {u.display_name}
                </p>
                <p className="text-xs text-dm-muted">
                  {u.id.slice(0, 8)}… · {u.fuzzy_region ?? "—"} · {u.mode}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {u.discovery_opt_in ? (
                  <Badge tone="good">Discovery</Badge>
                ) : (
                  <Badge>{t("admin.hidden")}</Badge>
                )}
                {u.suspended ? (
                  <Badge tone="warn">Suspended</Badge>
                ) : (
                  <Badge tone="good">Active</Badge>
                )}
                <form action={setUserSuspendedAction} className="flex gap-1">
                  <input type="hidden" name="user_id" value={u.id} />
                  <input
                    type="hidden"
                    name="suspended"
                    value={u.suspended ? "false" : "true"}
                  />
                  <input
                    type="hidden"
                    name="reason"
                    value={
                      u.suspended
                        ? "admin unsuspend from /users"
                        : "admin suspend from /users"
                    }
                  />
                  <button
                    type="submit"
                    className="rounded-dm border border-dm-line px-2 py-1 text-xs font-semibold"
                  >
                    {u.suspended ? t("admin.unsuspend") : t("admin.suspend")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
