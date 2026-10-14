import test from "node:test";
import assert from "node:assert/strict";
import {
  LEGAL_DOCUMENTS,
  LEGAL_PACK_META,
  legalNavItems,
} from "./index";

test("pack meta version 1.1", () => {
  assert.equal(LEGAL_PACK_META.version, "1.1");
  assert.equal(LEGAL_PACK_META.locale, "vi-VN");
  assert.ok(LEGAL_PACK_META.contentUpdatedLabel.includes("12/10/2026"));
});

test("all required document ids present", () => {
  const ids = new Set(LEGAL_DOCUMENTS.map((d) => d.id));
  for (const id of [
    "terms",
    "privacy",
    "community",
    "child-safety",
    "couple-data",
    "subscriptions",
    "ai",
    "services",
    "delete-account",
    "support",
  ] as const) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});

test("no invented contact email or internal labels in body", () => {
  const blob = JSON.stringify(LEGAL_DOCUMENTS);
  assert.equal(blob.includes("@gmail.com"), false);
  assert.equal(blob.toLowerCase().includes("placeholder"), false);
  assert.equal(/HUMAN_REVIEW|Legal Master|ticket id/i.test(blob), false);
});

test("nav items cover docs", () => {
  assert.equal(legalNavItems().length, LEGAL_DOCUMENTS.length);
});

test("each doc has substance", () => {
  for (const doc of LEGAL_DOCUMENTS) {
    assert.ok(doc.blocks.length >= 2, doc.id);
    const text = doc.blocks
      .map((b) => ("text" in b ? b.text : b.items?.join(" ") ?? ""))
      .join(" ");
    assert.ok(text.length > 80, doc.id);
  }
});
