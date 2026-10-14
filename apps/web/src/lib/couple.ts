import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type CoupleProfile = {
  id: string;
  display_name: string;
  avatar_path: string | null;
};

export type ActiveCouple = {
  id: string;
  user_a: string;
  user_b: string;
  space_title: string | null;
  cover_path: string | null;
  motto: string | null;
  started_on: string | null;
  created_at: string;
  partner: CoupleProfile;
  self: CoupleProfile;
};

export async function getActiveCoupleId(
  userId: string,
  client?: SupabaseClient,
): Promise<string | null> {
  const couple = await getActiveCouple(userId, client);
  return couple?.id ?? null;
}

export async function getActiveCouple(
  userId: string,
  client?: SupabaseClient,
): Promise<ActiveCouple | null> {
  const supabase = client ?? (await createClient());

  let pair: {
    id: string;
    user_a: string;
    user_b: string;
    created_at: string;
    space_title?: string | null;
    cover_path?: string | null;
    motto?: string | null;
    started_on?: string | null;
  } | null = null;

  const extended = await supabase
    .from("pairs")
    .select(
      "id, user_a, user_b, space_title, cover_path, motto, started_on, created_at",
    )
    .eq("status", "active")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .maybeSingle();

  if (extended.error) {
    const basic = await supabase
      .from("pairs")
      .select("id, user_a, user_b, created_at")
      .eq("status", "active")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .maybeSingle();
    pair = basic.data;
  } else {
    pair = extended.data;
  }

  if (!pair) return null;

  const partnerId = pair.user_a === userId ? pair.user_b : pair.user_a;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_path")
    .in("id", [userId, partnerId]);

  const self =
    profiles?.find((p) => p.id === userId) ??
    ({ id: userId, display_name: "Bạn", avatar_path: null } as CoupleProfile);
  const partner =
    profiles?.find((p) => p.id === partnerId) ??
    ({
      id: partnerId,
      display_name: "Đối tác",
      avatar_path: null,
    } as CoupleProfile);

  return {
    id: pair.id,
    user_a: pair.user_a,
    user_b: pair.user_b,
    space_title: pair.space_title ?? null,
    cover_path: pair.cover_path ?? null,
    motto: pair.motto ?? null,
    started_on: pair.started_on ?? null,
    created_at: pair.created_at,
    partner,
    self,
  };
}

/** Days together from started_on (UTC date), or null if unset / future. */
export function daysTogether(startedOn: string | null | undefined): number | null {
  if (!startedOn) return null;
  const start = new Date(`${startedOn}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const startUtc = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const days = Math.floor((todayUtc - startUtc) / 86_400_000);
  if (days < 0) return null;
  return days;
}

export function coupleDisplayName(couple: ActiveCouple): string {
  if (couple.space_title?.trim()) return couple.space_title.trim();
  return `${couple.self.display_name} & ${couple.partner.display_name}`;
}
