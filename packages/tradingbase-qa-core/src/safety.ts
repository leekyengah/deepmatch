import type { EnvironmentTarget, SafetyPolicy } from "./types.js";

export class SafetyViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafetyViolation";
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function assertEnvironmentAllowed(
  target: EnvironmentTarget,
  policy: SafetyPolicy,
): void {
  if (policy.forbidProductionWrites && target.kind === "production") {
    throw new SafetyViolation(
      `[${policy.projectId}] production targets are forbidden for active QA`,
    );
  }
  if (target.allowWrites && target.kind === "production") {
    throw new SafetyViolation(
      `[${policy.projectId}] production writes are never allowed`,
    );
  }
  if (!policy.allowedKinds.includes(target.kind)) {
    throw new SafetyViolation(
      `[${policy.projectId}] environment kind ${target.kind} not allowlisted`,
    );
  }
  const host = hostOf(target.baseUrl);
  const ok = policy.allowedHosts.some(
    (h) => host === h.toLowerCase() || host.endsWith(`.${h.toLowerCase()}`),
  );
  if (!ok) {
    throw new SafetyViolation(
      `[${policy.projectId}] host ${host || "(invalid)"} not in allowlist`,
    );
  }
  if (policy.forbidLivePsp && process.env.SERVICES_PAYMENT_LIVE === "true") {
    throw new SafetyViolation(
      `[${policy.projectId}] LIVE PSP flag set — refuse QA activation`,
    );
  }
}

export function redactSecrets(text: string): string {
  return text
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[REDACTED_JWT]")
    .replace(/sk_live_[A-Za-z0-9]+/g, "[REDACTED_STRIPE]")
    .replace(/sk_test_[A-Za-z0-9]+/g, "[REDACTED_STRIPE_TEST]")
    .replace(/SUPABASE_SERVICE_ROLE_KEY=\S+/gi, "SUPABASE_SERVICE_ROLE_KEY=[REDACTED]")
    .replace(/password["']?\s*[:=]\s*["'][^"']+["']/gi, 'password:"[REDACTED]"')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
}
