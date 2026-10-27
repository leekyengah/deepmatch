import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertEnvironmentAllowed,
  redactSecrets,
  SafetyViolation,
} from "./safety.js";

const policy = {
  projectId: "deepmatch",
  allowedHosts: ["datingvn.com", "localhost", "127.0.0.1"],
  allowedKinds: ["staging", "isolated", "local"] as const,
  forbidProductionWrites: true,
  forbidLivePsp: true,
};

describe("safety", () => {
  it("allows staging datingvn.com", () => {
    assert.doesNotThrow(() =>
      assertEnvironmentAllowed(
        {
          id: "dm-staging",
          baseUrl: "https://datingvn.com",
          kind: "staging",
          allowWrites: false,
        },
        { ...policy, allowedKinds: [...policy.allowedKinds] },
      ),
    );
  });

  it("blocks production kind", () => {
    assert.throws(
      () =>
        assertEnvironmentAllowed(
          {
            id: "prod",
            baseUrl: "https://datingvn.com",
            kind: "production",
            allowWrites: false,
          },
          { ...policy, allowedKinds: [...policy.allowedKinds] },
        ),
      SafetyViolation,
    );
  });

  it("blocks unknown hosts", () => {
    assert.throws(
      () =>
        assertEnvironmentAllowed(
          {
            id: "evil",
            baseUrl: "https://evil.example",
            kind: "staging",
            allowWrites: false,
          },
          { ...policy, allowedKinds: [...policy.allowedKinds] },
        ),
      /not in allowlist/,
    );
  });

  it("redacts JWTs and bearer tokens", () => {
    const sample =
      "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaa.bbb password:\"secret123\"";
    const out = redactSecrets(sample);
    assert.match(out, /REDACTED/);
    assert.doesNotMatch(out, /secret123/);
  });
});
