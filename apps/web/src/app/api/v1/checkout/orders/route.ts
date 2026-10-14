import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { COMPANION_PACKAGES } from "@/lib/companion-packages";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("checkout_orders")
    .select(
      "id, sku, package_code, amount_vnd, currency, status, sandbox, price_snapshot, expires_at, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { orders: data ?? [] },
    meta: { request_id: requestId },
  });
}

export async function POST(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { package_code?: string; sku?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  const pkg = COMPANION_PACKAGES.find(
    (p) => p.code === body.package_code || p.slug === body.sku,
  );
  const sku = body.sku ?? pkg?.slug ?? "premium";
  const amount = pkg?.salePriceVnd ?? 99_000;
  const code = pkg?.code ?? "PREMIUM";
  const snapshot = {
    code,
    sale_vnd: amount,
    list_vnd: pkg?.listPriceVnd ?? amount,
    sandbox: true,
    locked_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("checkout_orders")
    .insert({
      user_id: user.id,
      sku,
      package_code: code,
      amount_vnd: amount,
      currency: "VND",
      status: "pending_payment",
      sandbox: true,
      price_snapshot: snapshot,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    .select(
      "id, sku, package_code, amount_vnd, currency, status, sandbox, price_snapshot, expires_at, created_at",
    )
    .single();
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { order: data },
    meta: { request_id: requestId },
  });
}
