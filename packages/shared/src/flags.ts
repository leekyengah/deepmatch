export type FeatureFlagName =
  | "ff_matching"
  | "ff_chat"
  | "ff_media_upload"
  | "ff_concierge"
  | "ff_discovery";

export type FlagMap = Record<FeatureFlagName, boolean>;

export const defaultFlags: FlagMap = {
  ff_matching: true,
  ff_chat: true,
  ff_media_upload: true,
  ff_concierge: false,
  ff_discovery: true,
};

export function isEnabled(flags: FlagMap, name: FeatureFlagName): boolean {
  return Boolean(flags[name]);
}
