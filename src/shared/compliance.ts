import type { LabelColour, NutrientInput, NutrientKey, PaletteOverride } from "./types";

export const DEFAULT_PALETTE: PaletteOverride = {
  RED: "rgb(230, 0, 0)",
  AMBER: "rgb(255, 195, 9)",
  GREEN: "rgb(0, 195, 0)"
};

const ranges = {
  sugar: { greenMaxExclusive: 5, amberMaxInclusive: 22 },
  salt: { greenMaxExclusive: 0.25, amberMaxInclusive: 1.25 },
  fat: { greenMaxExclusive: 3, amberMaxInclusive: 17.5 }
} as const;

export function resolveColourForNutrient(nutrient: NutrientKey, valuePer100g: number): LabelColour {
  if (!Number.isFinite(valuePer100g) || valuePer100g < 0) {
    throw new Error(`${nutrient} value must be a non-negative number`);
  }

  const threshold = ranges[nutrient];
  if (valuePer100g < threshold.greenMaxExclusive) {
    return "GREEN";
  }
  if (valuePer100g <= threshold.amberMaxInclusive) {
    return "AMBER";
  }
  return "RED";
}

export function resolveAllColours(input: NutrientInput): Record<NutrientKey, LabelColour> {
  return {
    sugar: resolveColourForNutrient("sugar", input.sugarPer100g),
    salt: resolveColourForNutrient("salt", input.saltPer100g),
    fat: resolveColourForNutrient("fat", input.fatPer100g)
  };
}
