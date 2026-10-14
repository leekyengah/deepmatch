import { cache } from "react";
import {
  defaultFlags,
  type FlagMap,
  type FeatureFlagName,
} from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/route";

export function envFlags(): FlagMap {
  const read = (name: string, fallback: boolean) => {
    const v = process.env[name];
    if (v === undefined) return fallback;
    return v === "true" || v === "1";
  };
  return {
    ff_matching: read("FF_MATCHING", defaultFlags.ff_matching),
    ff_chat: read("FF_CHAT", defaultFlags.ff_chat),
    ff_media_upload: read("FF_MEDIA_UPLOAD", defaultFlags.ff_media_upload),
    ff_concierge: read("FF_CONCIERGE", defaultFlags.ff_concierge),
    ff_discovery: read("FF_DISCOVERY", defaultFlags.ff_discovery),
    ff_premium: read("FF_PREMIUM", defaultFlags.ff_premium),
    ff_billing: read("FF_BILLING", defaultFlags.ff_billing),
    ff_lifestyle: read("FF_LIFESTYLE", defaultFlags.ff_lifestyle),
    ff_ai: read("FF_AI", defaultFlags.ff_ai),
  };
}

/**
 * DB flags win when readable. feature_flags is staff-RLS, so prefer
 * service-role read so kill switches apply for anonymous/SSR too.
 */
export const getFlags = cache(async (): Promise<FlagMap> => {
  const base = envFlags();
  try {
    let data: { name: string; enabled: boolean }[] | null = null;
    try {
      const service = createServiceClient();
      const res = await service.from("feature_flags").select("name, enabled");
      data = res.data;
    } catch {
      const supabase = await createClient();
      const res = await supabase.from("feature_flags").select("name, enabled");
      data = res.data;
    }
    if (!data?.length) return base;
    const next = { ...base };
    for (const row of data) {
      if (row.name in next) {
        next[row.name as FeatureFlagName] = Boolean(row.enabled);
      }
    }
    return next;
  } catch {
    return base;
  }
});

export async function flagEnabled(name: FeatureFlagName): Promise<boolean> {
  return (await getFlags())[name];
}
