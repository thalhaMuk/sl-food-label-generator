import { describe, expect, it } from "vitest";
import { clampLogoMinimums, computeGridLayout } from "../src/shared/layout";

describe("layout safeguards", () => {
  it("enforces Gazette minimum nutrient logo dimensions", () => {
    const clamped = clampLogoMinimums({
      widthMm: 90,
      heightMm: 130,
      logoMinWidthMm: 2,
      logoMinHeightMm: 3,
      logoWidthMm: 9,
      logoHeightMm: 19,
      gapMm: 1,
      logoGroupTopMarginMm: 0
    });

    expect(clamped.logoMinWidthMm).toBe(10);
    expect(clamped.logoMinHeightMm).toBe(20);
    expect(clamped.logoWidthMm).toBe(10);
    expect(clamped.logoHeightMm).toBe(20);
  });

  it("computes a sane A4 grid", () => {
    const grid = computeGridLayout(
      {
        widthMm: 90,
        heightMm: 130,
        logoMinWidthMm: 10,
        logoMinHeightMm: 20,
        logoWidthMm: 35,
        logoHeightMm: 47.5,
        gapMm: 1,
        logoGroupTopMarginMm: 0
      },
      {
        pageWidthMm: 210,
        pageHeightMm: 297,
        marginTopMm: 8,
        marginRightMm: 8,
        marginBottomMm: 8,
        marginLeftMm: 8,
        horizontalGapMm: 4,
        verticalGapMm: 4,
        showCutMarks: true
      }
    );

    expect(grid.columns).toBe(2);
    expect(grid.rows).toBe(2);
    expect(grid.total).toBe(4);
  });
});
