import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { lovePlaceById } from "@/lib/love-places";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend, type StorageBackend } from "@/lib/media/limits";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: placeId } = await ctx.params;
  const place = lovePlaceById(placeId);
  if (!place) return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);

  const { supabase } = await getRouteUser(req);
  const { data: rows } = await supabase
    .from("place_reviews")
    .select(
      "id, rating, body, created_at, author_id, media_id, profiles(display_name)",
    )
    .eq("place_id", placeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const fixture = (place.reviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    author_label: r.authorLabel,
    created_at: r.createdAt,
    media_url: null as string | null,
    source: "editorial" as const,
  }));

  const live = [];
  for (const row of rows ?? []) {
    let media_url: string | null = null;
    if (row.media_id) {
      const { data: media } = await supabase
        .from("media_objects")
        .select("storage_path, storage_backend, processing_status")
        .eq("id", row.media_id)
        .maybeSingle();
      if (
        media &&
        (!media.processing_status || media.processing_status === "ready")
      ) {
        media_url = await createSignedReadUrl(
          media.storage_path,
          (media.storage_backend ?? getStorageBackend()) as StorageBackend,
          600,
        );
      }
    }
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    live.push({
      id: row.id,
      rating: row.rating,
      body: row.body,
      author_label:
        (profile as { display_name?: string } | null)?.display_name ?? "Member",
      created_at: row.created_at,
      media_url,
      source: "user" as const,
    });
  }

  return NextResponse.json({
    data: { reviews: [...live, ...fixture] },
    meta: { request_id: requestId },
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: placeId } = await ctx.params;
  if (!lovePlaceById(placeId)) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as {
    rating?: number;
    body?: string;
    media_id?: string | null;
  };
  const rating = Number(body.rating);
  const text = String(body.body ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || text.length < 1) {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  if (body.media_id) {
    const { data: media } = await supabase
      .from("media_objects")
      .select("id, owner_user_id, processing_status, purpose")
      .eq("id", body.media_id)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (
      !media ||
      (media.processing_status && media.processing_status !== "ready")
    ) {
      return jsonError("VALIDATION_ERROR", "mediaNotReady", requestId);
    }
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .upsert(
      {
        place_id: placeId,
        author_id: user.id,
        rating,
        body: text.slice(0, 2000),
        media_id: body.media_id ?? null,
        deleted_at: null,
      },
      { onConflict: "place_id,author_id" },
    )
    .select("id, rating, body, created_at, media_id")
    .single();

  if (error || !data) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  return NextResponse.json({
    data: { review: data },
    meta: { request_id: requestId },
  });
}
