export type NutrientKey = "sugar" | "salt" | "fat";
export type LabelColour = "RED" | "AMBER" | "GREEN";

export interface NutrientInput {
  sugarPer100g: number;
  saltPer100g: number;
  fatPer100g: number;
}

export interface ProductMeta {
  title: string;
  mrp: string;
  mfd: string;
  exp: string;
  batchNo: string;
  subtitle?: string;
  footerLines: string[];
}

export interface PaletteOverride {
  RED: string;
  AMBER: string;
  GREEN: string;
}

export interface LabelSpec {
  widthMm: number;
  heightMm: number;
  logoMinWidthMm: number;
  logoMinHeightMm: number;
  logoWidthMm: number;
  logoHeightMm: number;
  gapMm: number;
  logoGroupTopMarginMm: number;
}

export interface A4PrintSpec {
  pageWidthMm: number;
  pageHeightMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  horizontalGapMm: number;
  verticalGapMm: number;
  showCutMarks: boolean;
}

export interface RenderPayload {
  nutrientInput: NutrientInput;
  productMeta: ProductMeta;
  labelSpec: LabelSpec;
  printSpec: A4PrintSpec;
  palette: PaletteOverride;
}
