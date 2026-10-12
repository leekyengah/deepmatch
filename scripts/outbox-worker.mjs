/**
 * Minimal outbox worker for staging/ops.
 *   node --env-file=.env.local scripts/outbox-worker.mjs
 * Uses service role; never expose in browser.
 */
import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Resolve shared TS via dynamic import of built logic duplicated inline for Node ESM simplicity
const MAX_ATTEMPTS = 5;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const handlers = {
  async "match.mutual"(event) {
    console.log("[handler] match.mutual", event.event_id, event.payload);
    return "ok";
  },
  async "message.sent"(event) {
    console.log("[handler] message.sent", event.event_id, event.payload);
    return "ok";
  },
  async "report.opened"(event) {
    console.log("[handler] report.opened", event.event_id, event.payload);
    return "ok";
  },
};

async function claimPending(limit) {
  const { data, error } = await admin
    .from("outbox_events")
    .select("id, event_id, event_type, payload, status, attempts")
    .eq("status", "pending")
    .lte("available_at", new Date().toISOString())
    .order("available_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  const rows = data ?? [];
  for (const row of rows) {
    await admin
      .from("outbox_events")
      .update({ status: "processing" })
      .eq("id", row.id)
      .eq("status", "pending");
  }
  return rows;
}

async function run() {
  const batch = await claimPending(20);
  let processed = 0;
  let dead = 0;
  let failed = 0;

  for (const event of batch) {
    const handler = handlers[event.event_type];
    if (!handler) {
      await admin
        .from("outbox_events")
        .update({
          status: "dead_letter",
          last_error: `no_handler:${event.event_type}`,
          processed_at: new Date().toISOString(),
        })
        .eq("id", event.id);
      dead += 1;
      continue;
    }
    try {
      const result = await handler(event);
      if (result === "ok") {
        await admin
          .from("outbox_events")
          .update({
            status: "processed",
            processed_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("id", event.id);
        processed += 1;
      } else if (event.attempts + 1 >= MAX_ATTEMPTS) {
        await admin
          .from("outbox_events")
          .update({
            status: "dead_letter",
            attempts: event.attempts + 1,
            last_error: "max_attempts",
            processed_at: new Date().toISOString(),
          })
          .eq("id", event.id);
        dead += 1;
      } else {
        await admin
          .from("outbox_events")
          .update({
            status: "pending",
            attempts: event.attempts + 1,
            last_error: "retry",
            available_at: new Date(Date.now() + 30_000).toISOString(),
          })
          .eq("id", event.id);
        failed += 1;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      await admin
        .from("outbox_events")
        .update({
          status: event.attempts + 1 >= MAX_ATTEMPTS ? "dead_letter" : "pending",
          attempts: event.attempts + 1,
          last_error: msg,
          available_at: new Date(Date.now() + 30_000).toISOString(),
        })
        .eq("id", event.id);
      if (event.attempts + 1 >= MAX_ATTEMPTS) dead += 1;
      else failed += 1;
    }
  }

  console.log(JSON.stringify({ claimed: batch.length, processed, failed, dead }));
}

await run();
