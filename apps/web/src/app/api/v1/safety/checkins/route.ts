import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api-error";

/** Voluntary check-in window — no continuous GPS (EXT-019). */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");

  const { data, error } = await supabase
    .from("safety_checkins")
    .select(
      "id, window_ends_at, share_approx_location, note, completed_at, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return jsonError("INTERNAL", error.message);
  return NextResponse.json({
    ok: true,
    free: true,
    disclaimer:
      "Không phải dịch vụ khẩn cấp. Không theo dõi GPS nền. Check-in tự nguyện.",
    checkins: data ?? [],
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");

  let body: {
    minutes?: number;
    share_approx_location?: boolean;
    note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON");
  }

  const minutes = Math.min(Math.max(Number(body.minutes ?? 120) || 120, 15), 720);
  const ends = new Date(Date.now() + minutes * 60_000).toISOString();

  const { data, error } = await supabase
    .from("safety_checkins")
    .insert({
      user_id: user.id,
      window_ends_at: ends,
      share_approx_location: Boolean(body.share_approx_location),
      note: body.note?.slice(0, 300) ?? null,
    })
    .select("id, window_ends_at, share_approx_location, note")
    .single();
  if (error) return jsonError("INTERNAL", error.message);

  return NextResponse.json({
    ok: true,
    free: true,
    checkin: data,
    note: "Cửa sổ check-in đã tạo. Hết hạn tự động — không theo dõi liên tục.",
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON");
  }
  if (!body.id) return jsonError("VALIDATION_ERROR", "id required");

  const { data, error } = await supabase
    .from("safety_checkins")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id, completed_at")
    .maybeSingle();
  if (error) return jsonError("INTERNAL", error.message);
  if (!data) return jsonError("VALIDATION_ERROR", "Not found");
  return NextResponse.json({ ok: true, checkin: data });
}
