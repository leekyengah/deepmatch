export type OutboxEvent = {
  id: string;
  event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "processed" | "dead_letter";
  attempts: number;
};

export type OutboxStore = {
  claimPending(limit: number): Promise<OutboxEvent[]>;
  markProcessed(id: string): Promise<void>;
  markDead(id: string, error: string): Promise<void>;
  bumpAttempt(id: string, error: string): Promise<void>;
};

export type OutboxHandler = (
  event: OutboxEvent,
) => Promise<"ok" | "retry" | "dead">;

const MAX_ATTEMPTS = 5;

/** Process a batch of claimed outbox events with handlers. */
export async function processOutboxBatch(
  store: OutboxStore,
  handlers: Record<string, OutboxHandler>,
  limit = 20,
): Promise<{ processed: number; failed: number; dead: number }> {
  const batch = await store.claimPending(limit);
  let processed = 0;
  let failed = 0;
  let dead = 0;

  for (const event of batch) {
    const handler = handlers[event.event_type];
    if (!handler) {
      await store.markDead(event.id, `no_handler:${event.event_type}`);
      dead += 1;
      continue;
    }
    try {
      const result = await handler(event);
      if (result === "ok") {
        await store.markProcessed(event.id);
        processed += 1;
      } else if (result === "dead" || event.attempts + 1 >= MAX_ATTEMPTS) {
        await store.markDead(event.id, result === "dead" ? "handler_dead" : "max_attempts");
        dead += 1;
      } else {
        await store.bumpAttempt(event.id, "handler_retry");
        failed += 1;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      if (event.attempts + 1 >= MAX_ATTEMPTS) {
        await store.markDead(event.id, msg);
        dead += 1;
      } else {
        await store.bumpAttempt(event.id, msg);
        failed += 1;
      }
    }
  }

  return { processed, failed, dead };
}
