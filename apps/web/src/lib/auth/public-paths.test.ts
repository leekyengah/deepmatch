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
    "/bookings",
    "/me/orders",
    "/checkout/cart",
  ]) {
    assert.equal(isPublicPath(p), false, p);
  }
});

test("query strings do not bypass private gate", () => {
  assert.equal(isPublicPath("/discover?x=1"), false);
  assert.equal(isPublicPath("/login?next=%2Fdiscover"), true);
});
