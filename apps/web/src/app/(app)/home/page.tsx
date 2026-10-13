import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveHomeState } from "@/lib/home-state";
import { HomeDashboard } from "@/components/home/HomeDashboard";

function estimateProfilePct(input: {
  discovery_opt_in: boolean | null;
  fuzzy_region: string | null;
  bio: string | null;
  hasAvatar: boolean;
  homeState: string;
}): number {
  let pct = 35;
  if (input.discovery_opt_in) pct += 20;
  if (input.fuzzy_region) pct += 15;
  if (input.bio && input.bio.trim().length > 20) pct += 15;
  if (input.hasAvatar) pct += 10;
  if (input.homeState === "matched" || input.homeState === "couple") pct += 5;
  return Math.min(95, pct);
}

export default async function PersonaHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/home");

  const home = await resolveHomeState(user.id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, discovery_opt_in, fuzzy_region, bio, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.display_name?.trim() || "bạn";
  const profilePct = estimateProfilePct({
    discovery_opt_in: profile?.discovery_opt_in ?? null,
    fuzzy_region: profile?.fuzzy_region ?? null,
    bio: profile?.bio ?? null,
    hasAvatar: Boolean(profile?.avatar_path),
    homeState: home.state,
  });

  const primaryHref =
    home.redirectTo && home.redirectTo !== "/home"
      ? home.redirectTo
      : "/discover";

  return (
    <HomeDashboard
      displayName={name}
      profilePct={profilePct}
      primaryHref={primaryHref}
    />
  );
}
