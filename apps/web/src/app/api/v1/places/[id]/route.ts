import { NextResponse } from "next/server";
import { lovePlaceById } from "@/lib/love-places";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = makeRequestId();
  const { id } = await ctx.params;
  const place = lovePlaceById(id);
  if (!place) return jsonError("VALIDATION_ERROR", "productNotFound", requestId);

  return NextResponse.json({
    data: {
      place: {
        id: place.id,
        name: place.name,
        category: place.category,
        city: place.city,
        district: place.district,
        full_address: place.address,
        lat: place.lat,
        lng: place.lng,
        blurb: place.blurb,
        price_hint: place.priceHint,
        hours_hint: place.hoursHint ?? null,
        tags: place.tags ?? [],
        rating_mean: place.ratingMean,
        rating_count: place.ratingCount,
        reviews: (place.reviews ?? []).map((r) => ({
          id: r.id,
          rating: r.rating,
          body: r.body,
          public_author: r.authorLabel,
          created_at: r.createdAt,
        })),
        sample: true,
        source: "editorial_fixture",
      },
    },
    meta: { request_id: requestId },
  });
}
