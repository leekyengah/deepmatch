import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ModerationPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const { count: openReports } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  const { data: pendingMedia, error } = await supabase
    .from("media_objects")
    .select("id, owner_user_id, content_type, bytes, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.modTitle")}</h1>
      <p className="mt-3 text-sm text-dm-muted">
        {t("admin.modIntro", { n: openReports ?? 0 })}{" "}
        <Link href="/safety" className="underline">
          {t("admin.safetyLinkShort")}
        </Link>
        .
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      ) : null}

      {!pendingMedia?.length ? (
        <div className="mt-6">
          <EmptyState
            title={t("admin.modEmptyTitle")}
            description={t("admin.modEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {pendingMedia.map((m) => (
            <li
              key={m.id}
              className="rounded-dm border border-dm-line bg-dm-panel px-4 py-3 text-sm"
            >
              <span className="font-medium text-dm-raspberry">
                {m.content_type}
              </span>
              <span className="text-dm-muted">
                {" "}
                · {Math.round((m.bytes ?? 0) / 1024)} KB · owner{" "}
                {m.owner_user_id.slice(0, 8)}…
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
