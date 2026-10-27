import type {
  CaseRunner,
  EnvironmentTarget,
  SafetyPolicy,
  TestCaseSpec,
} from "@tradingbase/qa-core";

/** Tracker backends are optional; Sheets is one adapter, not a hard dependency. */
export type TrackerKind = "google_sheets" | "csv" | "json_file" | "none";

export interface TrackerConfig {
  kind: TrackerKind;
  /** Spreadsheet ID when kind=google_sheets */
  spreadsheetId?: string;
  sheetNames?: string[];
  /** QA-owned columns only — never overwrite audit/owner/AC/signoff */
  qaOwnedFields?: string[];
  writeEnabled: boolean;
}

export interface ProjectAdapter {
  projectId: string;
  displayName: string;
  /** Absolute or repo-relative root for this project's sources/tests */
  projectRoot: string;
  safety: SafetyPolicy;
  environments: EnvironmentTarget[];
  defaultEnvironmentId: string;
  catalog: TestCaseSpec[];
  runners: Record<string, CaseRunner>;
  evidenceDir: string;
  tracker: TrackerConfig;
  /**
   * Optional seed/cleanup hooks. Must target synthetic accounts only.
   * Return BLOCKED if credentials missing — never invent success.
   */
  seed?: () => Promise<{ ok: boolean; detail: string }>;
  cleanup?: () => Promise<{ ok: boolean; detail: string }>;
}

export interface AdapterManifest {
  projectId: string;
  enabled: boolean;
  /** When false, registry refuses to run even if somehow loaded */
  allowExecution: boolean;
  notes: string;
}
