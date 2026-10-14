import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  LOVE_PLACES,
  lovePlacesByCity,
  topLovePlaces,
  type LovePlace,
} from "@/lib/love-places";
import { makeRequestId } from "@/lib/api-error";
import {
  budgetFitScore,
  computeDss,
  reputationFromRating,
  DSS_VERSION,
} from "@/lib/datemap/dss";

function publicDto(
  p: LovePlace,
  opts: { budgetMax?: number | null; strict?: boolean },
) {
  const B = budgetFitScore(
    opts.budgetMax,
    p.budgetCoupleMinVnd,
    p.budgetCoupleMaxVnd,
  );
  const R = reputationFromRating(p.ratingMean, p.ratingCount);
  const dss = computeDss({
    quietness: p.quietness,
    privacy: p.privacy,
    budgetFit: B,
    reputation: R,
    location: 70,
    dataConfidence: p.dataConfidence,
  });

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
    budget_couple_min_vnd: p.budgetCoupleMinVnd ?? null,
    budget_couple_max_vnd: p.budgetCoupleMaxVnd ?? null,
    quietness: p.quietness ?? null,
    privacy: p.privacy ?? null,
    outdoor: p.outdoor ?? null,
    parking: p.parking ?? null,
    photo_friendly: p.photoFriendly ?? null,
    hours_hint: p.hoursHint ?? null,
    tags: p.tags ?? [],
    rating_mean: p.ratingMean,
    rating_count: p.ratingCount,
    sample: true as const,
    source: "editorial_fixture",
    data_confidence: p.dataConfidence ?? null,
    dss: {
      version: DSS_VERSION,
      match_class: dss.matchClass,
      score: dss.score,
      confidence: dss.confidence,
      reasons: dss.reasons,
    },
  };
}

export async function GET(req: Request) {
  const requestId = makeRequestId();
  const url = new URL(req.url);
  const city = url.searchParams.get("city") ?? undefined;
  const category = url.searchParams.get("category") as LovePlace["category"] | null;
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const top = url.searchParams.get("top") === "1";
  const outdoor = url.searchParams.get("outdoor");
  const parking = url.searchParams.get("parking");
  const photo = url.searchParams.get("photo");
  const sort = url.searchParams.get("sort") ?? "match";
  const budgetMax = url.searchParams.get("budgetMax")
    ? Number(url.searchParams.get("budgetMax"))
    : 500_000;
  const strict = url.searchParams.get("strict") === "1";
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
        p.city.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (outdoor === "1") list = list.filter((p) => p.outdoor === true);
  if (parking === "1") list = list.filter((p) => p.parking === true);
  if (photo === "1") list = list.filter((p) => p.photoFriendly === true);

  if (strict && Number.isFinite(budgetMax)) {
    list = list.filter((p) => {
      if (p.budgetCoupleMaxVnd == null) return false;
      return p.budgetCoupleMinVnd != null && p.budgetCoupleMinVnd <= budgetMax;
    });
  }

  if (top && city) {
    list = topLovePlaces(city, category ?? undefined, 30).map((x) => x.place);
  }

  const dtos = list.map((p) =>
    publicDto(p, {
      budgetMax: Number.isFinite(budgetMax) ? budgetMax : null,
      strict,
    }),
  );

  dtos.sort((a, b) => {
    if (sort === "rating") {
      return (b.rating_mean ?? 0) - (a.rating_mean ?? 0);
    }
    if (sort === "price") {
      return (a.budget_couple_min_vnd ?? 9e9) - (b.budget_couple_min_vnd ?? 9e9);
    }
    const as = a.dss.score ?? -1;
    const bs = b.dss.score ?? -1;
    if (bs !== as) return bs - as;
    return (b.dss.confidence ?? 0) - (a.dss.confidence ?? 0);
  });

  const total = dtos.length;
  const page = dtos.slice(offset, offset + limit);

  return NextResponse.json({
    data: {
      places: page,
      total,
      offset,
      limit,
      sample: true,
      catalog_disclaimer:
        "editorial_fixture — not a verified production venue master",
      dss_version: DSS_VERSION,
      defaults: {
        city: "Hà Nội",
        category: "cafe",
        budget_max_vnd: 500_000,
        sort: "match",
      },
    },
    meta: { request_id: requestId },
  });
}
