import type { SupabaseClient, User } from "@supabase/supabase-js";

const OWNER_EMAILS = new Set(
  (process.env.ADMIN_OWNER_EMAILS ?? "leekyengah@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export async function isStaffUser(
  supabase: SupabaseClient,
  user: User | null,
): Promise<boolean> {
  if (!user) return false;
  const email = user.email?.toLowerCase() ?? "";
  if (email && OWNER_EMAILS.has(email)) return true;
  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return (
    data?.role === "owner" ||
    data?.role === "admin" ||
    data?.role === "moderator"
  );
}
