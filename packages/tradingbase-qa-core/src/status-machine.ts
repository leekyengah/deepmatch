import type { LifecycleState } from "./types.js";

const AUTOMATED_TARGETS = new Set<LifecycleState>([
  "READY_FOR_QA",
  "QA_PASSED_AUTOMATED",
  "QA_FAILED",
]);

const TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  IMPLEMENTED: ["READY_FOR_QA"],
  READY_FOR_QA: ["QA_PASSED_AUTOMATED", "QA_FAILED"],
  QA_PASSED_AUTOMATED: ["INDEPENDENT_REVIEW_APPROVED", "QA_FAILED"],
  QA_FAILED: ["READY_FOR_QA", "IMPLEMENTED"],
  INDEPENDENT_REVIEW_APPROVED: ["FOUNDER_UAT_APPROVED", "QA_FAILED"],
  FOUNDER_UAT_APPROVED: ["RELEASE_APPROVED", "QA_FAILED"],
  RELEASE_APPROVED: [],
};

export function canTransition(
  from: LifecycleState,
  to: LifecycleState,
): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function assertAutomatedTransition(
  from: LifecycleState,
  to: LifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid lifecycle transition ${from} → ${to}`);
  }
  if (!AUTOMATED_TARGETS.has(to)) {
    throw new Error(
      `Automated QA must not set ${to}; requires independent human signoff`,
    );
  }
}

/** Map suite results to the highest automated lifecycle effect allowed. */
export function lifecycleFromResults(opts: {
  ran: boolean;
  anyFail: boolean;
  anyBlocked: boolean;
  allPass: boolean;
}): LifecycleState | null {
  if (!opts.ran) return null;
  if (opts.anyFail) return "QA_FAILED";
  if (opts.anyBlocked && !opts.allPass) return "READY_FOR_QA";
  if (opts.allPass) return "QA_PASSED_AUTOMATED";
  return "READY_FOR_QA";
}
