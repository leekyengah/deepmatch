/**
 * Lightweight state-machine self-check (no vitest in apps/web).
 * Run: node scripts/services-booking-states-selftest.mjs
 */

const ALLOWED = {
  DRAFT: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["AWAITING_PARTNER_CONFIRMATION", "EXPIRED", "CANCELLED"],
  AWAITING_PARTNER_CONFIRMATION: ["AWAITING_PAYMENT", "CANCELLED", "EXPIRED"],
  AWAITING_PAYMENT: ["PAYMENT_PROCESSING", "EXPIRED", "CANCELLED"],
  PAYMENT_PROCESSING: ["CONFIRMED", "AWAITING_PAYMENT", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "DISPUTED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED", "CANCELLED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  EXPIRED: [],
  DISPUTED: ["CANCELLED", "COMPLETED"],
};

function can(from, to) {
  return (ALLOWED[from] || []).includes(to);
}

const cases = [
  ["REQUESTED", "AWAITING_PARTNER_CONFIRMATION", true],
  ["AWAITING_PARTNER_CONFIRMATION", "AWAITING_PAYMENT", true],
  ["AWAITING_PAYMENT", "PAYMENT_PROCESSING", true],
  ["PAYMENT_PROCESSING", "CONFIRMED", true],
  ["CONFIRMED", "COMPLETED", false], // must go via IN_PROGRESS
  ["DRAFT", "CONFIRMED", false],
  ["CANCELLED", "REQUESTED", false],
];

let failed = 0;
for (const [from, to, expect] of cases) {
  const got = can(from, to);
  if (got !== expect) {
    console.error(`FAIL ${from} -> ${to}: expected ${expect}, got ${got}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`services-booking-states-selftest: ${failed} failed`);
  process.exit(1);
}
console.log("services-booking-states-selftest: PASS", cases.length, "cases");
