/**
 * Logical concierge booking state machine (SERVICE-001).
 * DB enum today: requested | assigned | completed | cancelled
 * Extended lifecycle stored in service_bookings.meta.lifecycle until migration ADR.
 */

export const BOOKING_LIFECYCLE = [
  "DRAFT",
  "REQUESTED",
  "AWAITING_PARTNER_CONFIRMATION",
  "AWAITING_PAYMENT",
  "PAYMENT_PROCESSING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "DISPUTED",
] as const;

export type BookingLifecycle = (typeof BOOKING_LIFECYCLE)[number];

/** Map DB booking_status → logical lifecycle for UI. */
export function lifecycleFromDbStatus(
  status: string,
  metaLifecycle?: string | null,
): BookingLifecycle {
  if (
    metaLifecycle &&
    (BOOKING_LIFECYCLE as readonly string[]).includes(metaLifecycle)
  ) {
    return metaLifecycle as BookingLifecycle;
  }
  switch (status) {
    case "assigned":
      return "AWAITING_PARTNER_CONFIRMATION";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "requested":
    default:
      return "REQUESTED";
  }
}

export const ALLOWED_TRANSITIONS: Record<
  BookingLifecycle,
  BookingLifecycle[]
> = {
  DRAFT: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["AWAITING_PARTNER_CONFIRMATION", "EXPIRED", "CANCELLED"],
  AWAITING_PARTNER_CONFIRMATION: [
    "AWAITING_PAYMENT",
    "CANCELLED",
    "EXPIRED",
  ],
  AWAITING_PAYMENT: ["PAYMENT_PROCESSING", "EXPIRED", "CANCELLED"],
  PAYMENT_PROCESSING: ["CONFIRMED", "AWAITING_PAYMENT", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "DISPUTED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED", "CANCELLED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  EXPIRED: [],
  DISPUTED: ["CANCELLED", "COMPLETED"],
};

export function canTransition(from: BookingLifecycle, to: BookingLifecycle) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
