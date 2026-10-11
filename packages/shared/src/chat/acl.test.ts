import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAccessChat } from "./acl";

describe("chat ACL", () => {
  const ok = {
    isAuthenticated: true,
    isMutualMatch: true,
    isParticipant: true,
    isBlockedEitherWay: false,
    chatFlagEnabled: true,
    userSuspended: false,
  };

  it("allows eligible mutual participants", () => {
    assert.equal(canAccessChat(ok).allowed, true);
  });

  it("denies without mutual (QA05)", () => {
    const r = canAccessChat({ ...ok, isMutualMatch: false });
    assert.equal(r.allowed, false);
    assert.equal(r.reason, "mutual_required");
  });

  it("denies blocked (QA06)", () => {
    const r = canAccessChat({ ...ok, isBlockedEitherWay: true });
    assert.equal(r.allowed, false);
    assert.equal(r.reason, "blocked");
  });

  it("denies non-participants", () => {
    const r = canAccessChat({ ...ok, isParticipant: false });
    assert.equal(r.allowed, false);
  });
});
