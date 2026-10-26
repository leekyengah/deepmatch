import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { colors, darkColors, layout, spacing } from "./index";

describe("design-tokens", () => {
  it("keeps wine primary brand", () => {
    assert.equal(colors.primary, "#6B2D3C");
    assert.equal(colors.canvas, "#F7F3EE");
    assert.equal(colors.champagne, "#A88A62");
  });

  it("exposes touch target and portrait ratio", () => {
    assert.equal(layout.touch, 44);
    assert.equal(layout.aspectPortrait, 3 / 4);
  });

  it("exposes 4/8 spacing scale and dark palette", () => {
    assert.equal(spacing[1], 4);
    assert.equal(spacing[2], 8);
    assert.ok(darkColors.canvas.startsWith("#"));
    assert.equal(colors.softBlush, "#E8DCE0");
  });
});
