/** Customer-facing catalog: hide DEMO/sandbox seed providers and products. */

const HIDDEN_PROVIDER_STATUS = new Set([
  "DEMO",
  "SANDBOX",
  "FIXTURE",
  "TEST",
]);

const HIDDEN_FULFILLMENT = new Set([
  "SANDBOX_ONLY",
  "DEMO_ONLY",
  "FIXTURE",
]);

export function isCustomerVisibleProviderStatus(
  status: string | null | undefined,
): boolean {
  if (!status) return true;
  return !HIDDEN_PROVIDER_STATUS.has(String(status).trim().toUpperCase());
}

export function isCustomerVisibleFulfillment(
  fulfillment: string | null | undefined,
): boolean {
  if (!fulfillment) return true;
  return !HIDDEN_FULFILLMENT.has(String(fulfillment).trim().toUpperCase());
}

/** Organic members never see seeded cohorts; cohort members only see same cohort. */
export function isDiscoverCohortVisible(
  viewerCohort: string | null | undefined,
  candidateCohort: string | null | undefined,
): boolean {
  const viewer = viewerCohort?.trim() || null;
  const candidate = candidateCohort?.trim() || null;
  if (viewer) return candidate === viewer;
  return candidate == null;
}
