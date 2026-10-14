import { supabase } from "./supabase";

/** Client-side staff probe — every admin action must still be enforced by API/RLS. */
export async function fetchIsStaff(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return false;
  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return (
    data?.role === "owner" ||
    data?.role === "admin" ||
    data?.role === "moderator" ||
    data?.role === "advisor"
  );
}
