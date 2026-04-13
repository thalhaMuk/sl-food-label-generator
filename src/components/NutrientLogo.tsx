import type { LabelColour, NutrientKey, PaletteOverride } from "../shared/types";

const nutrientCopy: Record<NutrientKey, { si: string; ta: string; en: string }> = {
  sugar: { si: "\u0dc3\u0dd3\u0db1\u0dd2", ta: "\u0b9a\u0bc0\u0ba9\u0bbf", en: "Sugar" },
  salt: { si: "\u0dbd\u0dd4\u0dab\u0dd4", ta: "\u0b89\u0baa\u0bcd\u0baa\u0bc1", en: "Salt" },
  fat: { si: "\u0db8\u0dda\u0daf\u0dba", ta: "\u0b95\u0bca\u0bb4\u0bc1\u0baa\u0bcd\u0baa\u0bc1", en: "Fat" }
};

interface Props {
  nutrient: NutrientKey;
  valuePer100g: number;
  colour: LabelColour;
  palette: PaletteOverride;
  minWidthMm: number;
  minHeightMm: number;
}

function formatValue(valuePer100g: number): string {
  if (Number.isInteger(valuePer100g)) {
    return `${valuePer100g}g/100g`;
  }

  return `${valuePer100g.toFixed(2).replace(/\.?0+$/, "")}g/100g`;
}

export default function NutrientLogo({
  nutrient,
  valuePer100g,
  colour,
  palette,
  minWidthMm,
  minHeightMm
}: Props) {
  const copy = nutrientCopy[nutrient];
  const widthMm = Math.max(10, minWidthMm);
  const heightMm = Math.max(20, minHeightMm);

  return (
    <article className="nutrient-box" style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, background: palette[colour] }}>
      <div className="nutrient-top">
        <div className="nutrient-lines">
          <div>{copy.si}</div>
          <div>{copy.ta}</div>
          <div>{copy.en}</div>
        </div>
      </div>
      <div className="nutrient-value-wrap">
        <div className="nutrient-value">{formatValue(valuePer100g)}</div>
      </div>
    </article>
  );
}
