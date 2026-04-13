import type { A4PrintSpec, LabelSpec } from "./types";

export interface GridLayout {
  columns: number;
  rows: number;
  total: number;
}

export function clampLogoMinimums(spec: LabelSpec): LabelSpec {
  return {
    ...spec,
    logoWidthMm: Math.max(10, spec.logoWidthMm),
    logoHeightMm: Math.max(20, spec.logoHeightMm),
    logoMinHeightMm: Math.max(20, spec.logoMinHeightMm),
    logoMinWidthMm: Math.max(10, spec.logoMinWidthMm)
  };
}

export function normalizeLabelSpec(spec: LabelSpec): LabelSpec {
  return clampLogoMinimums(spec);
}

export function computeGridLayout(label: LabelSpec, print: A4PrintSpec): GridLayout {
  const usableWidth = print.pageWidthMm - print.marginLeftMm - print.marginRightMm;
  const usableHeight = print.pageHeightMm - print.marginTopMm - print.marginBottomMm;

  const columns = Math.max(
    1,
    Math.floor((usableWidth + print.horizontalGapMm) / (label.widthMm + print.horizontalGapMm))
  );
  const rows = Math.max(
    1,
    Math.floor((usableHeight + print.verticalGapMm) / (label.heightMm + print.verticalGapMm))
  );

  return {
    columns,
    rows,
    total: columns * rows
  };
}
