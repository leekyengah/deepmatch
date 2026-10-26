import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { assignBookingAction } from "./actions";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AdminServicesPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookings, error } = await supabase
    .from("service_bookings")
    .select(
      "id, status, requester_id, advisor_id, created_at, offering_id, service_offerings(title)",
    )
    .in("status", ["requested", "assigned"])
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: advisors } = await supabase
    .from("admin_roles")
    .select("user_id, role")
    .in("role", ["owner", "admin", "advisor", "support"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">
        {t("admin.servicesFull")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.servicesIntro")}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      ) : null}

      {!bookings?.length ? (
        <div className="mt-8">
          <EmptyState
            title={t("admin.servicesEmptyTitle")}
            description={t("admin.servicesEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {bookings.map((b) => {
            const offering = Array.isArray(b.service_offerings)
              ? b.service_offerings[0]
              : b.service_offerings;
            const title =
              (offering as { title?: string } | null)?.title ?? t("booking.serviceDefault");
            return (
              <li
                key={b.id}
                className="rounded-dm border border-dm-line bg-dm-panel p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-dm-primary">
                  {b.status} · {new Date(b.created_at).toLocaleString("vi-VN")}
                </p>
                <p className="mt-1 font-semibold text-dm-raspberry">{title}</p>
                <p className="mt-1 text-xs text-dm-muted">
                  requester {b.requester_id.slice(0, 8)}…
                  {b.advisor_id
                    ? ` · advisor ${b.advisor_id.slice(0, 8)}…`
                    : t("admin.unassigned")}
                </p>
                {b.status === "requested" ? (
                  <form
                    action={assignBookingAction}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="booking_id" value={b.id} />
                    <label className="text-xs">
                      Advisor
                      <select
                        name="advisor_id"
                        required
                        defaultValue={user?.id ?? ""}
                        className="mt-1 block rounded-dm border border-dm-line bg-white px-2 py-1.5 text-sm"
                      >
                        <option value="" disabled>
                          {t("admin.choose")}
                        </option>
                        {(advisors ?? []).map((a) => (
                          <option key={a.user_id} value={a.user_id}>
                            {a.role} · {a.user_id.slice(0, 8)}…
                            {a.user_id === user?.id ? t("admin.you") : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="rounded-dm bg-dm-primary px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Assign
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
