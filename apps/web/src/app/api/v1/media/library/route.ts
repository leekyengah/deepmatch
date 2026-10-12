import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const full = await supabase
    .from("media_objects")
    .select("id, content_type, bytes, purpose, moderation_status, created_at")
    .eq("owner_user_id", user.id)
    .is("pair_id", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows =
    full.data ??
    (
      await supabase
        .from("media_objects")
        .select("id, content_type, bytes, created_at")
        .eq("owner_user_id", user.id)
        .is("pair_id", null)
        .limit(50)
    ).data ??
    [];

  if (full.error && !rows.length) return jsonError("INTERNAL", null, requestId);

  const images = rows.filter((r) =>
    String(r.content_type || "").startsWith("image/"),
  );
  const videos = rows.filter((r) =>
    String(r.content_type || "").startsWith("video/"),
  );
  const approved = images.filter((r) => {
    const st = (r as { moderation_status?: string }).moderation_status;
    return !st || st === "approved" || st === "pending";
  });

  const approvedCount = approved.length;
  const discoverEligible = approvedCount >= 3 && approvedCount <= 10;
  const videoOk = videos.length <= 2;

  return NextResponse.json({
    data: {
      items: rows,
      counts: {
        images: images.length,
        videos: videos.length,
        approved_or_pending: approvedCount,
      },
      gate: {
        min_images: 3,
        max_images: 10,
        max_videos: 2,
        discover_eligible: discoverEligible && videoOk,
        reasons: [
          ...(approvedCount < 3 ? ["need_min_3_images"] : []),
          ...(approvedCount > 10 ? ["over_max_10_images"] : []),
          ...(!videoOk ? ["over_max_2_videos"] : []),
        ],
      },
    },
    meta: { request_id: requestId },
  });
}
