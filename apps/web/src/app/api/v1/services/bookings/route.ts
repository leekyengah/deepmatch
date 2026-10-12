import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";
import {
  COMPANION_PACKAGES,
  offeringTitleForDb,
  type CompanionPackage,
} from "@/lib/companion-packages";

export async function GET() {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("service_bookings")
    .select(
      "id, offering_id, pair_id, advisor_id, status, created_at, meta, service_offerings(title, description)",
    )
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    const retry = await supabase
      .from("service_bookings")
      .select(
        "id, offering_id, pair_id, advisor_id, status, created_at, service_offerings(title, description)",
      )
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });
    if (retry.error) return jsonError("VALIDATION_ERROR", null, requestId);
    return NextResponse.json({
      data: {
        bookings: (retry.data ?? []).map((row) => mapBooking(row)),
      },
      meta: { request_id: requestId },
    });
  }

  return NextResponse.json({
    data: { bookings: (data ?? []).map((row) => mapBooking(row)) },
    meta: { request_id: requestId },
  });
}

function mapBooking(row: {
  id: string;
  offering_id: string;
  pair_id: string | null;
  advisor_id: string | null;
  status: string;
  created_at: string;
  meta?: unknown;
  service_offerings?:
    | { title?: string | null; description?: string | null }
    | Array<{ title?: string | null; description?: string | null }>
    | null;
}) {
  const offering = Array.isArray(row.service_offerings)
    ? row.service_offerings[0]
    : row.service_offerings;
  return {
    id: row.id,
    offering_id: row.offering_id,
    pair_id: row.pair_id,
    advisor_id: row.advisor_id,
    status: row.status,
    created_at: row.created_at,
    title: offering?.title ?? null,
    description: offering?.description ?? null,
    meta: row.meta ?? null,
  };
}

export async function POST(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as {
    offering_id?: string;
    package_code?: string;
    package_slug?: string;
    pair_id?: string | null;
    note?: string;
  };

  let offeringId = body.offering_id ?? null;
  let pkg: CompanionPackage | undefined;

  if (!offeringId && (body.package_code || body.package_slug)) {
    pkg = COMPANION_PACKAGES.find(
      (p) => p.code === body.package_code || p.slug === body.package_slug,
    );
    if (!pkg) {
      return jsonError("VALIDATION_ERROR", "offeringUnavailable", requestId);
    }
    const title = offeringTitleForDb(pkg);
    const { data: existing } = await supabase
      .from("service_offerings")
      .select("id, active")
      .eq("title", title)
      .eq("active", true)
      .maybeSingle();
    if (!existing?.id) {
      return jsonError("VALIDATION_ERROR", "offeringUnavailable", requestId);
    }
    offeringId = existing.id;
  } else if (body.package_code || body.package_slug) {
    pkg = COMPANION_PACKAGES.find(
      (p) => p.code === body.package_code || p.slug === body.package_slug,
    );
  }

  if (!offeringId) {
    return jsonError("VALIDATION_ERROR", "missingOfferingId", requestId);
  }

  const { data: offering } = await supabase
    .from("service_offerings")
    .select("id, active")
    .eq("id", offeringId)
    .eq("active", true)
    .maybeSingle();
  if (!offering) {
    return jsonError("VALIDATION_ERROR", "offeringUnavailable", requestId);
  }

  if (body.pair_id) {
    const { data: pair } = await supabase
      .from("pairs")
      .select("id, status, user_a, user_b")
      .eq("id", body.pair_id)
      .eq("status", "active")
      .maybeSingle();
    if (!pair || (pair.user_a !== user.id && pair.user_b !== user.id)) {
      return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
    }
  }

  const meta = {
    note: body.note?.slice(0, 500) ?? null,
    price_snapshot: pkg
      ? {
          code: pkg.code,
          list_vnd: pkg.listPriceVnd,
          sale_vnd: pkg.salePriceVnd,
          currency: "VND",
          sandbox: true,
          captured_at: new Date().toISOString(),
        }
      : null,
  };

  const withMeta = await supabase
    .from("service_bookings")
    .insert({
      offering_id: offeringId,
      requester_id: user.id,
      pair_id: body.pair_id ?? null,
      status: "requested",
      meta,
    })
    .select("id, offering_id, status, created_at, meta")
    .single();

  const data =
    withMeta.data ??
    (
      await supabase
        .from("service_bookings")
        .insert({
          offering_id: offeringId,
          requester_id: user.id,
          pair_id: body.pair_id ?? null,
          status: "requested",
        })
        .select("id, offering_id, status, created_at")
        .single()
    ).data;

  if (!data) return jsonError("VALIDATION_ERROR", null, requestId);

  await supabase.rpc("enqueue_outbox", {
    p_event_id: `booking.requested:${data.id}`,
    p_event_type: "booking.requested",
    p_payload: {
      booking_id: data.id,
      offering_id: data.offering_id,
      requester_id: user.id,
      note: body.note?.slice(0, 500) ?? null,
      price_snapshot: meta.price_snapshot,
    },
  });

  return NextResponse.json({
    data: { booking: data },
    meta: { request_id: requestId },
  });
}

export async function PATCH(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.id || body.action !== "cancel") {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
  }

  const { data, error } = await supabase
    .from("service_bookings")
    .update({ status: "cancelled" })
    .eq("id", body.id)
    .eq("requester_id", user.id)
    .in("status", ["requested", "assigned"])
    .select("id, status")
    .maybeSingle();

  if (error || !data) {
    return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
  }
  return NextResponse.json({
    data: { booking: data },
    meta: { request_id: requestId },
  });
}
