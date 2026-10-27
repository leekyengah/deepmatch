import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCanonicalIntent, normalizeIntent } from "./intents";

describe("normalizeIntent", () => {
  it("maps canonical and legacy web tokens", () => {
    assert.equal(normalizeIntent("friendship"), "friendship");
    assert.equal(normalizeIntent("dating"), "dating");
    assert.equal(normalizeIntent("marriage"), "marriage");
    assert.equal(normalizeIntent("long_term"), "dating");
    assert.equal(normalizeIntent("companion"), "friendship");
    assert.equal(normalizeIntent("talks"), "friendship");
    assert.equal(normalizeIntent("friends"), "friendship");
  });

  it("rejects unknown", () => {
    assert.equal(normalizeIntent(""), null);
    assert.equal(normalizeIntent("other"), null);
  });

  it("isCanonicalIntent", () => {
    assert.equal(isCanonicalIntent("dating"), true);
    assert.equal(isCanonicalIntent("long_term"), false);
  });
});
