import { defaultFlags, type FlagMap, type FeatureFlagName } from "@deepmatch/shared";

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
  };
}

export function flagEnabled(name: FeatureFlagName): boolean {
  return envFlags()[name];
}
