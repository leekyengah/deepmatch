import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { User } from "@supabase/supabase-js";
import {
  isEmailVerified,
  isUnverifiedAllowedPath,
} from "./email-verified";

function fakeUser(confirmed: string | null): User {
  return {
    id: "u1",
    email_confirmed_at: confirmed,
  } as User;
}

describe("isEmailVerified", () => {
  it("requires email_confirmed_at", () => {
    assert.equal(isEmailVerified(null), false);
    assert.equal(isEmailVerified(fakeUser(null)), false);
    assert.equal(isEmailVerified(fakeUser("2026-01-01T00:00:00Z")), true);
  });
});

describe("isUnverifiedAllowedPath", () => {
  it("allows auth and legal surfaces", () => {
    assert.equal(isUnverifiedAllowedPath("/auth/verify-email"), true);
    assert.equal(isUnverifiedAllowedPath("/legal/terms"), true);
    assert.equal(isUnverifiedAllowedPath("/api/v1/health"), true);
  });

  it("blocks dating surfaces", () => {
    assert.equal(isUnverifiedAllowedPath("/discover"), false);
    assert.equal(isUnverifiedAllowedPath("/me"), false);
    assert.equal(isUnverifiedAllowedPath("/chat"), false);
  });
});
