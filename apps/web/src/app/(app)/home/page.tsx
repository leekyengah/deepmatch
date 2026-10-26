import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveHomeState } from "@/lib/home-state";
import {
  HomeDashboard,
  type HomeLiveSuggest,
} from "@/components/home/HomeDashboard";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend } from "@/lib/media/limits";
import { headers } from "next/headers";

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

function ageYears(birthDateIso: string | null | undefined): number | null {
  if (!birthDateIso) return null;
  const birth = new Date(birthDateIso);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  return (
    now.getFullYear() -
    birth.getFullYear() -
    (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
      ? 1
      : 0)
  );
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

  const [{ count: matchCount }, { count: likeCount }] = await Promise.all([
    supabase
      .from("mutual_matches")
      .select("id", { count: "exact", head: true })
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase
      .from("likes")
      .select("target_id", { count: "exact", head: true })
      .eq("actor_id", user.id)
      .eq("action", "like"),
  ]);

  // Best-effort unread via conversations of mutual matches (capped).
  let unreadCount = 0;
  const { data: matches } = await supabase
    .from("mutual_matches")
    .select("id, conversations(id)")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .limit(20);
  for (const m of matches ?? []) {
    const conv = Array.isArray(m.conversations)
      ? m.conversations[0]
      : m.conversations;
    const cid = (conv as { id?: string } | null)?.id;
    if (!cid) continue;
    const { data: read } = await supabase
      .from("conversation_reads")
      .select("last_read_at")
      .eq("conversation_id", cid)
      .eq("user_id", user.id)
      .maybeSingle();
    let q = supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", cid)
      .neq("sender_id", user.id);
    if (read?.last_read_at) q = q.gt("created_at", read.last_read_at);
    const { count } = await q;
    unreadCount += count ?? 0;
  }

  const suggests: HomeLiveSuggest[] = [];
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) {
      const cookie = h.get("cookie") ?? "";
      const res = await fetch(
        `${proto}://${host}/api/v1/discovery/candidates?page_size=3`,
        {
          headers: { cookie },
          cache: "no-store",
        },
      );
      if (res.ok) {
        const json = (await res.json()) as {
          data?: {
            candidates?: Array<{
              userId: string;
              displayName: string;
              age: number | null;
              fuzzyRegion: string;
              interests: string[];
              bio: string | null;
              avatarUrl: string | null;
              score: number;
            }>;
          };
        };
        for (const c of json.data?.candidates ?? []) {
          suggests.push({
            id: c.userId,
            name: c.displayName,
            age: c.age,
            city: c.fuzzyRegion,
            matchPct: Math.round(c.score),
            interests: c.interests?.slice(0, 3) ?? [],
            bio: c.bio,
            photo: c.avatarUrl,
          });
        }
      }
    }
  } catch {
    /* fall back to DEMO fixtures in UI */
  }

  // If internal fetch unavailable, try direct pool sample with avatars.
  if (suggests.length === 0 && profile?.discovery_opt_in) {
    const backend = getStorageBackend();
    const { data: pool } = await supabase
      .from("profiles")
      .select("id, display_name, birth_date, fuzzy_region, avatar_path, bio")
      .eq("discovery_opt_in", true)
      .eq("hidden_from_discovery", false)
      .neq("id", user.id)
      .limit(3);
    for (const p of pool ?? []) {
      let photo: string | null = null;
      if (p.avatar_path) {
        try {
          photo = await createSignedReadUrl(p.avatar_path, backend, 600);
        } catch {
          photo = null;
        }
      }
      suggests.push({
        id: p.id,
        name: p.display_name,
        age: ageYears(p.birth_date),
        city: p.fuzzy_region ?? "",
        matchPct: null,
        interests: [],
        bio: p.bio,
        photo,
      });
    }
  }

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
      matchCount={matchCount ?? 0}
      inviteCount={likeCount ?? 0}
      unreadCount={unreadCount}
      suggests={suggests}
    />
  );
}
