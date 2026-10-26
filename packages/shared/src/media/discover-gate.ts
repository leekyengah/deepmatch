export type DiscoverMediaGateInput = {
  approvedOrPendingImages: number;
  videoCount: number;
  minImages?: number;
  maxImages?: number;
  maxVideos?: number;
};

export type DiscoverMediaGateResult = {
  discoverEligible: boolean;
  reasons: string[];
};

/** Same rules as GET /api/v1/media/library gate (W2 media discover block). */
export function evaluateDiscoverMediaGate(
  input: DiscoverMediaGateInput,
): DiscoverMediaGateResult {
  const minImages = input.minImages ?? 3;
  const maxImages = input.maxImages ?? 10;
  const maxVideos = input.maxVideos ?? 2;
  const n = input.approvedOrPendingImages;
  const reasons: string[] = [];
  if (n < minImages) reasons.push("need_min_3_images");
  if (n > maxImages) reasons.push("over_max_10_images");
  if (input.videoCount > maxVideos) reasons.push("over_max_2_videos");
  return {
    discoverEligible: reasons.length === 0,
    reasons,
  };
}
