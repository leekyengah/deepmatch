import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCouple } from "@/lib/couple";
import { getServerTranslator } from "@/lib/i18n/server";
import { CoupleEmptyOnboarding } from "@/components/couple/CoupleEmptyOnboarding";
import { CoupleHero } from "@/components/couple/CoupleHero";
import { CoupleOverview } from "@/components/couple/CoupleOverview";

export default async function CoupleHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const couple = await getActiveCouple(user.id);

  if (!couple) {
    return (
      <CoupleEmptyOnboarding
        labels={{
          title: t("couple.emptyPremiumTitle"),
          body: t("couple.emptyPremiumBody"),
          benefitMemories: t("couple.benefitMemories"),
          benefitMap: t("couple.benefitMap"),
          benefitPlans: t("couple.benefitPlans"),
          inviteCta: t("couple.invitePartnerCta"),
          codeCta: t("couple.enterInviteCodeCta"),
        }}
      />
    );
  }

  const { data: pins } = await supabase
    .from("pins")
    .select("id, layer, title, note, place_label, visited_on, lat, lng, created_at")
    .eq("pair_id", couple.id)
    .order("created_at", { ascending: false });

  const latest =
    pins?.find((p) => p.layer === "visited" || p.layer === "milestone") ??
    pins?.[0] ??
    null;
  const wishes = (pins ?? []).filter((p) => p.layer === "wishlist").slice(0, 8);

  let upcoming: {
    id: string;
    title: string;
    starts_at: string;
    place_label: string | null;
    status: string;
  } | null = null;

  const datesRes = await supabase
    .from("couple_dates")
    .select("id, title, starts_at, place_label, status")
    .eq("pair_id", couple.id)
    .neq("status", "cancelled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!datesRes.error && datesRes.data) {
    upcoming = datesRes.data;
  }

  let coverUrl: string | null = null;
  if (couple.cover_path) {
    const { createSignedReadUrl } = await import("@/lib/media/storage");
    const { getStorageBackend } = await import("@/lib/media/limits");
    coverUrl = await createSignedReadUrl(
      couple.cover_path,
      getStorageBackend(),
      3600,
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CoupleHero
        couple={couple}
        coverUrl={coverUrl}
        labels={{
          daysTogether: t("couple.daysTogether"),
          setStartDate: t("couple.setStartDateCta"),
          changeCover: t("couple.changeCover"),
          onlyTwo: t("couple.onlyTwoBadge"),
          spaceHeading: t("couple.spaceHeadingPremium"),
        }}
      />
      <CoupleOverview
        latest={latest}
        upcoming={upcoming}
        wishes={wishes}
        pinCount={pins?.length ?? 0}
        labels={{
          latestTitle: t("couple.latestMoment"),
          upcomingTitle: t("couple.upcomingDate"),
          mapTitle: t("couple.ourMapCard"),
          openMap: t("couple.openMap"),
          wishTitle: t("couple.wishTogether"),
          addWish: t("couple.addWishCard"),
          noLatest: t("couple.noLatestTitle"),
          noLatestBody: t("couple.noLatestBody"),
          addMemory: t("couple.addMemoryCta"),
          noUpcoming: t("couple.noUpcoming"),
          proposeDate: t("couple.proposeDateCta"),
          confirmed: t("couple.dateConfirmed"),
          proposed: t("couple.dateProposed"),
          firstStepsTitle: t("couple.firstStepsTitle"),
          stepCover: t("couple.stepCover"),
          stepMemory: t("couple.stepMemory"),
          stepWish: t("couple.stepWish"),
        }}
      />
    </div>
  );
}
