/**
 * Staging sandbox commerce E2E — cancel/refund, negatives, LIVE deny.
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, QA tokens (.ai/qa.env.ps1).
 * Refuses non-staging Supabase refs. Never charges LIVE PSP.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASE = (
  process.env.QA_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://datingvn.com"
).replace(/\/$/, "");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const live = process.env.SERVICES_PAYMENT_LIVE === "true";
const STAGING_REF = "zzqpvjdyvjarpphqhaze";
const PROD_REF = "iofrimcbvqrhefqkkyrx";

function loadQaEnv() {
  const p = join(ROOT, ".ai", "qa.env.ps1");
  if (!existsSync(p)) return {};
  const raw = readFileSync(p, "utf8");
  const out = {};
  for (const m of raw.matchAll(/\$env:([A-Z0-9_]+)\s*=\s*'([^']*)'/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

function jwtSub(token) {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ).sub;
  } catch {
    return null;
  }
}

const qa = loadQaEnv();
const tokenA = process.env.QA_ACCESS_TOKEN_A || qa.QA_ACCESS_TOKEN_A;
const tokenB = process.env.QA_ACCESS_TOKEN_B || qa.QA_ACCESS_TOKEN_B;

const results = [];
function rec(id, ok, detail) {
  results.push({ id, ok, detail: detail ?? null });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}${detail ? ` — ${detail}` : ""}`);
}

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(2);
}
if (!url.includes(STAGING_REF) || url.includes(PROD_REF)) {
  console.error("Refusing: Supabase URL is not staging deepmatch project");
  process.exit(2);
}
rec("env.staging_project", true, STAGING_REF);
rec("env.live_psp_off", !live, live ? "SERVICES_PAYMENT_LIVE=true" : "OFF");

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

{
  const { error } = await admin.from("commerce_audit_log").select("id").limit(1);
  rec("schema.commerce_audit_log", !error, error?.message);
}
{
  const { error } = await admin.rpc("staff_transition_booking", {
    p_booking_id: "00000000-0000-0000-0000-000000000000",
    p_action: "cancel",
  });
  const msg = error?.message || "";
  rec(
    "schema.staff_transition_booking",
    /booking_not_found|forbidden/i.test(msg),
    msg || "unexpected success",
  );
}

if (!tokenA) {
  rec("auth.qa_token_a", false, "missing — run npm run seed:qa");
} else {
  rec("auth.qa_token_a", true);
  const userId = jwtSub(tokenA);

  const create = await api("/api/v1/services/bookings", {
    method: "POST",
    token: tokenA,
    body: { package_code: "CMP-01", note: "sandbox-e2e" },
  });
  const bookingId = create.json?.data?.booking?.id;
  if (!bookingId) {
    rec(
      "booking.create",
      false,
      `${create.res.status} ${JSON.stringify(create.json?.error || create.json).slice(0, 180)}`,
    );
  } else {
    rec("booking.create", true, bookingId.slice(0, 8));

    const cancel1 = await api("/api/v1/services/bookings", {
      method: "PATCH",
      token: tokenA,
      body: { id: bookingId, action: "cancel", idempotency_key: "e2e-1" },
    });
    rec(
      "booking.cancel",
      cancel1.res.ok && cancel1.json?.data?.booking?.status === "cancelled",
      cancel1.json?.data?.booking?.status || String(cancel1.res.status),
    );

    const cancel2 = await api("/api/v1/services/bookings", {
      method: "PATCH",
      token: tokenA,
      body: { id: bookingId, action: "cancel", idempotency_key: "e2e-1" },
    });
    rec(
      "booking.cancel_idempotent",
      cancel2.res.ok &&
        (cancel2.json?.data?.idempotent === true ||
          cancel2.json?.data?.booking?.status === "cancelled"),
      JSON.stringify(cancel2.json?.data).slice(0, 140),
    );

    const bad = await api("/api/v1/services/bookings", {
      method: "PATCH",
      token: tokenA,
      body: { id: bookingId, action: "request_refund" },
    });
    rec("booking.illegal_refund_from_cancelled", !bad.res.ok, String(bad.res.status));

    if (tokenB) {
      const cross = await api("/api/v1/services/bookings", {
        method: "PATCH",
        token: tokenB,
        body: { id: bookingId, action: "cancel" },
      });
      rec("booking.cross_user_deny", !cross.res.ok, String(cross.res.status));
    } else {
      rec("booking.cross_user_deny", false, "missing token B");
    }

    // Refund happy-path: seed assigned→completed booking then request_refund
    if (userId) {
      const { data: offering } = await admin
        .from("service_offerings")
        .select("id")
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (offering?.id) {
        const { data: rb, error: rbErr } = await admin
          .from("service_bookings")
          .insert({
            offering_id: offering.id,
            requester_id: userId,
            status: "completed",
          })
          .select("id")
          .single();
        if (rbErr) {
          rec("booking.seed_completed", false, rbErr.message);
        } else {
          rec("booking.seed_completed", true, rb.id.slice(0, 8));
          const rr = await api("/api/v1/services/bookings", {
            method: "PATCH",
            token: tokenA,
            body: { id: rb.id, action: "request_refund" },
          });
          rec(
            "booking.request_refund",
            rr.res.ok && rr.json?.data?.booking?.status === "refund_requested",
            rr.json?.data?.booking?.status || String(rr.res.status),
          );
        }
      }
    }
  }

  // Order create/cancel
  let orderId = null;
  const created = await api("/api/v1/checkout/orders", {
    method: "POST",
    token: tokenA,
    body: { package_code: "premium_monthly" },
  });
  orderId = created.json?.data?.order?.id ?? null;
  if (!orderId) {
    const list = await api("/api/v1/checkout/orders", { token: tokenA });
    const open = (list.json?.data?.orders || []).find((o) =>
      ["draft", "pending_payment", "method_selected", "processing"].includes(
        o.status,
      ),
    );
    orderId = open?.id ?? null;
    rec(
      "order.resolve",
      Boolean(orderId),
      orderId
        ? orderId.slice(0, 8)
        : `${created.res.status} ${JSON.stringify(created.json?.error || {}).slice(0, 120)}`,
    );
  } else {
    rec("order.create", true, orderId.slice(0, 8));
  }
  if (orderId) {
    const oc = await api(`/api/v1/checkout/orders/${orderId}`, {
      method: "PATCH",
      token: tokenA,
      body: { action: "cancel" },
    });
    rec(
      "order.cancel",
      oc.res.ok && oc.json?.data?.order?.status === "cancelled",
      oc.json?.data?.order?.status || String(oc.res.status),
    );
  }

  if (userId) {
    const ins = await admin
      .from("checkout_orders")
      .insert({
        user_id: userId,
        sku: "premium_monthly",
        package_code: "premium_monthly",
        amount_vnd: 1000,
        currency: "VND",
        status: "paid",
        price_snapshot: { sandbox: true, e2e: true, live_psp: false },
      })
      .select("id")
      .single();
    if (ins.error) {
      rec("order.seed_paid", false, ins.error.message);
    } else {
      rec("order.seed_paid", true, ins.data.id.slice(0, 8));
      const rr = await api(`/api/v1/checkout/orders/${ins.data.id}`, {
        method: "PATCH",
        token: tokenA,
        body: { action: "request_refund" },
      });
      rec(
        "order.request_refund",
        rr.res.ok && rr.json?.data?.order?.status === "refund_requested",
        rr.json?.data?.order?.status || String(rr.res.status),
      );
    }
  }

  const guest = await api("/api/v1/services/bookings", {
    method: "PATCH",
    body: {
      id: "00000000-0000-0000-0000-000000000001",
      action: "cancel",
    },
  });
  rec("auth.guest_deny", guest.res.status === 401, String(guest.res.status));
}

{
  const { count, error } = await admin
    .from("commerce_audit_log")
    .select("id", { count: "exact", head: true });
  rec(
    "audit.rows_readable",
    !error && typeof count === "number",
    error?.message || `count=${count}`,
  );
}

const pass = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok).length;
const outDir = join(ROOT, "docs/evidence/w4-commercial-2026-10-26");
mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(
  join(outDir, `SANDBOX_E2E_${stamp}.json`),
  JSON.stringify(
    {
      base: BASE,
      commit: process.env.GIT_SHA || null,
      live_psp: live,
      pass,
      fail,
      results,
    },
    null,
    2,
  ),
);
console.log(`\nSummary PASS=${pass} FAIL=${fail}`);
process.exit(fail > 0 ? 1 : 0);
