import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";

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
      "id, offering_id, pair_id, advisor_id, status, created_at, service_offerings(title, description)",
    )
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  const bookings = (data ?? []).map((row) => {
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
    };
  });

  return NextResponse.json({
    data: { bookings },
    meta: { request_id: requestId },
  });
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
    pair_id?: string | null;
    note?: string;
  };

  if (!body.offering_id) {
    return jsonError("VALIDATION_ERROR", "missingOfferingId", requestId);
  }

  const { data: offering } = await supabase
    .from("service_offerings")
    .select("id, active")
    .eq("id", body.offering_id)
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

  const { data, error } = await supabase
    .from("service_bookings")
    .insert({
      offering_id: body.offering_id,
      requester_id: user.id,
      pair_id: body.pair_id ?? null,
      status: "requested",
    })
    .select("id, offering_id, status, created_at")
    .single();

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  // Best-effort outbox — ignore failures so booking still succeeds
  await supabase.rpc("enqueue_outbox", {
    p_event_id: `booking.requested:${data.id}`,
    p_event_type: "booking.requested",
    p_payload: {
      booking_id: data.id,
      offering_id: data.offering_id,
      requester_id: user.id,
      note: body.note?.slice(0, 500) ?? null,
    },
  });

  return NextResponse.json({
    data: { booking: data },
    meta: { request_id: requestId },
  });
}
