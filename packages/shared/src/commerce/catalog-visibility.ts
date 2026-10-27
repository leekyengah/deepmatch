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

/**
 * Cohort is a purge marker (e.g. Mebertes), not a Discover silo.
 * Organic and bootstrap accounts see each other like real peers.
 */
export function isDiscoverCohortVisible(
  _viewerCohort: string | null | undefined,
  _candidateCohort: string | null | undefined,
): boolean {
  return true;
}
