import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  LOVE_PLACES,
  lovePlacesByCity,
  topLovePlaces,
  type LovePlace,
} from "@/lib/love-places";
import { makeRequestId } from "@/lib/api-error";

function publicDto(p: LovePlace) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    city: p.city,
    district: p.district,
    full_address: p.address,
    lat: p.lat,
    lng: p.lng,
    blurb: p.blurb,
    price_hint: p.priceHint,
    hours_hint: p.hoursHint ?? null,
    tags: p.tags ?? [],
    rating_mean: p.ratingMean,
    rating_count: p.ratingCount,
    sample: true as const,
    source: "editorial_fixture",
  };
}

export async function GET(req: Request) {
  const requestId = makeRequestId();
  const url = new URL(req.url);
  const city = url.searchParams.get("city") ?? undefined;
  const category = url.searchParams.get("category") as LovePlace["category"] | null;
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const top = url.searchParams.get("top") === "1";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0") || 0, 0);

  const supabase = await createClient();
  const { data: closedFlags } = await supabase
    .from("venue_admin_flags")
    .select("place_id")
    .eq("closed", true);
  const closedIds = new Set((closedFlags ?? []).map((f) => f.place_id));

  let list: LovePlace[] = city ? lovePlacesByCity(city) : [...LOVE_PLACES];
  list = list.filter((p) => !closedIds.has(p.id));
  if (category) list = list.filter((p) => p.category === category);
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    );
  }
  if (top && city) {
    list = topLovePlaces(city, category ?? undefined, 30).map((x) => x.place);
  }

  const total = list.length;
  const page = list.slice(offset, offset + limit).map(publicDto);

  return NextResponse.json({
    data: {
      places: page,
      total,
      offset,
      limit,
      sample: true,
    },
    meta: { request_id: requestId },
  });
}
