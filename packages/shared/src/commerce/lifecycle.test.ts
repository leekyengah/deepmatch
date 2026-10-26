import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertSandboxOnly,
  classifyCommerceProduct,
  isIdempotentNoop,
  transitionBooking,
  transitionOrder,
} from "./lifecycle";

describe("transitionBooking", () => {
  it("allows user cancel from requested", () => {
    const r = transitionBooking("requested", "cancel", "user");
    assert.deepEqual(r, {
      ok: true,
      to: "cancelled",
      auditEvent: "booking.cancelled",
    });
  });

  it("blocks user assign", () => {
    const r = transitionBooking("requested", "assign", "user");
    assert.equal(r.ok, false);
  });

  it("allows sandbox refund approve from refund_requested", () => {
    const r = transitionBooking(
      "refund_requested",
      "approve_sandbox_refund",
      "staff",
    );
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.to, "refunded_sandbox");
  });

  it("rejects cancel from completed", () => {
    assert.equal(transitionBooking("completed", "cancel", "user").ok, false);
  });
});

describe("transitionOrder", () => {
  it("allows cancel from draft", () => {
    const r = transitionOrder("draft", "cancel", "user");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.to, "cancelled");
  });

  it("allows request_refund from paid", () => {
    const r = transitionOrder("paid", "request_refund", "user");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.to, "refund_requested");
  });

  it("allows user sandbox_succeed in sandbox simulator", () => {
    assert.equal(
      transitionOrder("processing", "sandbox_succeed", "user").ok,
      true,
    );
  });

  it("idempotent noop when already cancelled", () => {
    assert.equal(isIdempotentNoop("cancelled", "cancel", "order"), true);
  });
});

describe("classifyCommerceProduct", () => {
  it("marks premium as digital", () => {
    assert.equal(
      classifyCommerceProduct({ packageCode: "premium_monthly" }),
      "digital_entitlement",
    );
  });

  it("marks companion booking as offline", () => {
    assert.equal(
      classifyCommerceProduct({ sku: "companion_session" }),
      "offline_service",
    );
  });
});

describe("assertSandboxOnly", () => {
  it("throws on LIVE", () => {
    assert.throws(() => assertSandboxOnly(true), /LIVE_PSP_FORBIDDEN/);
  });
});
