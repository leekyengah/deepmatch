import { supabase } from "./supabase";

export async function countExact(
  table:
    | "profiles"
    | "mutual_matches"
    | "reports"
    | "service_bookings"
    | "messages"
    | "pairs",
  eq?: { col: string; val: string },
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase.from(table).select("id", { count: "exact", head: true });
  if (eq) q = q.eq(eq.col, eq.val);
  const { count, error } = await q;
  if (error) throw error;
  return (count as number | null) ?? 0;
}

export async function staffSetSuspended(userId: string, suspended: boolean, reason?: string) {
  const { error } = await supabase.rpc("staff_set_user_suspended", {
    p_user_id: userId,
    p_suspended: suspended,
    p_reason: reason ?? null,
  });
  if (error) throw error;
}
