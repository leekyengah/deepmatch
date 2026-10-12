import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";

export type HomeState =
  | "guest"
  | "onboarding"
  | "dating"
  | "matched"
  | "couple"
  | "suspended";

export type HomeStateResult = {
  state: HomeState;
  redirectTo: string;
  hasMutualMatch: boolean;
  coupleId: string | null;
};

/** Server-owned home routing — never trust client role claims. */
export async function resolveHomeState(
  userId?: string | null,
): Promise<HomeStateResult> {
  if (!userId) {
    return {
      state: "guest",
      redirectTo: "/",
      hasMutualMatch: false,
      coupleId: null,
    };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, discovery_opt_in, suspended, birth_date")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.suspended) {
    return {
      state: "suspended",
      redirectTo: "/me/account",
      hasMutualMatch: false,
      coupleId: null,
    };
  }

  const coupleId = await getActiveCoupleId(userId);
  if (coupleId) {
    return {
      state: "couple",
      redirectTo: "/couple",
      hasMutualMatch: true,
      coupleId,
    };
  }

  const { count } = await supabase
    .from("mutual_matches")
    .select("id", { count: "exact", head: true })
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  const hasMutualMatch = (count ?? 0) > 0;
  if (hasMutualMatch) {
    return {
      state: "matched",
      redirectTo: "/chat",
      hasMutualMatch: true,
      coupleId: null,
    };
  }

  const onboarded = Boolean(profile?.display_name && profile?.birth_date);

  if (!onboarded) {
    return {
      state: "onboarding",
      redirectTo: "/onboarding",
      hasMutualMatch: false,
      coupleId: null,
    };
  }

  return {
    state: "dating",
    redirectTo: "/home",
    hasMutualMatch: false,
    coupleId: null,
  };
}
