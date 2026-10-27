import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAuthCookieName } from "./clear-auth-cookies";

describe("isAuthCookieName", () => {
  it("matches Supabase session cookies", () => {
    assert.equal(isAuthCookieName("sb-xyz-auth-token"), true);
    assert.equal(isAuthCookieName("sb-xyz-auth-token.0"), true);
    assert.equal(isAuthCookieName("supabase-auth-token"), true);
  });

  it("ignores unrelated cookies", () => {
    assert.equal(isAuthCookieName("locale"), false);
    assert.equal(isAuthCookieName("dm_theme"), false);
    assert.equal(isAuthCookieName(""), false);
  });
});
