import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  processOutboxBatch,
  type OutboxEvent,
  type OutboxStore,
} from "./worker";

function memoryStore(seed: OutboxEvent[]): OutboxStore & { rows: OutboxEvent[] } {
  const rows = seed.map((r) => ({ ...r }));
  return {
    rows,
    async claimPending(limit) {
      return rows
        .filter((r) => r.status === "pending")
        .slice(0, limit)
        .map((r) => {
          r.status = "processing";
          return { ...r };
        });
    },
    async markProcessed(id) {
      const row = rows.find((r) => r.id === id)!;
      row.status = "processed";
    },
    async markDead(id) {
      const row = rows.find((r) => r.id === id)!;
      row.status = "dead_letter";
    },
    async bumpAttempt(id) {
      const row = rows.find((r) => r.id === id)!;
      row.attempts += 1;
      row.status = "pending";
    },
  };
}

describe("processOutboxBatch", () => {
  it("processes known event types", async () => {
    const store = memoryStore([
      {
        id: "1",
        event_id: "e1",
        event_type: "match.mutual",
        payload: {},
        status: "pending",
        attempts: 0,
      },
    ]);
    const result = await processOutboxBatch(store, {
      "match.mutual": async () => "ok",
    });
    assert.equal(result.processed, 1);
    assert.equal(store.rows[0].status, "processed");
  });

  it("dead-letters unknown types", async () => {
    const store = memoryStore([
      {
        id: "2",
        event_id: "e2",
        event_type: "unknown.event",
        payload: {},
        status: "pending",
        attempts: 0,
      },
    ]);
    const result = await processOutboxBatch(store, {});
    assert.equal(result.dead, 1);
    assert.equal(store.rows[0].status, "dead_letter");
  });
});
