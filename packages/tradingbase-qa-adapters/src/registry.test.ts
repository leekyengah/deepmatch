import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  registerAdapter,
  getAdapter,
  clearRegistry,
  listManifests,
} from "./registry.js";
import { FUTURE_PROJECT_STUBS } from "./stubs/future-projects.js";
import type { ProjectAdapter } from "./types.js";

function fakeAdapter(id: string): ProjectAdapter {
  return {
    projectId: id,
    displayName: id,
    projectRoot: ".",
    safety: {
      projectId: id,
      allowedHosts: ["localhost"],
      allowedKinds: ["local"],
      forbidProductionWrites: true,
      forbidLivePsp: true,
    },
    environments: [
      {
        id: "local",
        baseUrl: "http://localhost:3000",
        kind: "local",
        allowWrites: false,
      },
    ],
    defaultEnvironmentId: "local",
    catalog: [],
    runners: {},
    evidenceDir: "docs/evidence/qa-agent",
    tracker: { kind: "none", writeEnabled: false },
  };
}

describe("adapter registry", () => {
  beforeEach(() => clearRegistry());

  it("registers and resolves executable adapter", () => {
    registerAdapter(fakeAdapter("deepmatch"), {
      projectId: "deepmatch",
      enabled: true,
      allowExecution: true,
      notes: "pilot",
    });
    assert.equal(getAdapter("deepmatch").projectId, "deepmatch");
  });

  it("refuses non-executable stubs", () => {
    const stub = FUTURE_PROJECT_STUBS[0]!;
    registerAdapter(fakeAdapter(stub.projectId), stub);
    assert.throws(() => getAdapter(stub.projectId), /not executable/);
  });

  it("lists future stubs as non-executable", () => {
    for (const s of FUTURE_PROJECT_STUBS) {
      assert.equal(s.allowExecution, false);
    }
    assert.equal(listManifests().length, 0);
  });
});
