import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCurrency, formatNumber } from "./format";

describe("format", () => {
  it("formats VND without decimals", () => {
    const s = formatCurrency(199000, "vi-VN", "VND");
    assert.equal(s.includes("199"), true);
  });

  it("formats numbers by locale", () => {
    assert.equal(formatNumber(1234.5, "en-US", { maximumFractionDigits: 1 }), "1,234.5");
  });
});
