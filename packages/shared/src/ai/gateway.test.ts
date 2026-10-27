import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redactedInput, resolveAiAdapter, stubAssist } from "./gateway";

describe("ai gateway stub", () => {
  it("redacts private keys", () => {
    const out = redactedInput({
      occasion: "cafe",
      raw_chat: "secret",
      journal: "private",
    });
    assert.equal(out.occasion, "cafe");
    assert.equal(out.raw_chat, undefined);
    assert.equal(out.journal, undefined);
  });

  it("returns demo-labeled gift suggestions", () => {
    const res = stubAssist("gift", { occasion: "sinh nhật" });
    assert.equal(res.adapter, "stub");
    assert.ok(res.disclaimer.length > 20);
    assert.ok(res.suggestions.some((s) => s.demo));
  });

  it("deepmind is non-clinical", () => {
    const res = stubAssist("deepmind");
    const blob = JSON.stringify(res).toLowerCase();
    assert.equal(/diagnos|bipolar|schizo|depression disorder/.test(blob), false);
  });

  it("resolveAiAdapter defaults to stub (DECISION-AI-01 C)", () => {
    assert.equal(resolveAiAdapter({}), "stub");
    assert.equal(resolveAiAdapter({ AI_ADAPTER: "stub" }), "stub");
    assert.equal(resolveAiAdapter({ AI_ADAPTER: "openai" }), "openai");
    assert.equal(resolveAiAdapter({ AI_ADAPTER: "OPENAI" }), "openai");
    assert.equal(resolveAiAdapter({ AI_ADAPTER: "anthropic" }), "stub");
  });
});
