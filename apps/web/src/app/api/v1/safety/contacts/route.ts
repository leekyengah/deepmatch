import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api-error";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");

  const { data, error } = await supabase
    .from("safety_trusted_contacts")
    .select("id, display_name, channel, contact_value, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return jsonError("INTERNAL", error.message);
  return NextResponse.json({ ok: true, contacts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");

  let body: { display_name?: string; channel?: string; contact_value?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON");
  }
  if (!body.display_name?.trim() || !body.contact_value?.trim()) {
    return jsonError("VALIDATION_ERROR", "display_name and contact_value required");
  }

  const { data, error } = await supabase
    .from("safety_trusted_contacts")
    .insert({
      user_id: user.id,
      display_name: body.display_name.trim().slice(0, 80),
      channel: (body.channel ?? "phone").slice(0, 40),
      contact_value: body.contact_value.trim().slice(0, 120),
    })
    .select("id, display_name, channel, contact_value")
    .single();
  if (error) return jsonError("INTERNAL", error.message);
  return NextResponse.json({ ok: true, contact: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("VALIDATION_ERROR", "id required");

  const { error } = await supabase
    .from("safety_trusted_contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return jsonError("INTERNAL", error.message);
  return NextResponse.json({ ok: true });
}
