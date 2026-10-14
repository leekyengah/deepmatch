import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "./server";

/**
 * Route-handler client: Bearer JWT (mobile) first, cookie session (web) fallback.
 * Bearer path sets Authorization so PostgREST RLS sees the user.
 */
export async function createRouteClient(req: Request): Promise<SupabaseClient> {
  const header = req.headers.get("authorization");
  const token = header?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (token && url && key) {
    return createSupabaseJs(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createCookieClient();
}

export async function getRouteUser(
  req: Request,
): Promise<{ supabase: SupabaseClient; user: User | null }> {
  const supabase = await createRouteClient(req);
  const header = req.headers.get("authorization");
  const token = header?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (token) {
    const { data } = await supabase.auth.getUser(token);
    return { supabase, user: data.user };
  }
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or URL");
  }
  return createSupabaseJs(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
