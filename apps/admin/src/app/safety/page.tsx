import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { suspendTargetAction, updateReportStatusAction } from "./actions";
import { getServerTranslator } from "@/lib/i18n/server";

type ReportRow = {
  id: string;
  reason: string;
  status: string;
  reporter_id: string;
  target_user_id: string | null;
  conversation_id: string | null;
  created_at: string;
};

export default async function SafetyPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, reason, status, reporter_id, target_user_id, conversation_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const reports = (data ?? []) as ReportRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">
        Chat safety & reports
      </h1>
      <p className="mt-3 text-sm text-dm-muted">
        {t("admin.safetyIntro")}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      ) : null}

      {reports.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t("admin.safetyEmptyTitle")}
            description={t("admin.safetyEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-dm border border-dm-line bg-dm-panel p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-dm-primary">
                    {r.status} · {new Date(r.created_at).toLocaleString("vi-VN")}
                  </p>
                  <p className="mt-2 text-sm text-dm-ink">{r.reason}</p>
                  <p className="mt-2 text-xs text-dm-muted">
                    reporter {r.reporter_id.slice(0, 8)}…
                    {r.target_user_id
                      ? ` · target ${r.target_user_id.slice(0, 8)}…`
                      : ""}
                    {r.conversation_id
                      ? ` · conv ${r.conversation_id.slice(0, 8)}…`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={updateReportStatusAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    {r.status !== "triaged" ? (
                      <button
                        type="submit"
                        name="status"
                        value="triaged"
                        className="rounded-dm border border-dm-line px-3 py-1.5 text-xs font-semibold"
                      >
                        Triage
                      </button>
                    ) : null}
                    {r.status !== "resolved" ? (
                      <button
                        type="submit"
                        name="status"
                        value="resolved"
                        className="rounded-dm bg-dm-primary px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Resolve
                      </button>
                    ) : null}
                  </form>
                  {r.target_user_id ? (
                    <form action={suspendTargetAction}>
                      <input type="hidden" name="user_id" value={r.target_user_id} />
                      <input type="hidden" name="report_id" value={r.id} />
                      <input type="hidden" name="reason" value={r.reason} />
                      <button
                        type="submit"
                        className="rounded-dm border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800"
                      >
                        Suspend target
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
