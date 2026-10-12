import { createClient } from "@/lib/supabase/server";

export async function getActiveCoupleId(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pairs")
    .select("id")
    .eq("status", "active")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .maybeSingle();
  return data?.id ?? null;
}
