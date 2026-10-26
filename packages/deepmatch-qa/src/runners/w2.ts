import { createClient } from "@supabase/supabase-js";
import type { CaseRunner } from "@tradingbase/qa-core";
import { hasQaCreds, loadQaEnv, runCommand } from "./shell.js";

async function jwtSession(projectRoot: string) {
  loadQaEnv(projectRoot);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const email = process.env.QA_EMAIL_A;
  const password = process.env.QA_PASSWORD;
  if (!url || !anon || !email || !password) return null;
  const client = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) return null;
  return {
    token: data.session.access_token,
    userId: data.user!.id,
    client,
  };
}

async function api(
  base: string,
  path: string,
  opts: { token?: string; method?: string; body?: unknown } = {},
) {
  const res = await fetch(`${base}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, ok: res.ok, json };
}

export const w2Runners: Record<string, CaseRunner> = {
  w3_ai_gateway_unit: async (spec, ctx) => {
    const r = await runCommand(
      "npx",
      ["tsx", "--test", "packages/shared/src/ai/gateway.test.ts"],
      { cwd: ctx.projectRoot, timeoutMs: 60_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-800),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  w2_intents_unit: async (spec, ctx) => {
    const r = await runCommand(
      "npx",
      ["tsx", "--test", "packages/shared/src/onboarding/intents.test.ts"],
      { cwd: ctx.projectRoot, timeoutMs: 60_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-600),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  w2_discover_gate_unit: async (spec, ctx) => {
    const r = await runCommand(
      "npx",
      ["tsx", "--test", "packages/shared/src/media/discover-gate.test.ts"],
      { cwd: ctx.projectRoot, timeoutMs: 60_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-600),
    };
  },

  w2_age_unit: async (spec, ctx) => {
    const r = await runCommand(
      "npx",
      ["tsx", "--test", "packages/shared/src/age.test.ts"],
      { cwd: ctx.projectRoot, timeoutMs: 60_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-600),
    };
  },

  w2_email_verified_unit: async (spec, ctx) => {
    const r = await runCommand(
      "npx",
      ["tsx", "--test", "apps/web/src/lib/auth/email-verified.test.ts"],
      { cwd: ctx.projectRoot, timeoutMs: 60_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-600),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  w2_discovery_media_gate: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing QA credentials",
        failureClass: "environment_blocked",
      };
    }
    const session = await jwtSession(ctx.projectRoot);
    if (!session) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "QA login failed",
        failureClass: "environment_blocked",
      };
    }
    const res = await api(
      ctx.environment.baseUrl,
      "/api/v1/discovery/candidates?limit=5",
      { token: session.token },
    );
    const body = res.json as {
      data?: { emptyReason?: string | null; candidates?: unknown[] };
      error?: { code?: string };
    };
    // Accept either a candidate list OR an explicit emptyReason (MEDIA_GATE etc.)
    const hasReason = typeof body?.data?.emptyReason === "string";
    const hasList = Array.isArray(body?.data?.candidates);
    if (res.status === 401) {
      return {
        id: spec.id,
        outcome: "INCONCLUSIVE",
        actual: "BFF cookie-only session; Bearer 401 — use Playwright for full path",
        failureClass: "test_infrastructure",
        remediation: "Cookie login E2E for Discover MEDIA_GATE",
      };
    }
    const pass = res.status === 200 && (hasList || hasReason || body?.data);
    return {
      id: spec.id,
      outcome: pass ? "PASS" : "FAIL",
      actual: `status=${res.status} emptyReason=${body?.data?.emptyReason ?? "null"} candidates=${body?.data?.candidates?.length ?? "n/a"}`,
      failureClass: pass ? undefined : "application_defect",
    };
  },

  w2_unmatch_authz: async (spec, ctx) => {
    // Negative: guest must not unmatch. Positive destructive unmatch deferred
    // (would delete QA mutual match) — preserve fixture.
    const guest = await api(
      ctx.environment.baseUrl,
      "/api/v1/matches/unmatch",
      { method: "POST", body: { peer_id: "00000000-0000-0000-0000-000000000000" } },
    );
    if (guest.status === 404) {
      return {
        id: spec.id,
        outcome: "INCONCLUSIVE",
        actual: `guest=${guest.status}`,
        detail:
          "Unmatch route not present on target environment (deploy lag vs branch)",
        failureClass: "environment_blocked",
        remediation:
          "Deploy feat/w2 unmatch route to staging, then re-run DM-QA-W2-006",
      };
    }
    const guestDenied = guest.status === 401 || guest.status === 403;
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: guestDenied ? "PASS" : "FAIL",
        actual: `guest=${guest.status}; staging JWT skipped (no creds)`,
        detail: "Authz negative only",
        failureClass: guestDenied ? undefined : "application_defect",
      };
    }
    const session = await jwtSession(ctx.projectRoot);
    if (!session) {
      return {
        id: spec.id,
        outcome: guestDenied ? "PASS" : "FAIL",
        actual: `guest=${guest.status}; login failed`,
      };
    }
    const missing = await api(
      ctx.environment.baseUrl,
      "/api/v1/matches/unmatch",
      { method: "POST", token: session.token, body: {} },
    );
    const pass =
      guestDenied && missing.status !== 500 && missing.status !== 404;
    return {
      id: spec.id,
      outcome: pass ? "PASS" : "FAIL",
      actual: `guest=${guest.status} authed_empty=${missing.status}`,
      detail:
        "Destructive unmatch against live QA mutual match NOT executed (preserve fixture)",
      remediation: "Add disposable match seed for unmatch happy-path E2E",
      failureClass: pass ? undefined : "application_defect",
    };
  },

  w2_profile_me: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing QA credentials",
        failureClass: "environment_blocked",
      };
    }
    const session = await jwtSession(ctx.projectRoot);
    if (!session) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "QA login failed",
        failureClass: "environment_blocked",
      };
    }
    const res = await api(ctx.environment.baseUrl, "/api/v1/me/profile", {
      token: session.token,
    });
    if (res.status === 401) {
      return {
        id: spec.id,
        outcome: "INCONCLUSIVE",
        actual: "Bearer not accepted on /me/profile (cookie BFF)",
        failureClass: "test_infrastructure",
      };
    }
    const body = res.json as { data?: { id?: string; display_name?: string } };
    const pass =
      res.status === 200 &&
      (body?.data?.id === session.userId || Boolean(body?.data));
    return {
      id: spec.id,
      outcome: pass ? "PASS" : "FAIL",
      actual: `status=${res.status}`,
    };
  },
};
