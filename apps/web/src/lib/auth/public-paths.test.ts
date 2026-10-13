import test from "node:test";
import assert from "node:assert/strict";
import { isPublicPath } from "./public-paths";

test("public marketing and legal paths", () => {
  for (const p of [
    "/",
    "/login",
    "/signup",
    "/legal",
    "/legal/terms",
    "/privacy",
    "/terms",
    "/support",
    "/faq",
    "/account-deletion",
    "/forgot-password",
    "/auth/callback",
    "/couple/join/abc",
    "/api/v1/health",
    "/robots.txt",
  ]) {
    assert.equal(isPublicPath(p), true, p);
  }
});

test("authenticated app paths are private", () => {
  for (const p of [
    "/discover",
    "/chat",
    "/me",
    "/couple",
    "/couple/map",
    "/ai",
    "/services",
    "/lifestyle",
    "/home",
    "/likes",
    "/places/map",
  ]) {
    assert.equal(isPublicPath(p), false, p);
  }
});
