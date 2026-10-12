import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { getServerTranslator } from "@/lib/i18n/server";
import { NEEDS_QUESTION_COUNT } from "@deepmatch/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookingsClient } from "@/components/services/BookingsClient";

export default async function MyJourneyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/journey");
  const { t } = await getServerTranslator();
  const conciergeOn = await flagEnabled("ff_concierge");

  const { data: needs } = await supabase
    .from("needs_answers")
    .select("answers, consent_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: meetings } = await supabase
    .from("matchmaking_meetings")
    .select(
      "id, place_label, scheduled_at, status, proposer_consent, invitee_consent, created_at",
    )
    .or(`proposer_id.eq.${user.id},invitee_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(10);

  const answers = (needs?.answers ?? {}) as Record<string, string>;
  const answered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <Link href="/me" className="text-sm text-dm-muted underline">
        {t("needs.backMe")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("booking.journeyEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("booking.journeyTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("booking.journeyIntro")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-dm-champagne">
            {t("needs.title")}
          </p>
          <p className="font-display text-2xl font-semibold text-dm-ink">
            {answered}/{NEEDS_QUESTION_COUNT}
          </p>
          <p className="text-dm-muted">
            {needs?.consent_at
              ? t("booking.journeyNeedsConsented")
              : t("booking.journeyNeedsNoConsent")}
          </p>
          <Link href="/me/understand">
            <Button type="button" size="sm" variant="outline">
              {t("booking.journeyOpenNeeds")}
            </Button>
          </Link>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-dm-champagne">
            {t("booking.journeyPackages")}
          </p>
          <p className="text-dm-muted">{t("booking.journeyPackagesBody")}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warn">{t("booking.stickySandbox")}</Badge>
            <Link href="/services">
              <Button type="button" size="sm">
                {t("booking.viewServices")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {t("booking.journeyRequests")}
        </h2>
        <p className="mt-1 text-sm text-dm-muted">
          {t("booking.journeyRequestsHint")}
        </p>
        <div className="mt-4">
          {conciergeOn ? (
            <BookingsClient />
          ) : (
            <Card className="text-sm text-dm-muted">
              {t("booking.flagOffBodyStaging")}
            </Card>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {t("booking.meetingsTitle")}
        </h2>
        <p className="mt-1 text-sm text-dm-muted">{t("booking.meetingsIntro")}</p>
        <div className="mt-4 space-y-3">
          {!meetings?.length ? (
            <Card className="text-sm text-dm-muted">{t("booking.meetingsEmpty")}</Card>
          ) : (
            meetings.map((m) => {
              const both = m.proposer_consent && m.invitee_consent;
              return (
                <Card key={m.id} className="space-y-1 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-dm-ink">
                      {m.place_label || t("booking.datePlan")}
                    </p>
                    <Badge
                      tone={
                        m.status === "confirmed" || m.status === "completed"
                          ? "good"
                          : m.status === "withdrawn"
                            ? "warn"
                            : "default"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-dm-muted">
                    {both
                      ? t("booking.meetingsConsentBoth")
                      : m.status === "withdrawn"
                        ? t("booking.meetingsWithdrawn")
                        : t("booking.meetingsAwaiting")}
                  </p>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <p className="mt-8 text-xs text-dm-muted">{t("booking.journeyNoFake")}</p>
    </div>
  );
}
