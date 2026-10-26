export type FeatureFlagName =
  | "ff_matching"
  | "ff_chat"
  | "ff_media_upload"
  | "ff_concierge"
  | "ff_discovery"
  | "ff_premium"
  | "ff_billing"
  | "ff_lifestyle"
  | "ff_ai";

export type FlagMap = Record<FeatureFlagName, boolean>;

export const defaultFlags: FlagMap = {
  ff_matching: true,
  ff_chat: true,
  ff_media_upload: true,
  ff_concierge: true,
  ff_discovery: true,
  ff_premium: true,
  ff_billing: true,
  ff_lifestyle: true,
  ff_ai: true,
};

export function isEnabled(flags: FlagMap, name: FeatureFlagName): boolean {
  return Boolean(flags[name]);
}
