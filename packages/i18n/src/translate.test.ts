import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator, interpolate } from "./translate";
import { messages } from "./messages";

describe("interpolate", () => {
  it("substitutes simple vars", () => {
    assert.equal(interpolate("Hello {name}", { name: "A" }), "Hello A");
  });

  it("handles plural other", () => {
    assert.equal(
      interpolate("{count, plural, =0 {none} one {# item} other {# items}}", {
        count: 3,
      }),
      "3 items",
    );
  });

  it("uses =0 branch", () => {
    assert.equal(
      interpolate("{count, plural, =0 {none} other {# items}}", { count: 0 }),
      "none",
    );
  });
});

describe("createTranslator", () => {
  it("resolves vi-VN keys", () => {
    const { t } = createTranslator(messages, "vi-VN");
    assert.equal(t("nav.discover"), "Tìm nhau");
    assert.equal(t("discovery.like"), "Quan tâm");
  });

  it("resolves en-US keys", () => {
    const { t } = createTranslator(messages, "en-US");
    assert.equal(t("nav.discover"), "Discover");
    assert.equal(t("discovery.mutualToast").includes("Mutual match"), true);
  });

  it("interpolates discovery match body", () => {
    const { t } = createTranslator(messages, "en-US");
    assert.equal(
      t("discovery.mobileMatchBody", { name: "Lan" }),
      "You and Lan both showed interest.",
    );
  });
});
