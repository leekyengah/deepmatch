import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const CADENCE = [
  { id: "C01", days: 30 },
  { id: "C05", days: 90 },
  { id: "C06", days: 90 },
] as const;

export default async function NeedsRefreshPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/understand/refresh");
  const { t } = await getServerTranslator();

  const { data } = await supabase
    .from("needs_answers")
    .select("answers, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();
  const answers = (data?.answers ?? {}) as Record<string, string>;
  const updated = data?.updated_at ? new Date(data.updated_at) : null;

  return (
    <main className="mx-auto max-w-lg pb-16">
      <Link href="/me/understand" className="text-sm text-dm-muted underline">
        {t("needs.backUnderstand")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-dm-ink">
        {t("needs.refreshTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("needs.refreshIntro")}</p>
      <ul className="mt-6 space-y-3">
        {CADENCE.map((c) => {
          const answered = Boolean(answers[c.id]?.trim());
          const due =
            !updated ||
            Date.now() - updated.getTime() > c.days * 24 * 60 * 60 * 1000;
          return (
            <li key={c.id}>
              <Card className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge>{c.id}</Badge>
                  <Badge tone={due ? "warn" : "good"}>
                    {due ? t("needs.refreshDue") : t("needs.refreshOk")}
                  </Badge>
                  <Badge>{c.days}d</Badge>
                </div>
                <p className="text-dm-muted">
                  {answered
                    ? answers[c.id]
                    : t("needs.prefSelfEmpty")}
                </p>
                <Link href="/me/understand">
                  <Button type="button" size="sm" variant="outline">
                    {t("needs.editAnswer")}
                  </Button>
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-dm-muted">{t("needs.refreshNoPenalty")}</p>
    </main>
  );
}