/** Case-level execution outcomes */
export type CaseOutcome =
  | "NOT_RUN"
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "SKIPPED"
  | "INCONCLUSIVE";

/**
 * Lifecycle states. Automated agents may only transition into
 * READY_FOR_QA, QA_PASSED_AUTOMATED, or QA_FAILED.
 */
export type LifecycleState =
  | "IMPLEMENTED"
  | "READY_FOR_QA"
  | "QA_PASSED_AUTOMATED"
  | "QA_FAILED"
  | "INDEPENDENT_REVIEW_APPROVED"
  | "FOUNDER_UAT_APPROVED"
  | "RELEASE_APPROVED";

export type FailureClass =
  | "application_defect"
  | "test_infrastructure"
  | "seed_fixture"
  | "environment_blocked"
  | "connector_blocked"
  | "flake_infra"
  | "unknown";

export interface RequirementRef {
  auditId?: string;
  fixId?: string;
  extId?: string;
  other?: string[];
}

export interface TestCaseSpec {
  id: string;
  title: string;
  suite: string;
  priority: "P0" | "P1" | "P2";
  requirements: RequirementRef;
  criteria: string;
  runner: string;
  tags?: string[];
}

export interface CaseResult {
  id: string;
  outcome: CaseOutcome;
  expected?: string;
  actual?: string;
  detail?: string;
  failureClass?: FailureClass;
  durationMs?: number;
  requirements?: RequirementRef;
  remediation?: string;
}

export interface EnvironmentTarget {
  id: string;
  baseUrl: string;
  kind: "staging" | "isolated" | "local" | "production";
  allowWrites: boolean;
}

export interface SafetyPolicy {
  projectId: string;
  allowedHosts: string[];
  allowedKinds: Array<EnvironmentTarget["kind"]>;
  forbidProductionWrites: boolean;
  forbidLivePsp: boolean;
}

export interface RunContext {
  runId: string;
  projectId: string;
  commitSha: string;
  branch: string;
  environment: EnvironmentTarget;
  startedAt: string;
  suite: string;
  actor: string;
}

export interface QaRunReport {
  context: RunContext;
  results: CaseResult[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    blocked: number;
    skipped: number;
    inconclusive: number;
    notRun: number;
  };
  openBlockers: string[];
  releaseRecommendation: "NO-GO" | "CONDITIONAL" | "GO_CANDIDATE";
  /** Never an approval — recommendation only */
  gaStance: "NO-GO" | "GO_RECOMMENDATION_ONLY";
  costEstimateUsd?: number;
  durationMs: number;
  lifecycleEffect: LifecycleState | null;
  reviewerSignoff: {
    identity: string | null;
    status: "unsigned" | "pending_human";
  };
}
