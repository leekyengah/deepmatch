/**
 * Sandbox commerce lifecycle — booking + checkout order transitions.
 * LIVE PSP refunds are never performed here.
 */

export type BookingStatus =
  | "requested"
  | "assigned"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded_sandbox";

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "method_selected"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refund_requested"
  | "refunded_sandbox";

export type CommerceActor = "user" | "staff" | "system";

export type ProductKind = "digital_entitlement" | "offline_service" | "hybrid";

export type TransitionResult =
  | { ok: true; to: string; auditEvent: string }
  | { ok: false; reason: string };

const BOOKING_TRANSITIONS: Record<
  string,
  Partial<Record<string, { actors: CommerceActor[]; event: string }>>
> = {
  requested: {
    assigned: { actors: ["staff", "system"], event: "booking.assigned" },
    cancelled: { actors: ["user", "staff"], event: "booking.cancelled" },
  },
  assigned: {
    completed: { actors: ["staff", "system"], event: "booking.completed" },
    cancelled: { actors: ["user", "staff"], event: "booking.cancelled" },
    refund_requested: {
      actors: ["user", "staff"],
      event: "booking.refund_requested",
    },
  },
  completed: {
    refund_requested: {
      actors: ["user", "staff"],
      event: "booking.refund_requested",
    },
  },
  refund_requested: {
    refunded_sandbox: {
      actors: ["staff", "system"],
      event: "booking.refunded_sandbox",
    },
    cancelled: { actors: ["staff"], event: "booking.refund_denied" },
  },
};

const ORDER_TRANSITIONS: Record<
  string,
  Partial<Record<string, { actors: CommerceActor[]; event: string }>>
> = {
  draft: {
    pending_payment: { actors: ["user", "system"], event: "order.pending" },
    method_selected: { actors: ["user"], event: "order.method_selected" },
    cancelled: { actors: ["user", "staff"], event: "order.cancelled" },
  },
  pending_payment: {
    method_selected: { actors: ["user"], event: "order.method_selected" },
    processing: { actors: ["user", "system"], event: "order.processing" },
    cancelled: { actors: ["user", "staff"], event: "order.cancelled" },
  },
  method_selected: {
    processing: { actors: ["user", "system"], event: "order.processing" },
    cancelled: { actors: ["user", "staff"], event: "order.cancelled" },
  },
  processing: {
    // User may drive sandbox simulator; LIVE PSP never goes through this path.
    paid: { actors: ["user", "system", "staff"], event: "order.paid_sandbox" },
    failed: { actors: ["user", "system", "staff"], event: "order.failed" },
    cancelled: { actors: ["user", "staff"], event: "order.cancelled" },
  },
  paid: {
    refund_requested: {
      actors: ["user", "staff"],
      event: "order.refund_requested",
    },
  },
  failed: {
    cancelled: { actors: ["user", "staff"], event: "order.cancelled" },
  },
  refund_requested: {
    refunded_sandbox: {
      actors: ["staff", "system"],
      event: "order.refunded_sandbox",
    },
    paid: { actors: ["staff"], event: "order.refund_denied" },
  },
};

export function transitionBooking(
  from: string,
  action: string,
  actor: CommerceActor,
): TransitionResult {
  const to = mapBookingAction(from, action);
  if (!to) return { ok: false, reason: "invalid_action" };
  const rule = BOOKING_TRANSITIONS[from]?.[to];
  if (!rule) return { ok: false, reason: "illegal_transition" };
  if (!rule.actors.includes(actor)) return { ok: false, reason: "forbidden_actor" };
  return { ok: true, to, auditEvent: rule.event };
}

export function transitionOrder(
  from: string,
  action: string,
  actor: CommerceActor,
): TransitionResult {
  const to = mapOrderAction(from, action);
  if (!to) return { ok: false, reason: "invalid_action" };
  const rule = ORDER_TRANSITIONS[from]?.[to];
  if (!rule) return { ok: false, reason: "illegal_transition" };
  if (!rule.actors.includes(actor)) return { ok: false, reason: "forbidden_actor" };
  return { ok: true, to, auditEvent: rule.event };
}

function mapBookingAction(from: string, action: string): string | null {
  switch (action) {
    case "assign":
      return "assigned";
    case "complete":
      return "completed";
    case "cancel":
      return "cancelled";
    case "request_refund":
      return "refund_requested";
    case "approve_sandbox_refund":
      return "refunded_sandbox";
    case "deny_refund":
      return from === "refund_requested" ? "cancelled" : null;
    default:
      return null;
  }
}

function mapOrderAction(from: string, action: string): string | null {
  switch (action) {
    case "select_method":
      return "method_selected";
    case "mark_processing":
      return "processing";
    case "sandbox_succeed":
      return "paid";
    case "sandbox_fail":
      return "failed";
    case "cancel":
      return "cancelled";
    case "request_refund":
      return "refund_requested";
    case "approve_sandbox_refund":
      return "refunded_sandbox";
    case "deny_refund":
      return from === "refund_requested" ? "paid" : null;
    default:
      return null;
  }
}

/** Idempotency: same action on already-terminal or same-state is a no-op success. */
export function isIdempotentNoop(
  from: string,
  action: string,
  kind: "booking" | "order",
): boolean {
  const mapped =
    kind === "booking"
      ? mapBookingAction(from, action)
      : mapOrderAction(from, action);
  return mapped === from;
}

/**
 * Store billing compliance classification for SKUs / packages.
 * Digital → Apple/Google IAP path; offline_service → never IAP-settled in-app.
 */
export function classifyCommerceProduct(input: {
  sku?: string | null;
  packageCode?: string | null;
  fulfillment?: "digital" | "offline" | "hybrid";
}): ProductKind {
  if (input.fulfillment === "offline") return "offline_service";
  if (input.fulfillment === "hybrid") return "hybrid";
  if (input.fulfillment === "digital") return "digital_entitlement";
  const code = `${input.sku ?? ""} ${input.packageCode ?? ""}`.toLowerCase();
  if (
    /premium|subscription|iap|digital|entitlement/.test(code) &&
    !/concierge|advisor|session|offline|booking/.test(code)
  ) {
    return "digital_entitlement";
  }
  if (/companion|concierge|advisor|session|booking|service/.test(code)) {
    return "offline_service";
  }
  return "hybrid";
}

/** Never allow LIVE money movement from this module. */
export function assertSandboxOnly(liveFlag: boolean): void {
  if (liveFlag) {
    throw new Error("LIVE_PSP_FORBIDDEN");
  }
}
