import { resolveAllColours } from "../shared/compliance";
import { normalizeLabelSpec } from "../shared/layout";
import type { RenderPayload } from "../shared/types";
import NutrientLogo from "./NutrientLogo";

interface Props {
  payload: RenderPayload;
}

export default function LabelPreview({ payload }: Props) {
  const labelSpec = normalizeLabelSpec(payload.labelSpec);
  const colours = resolveAllColours(payload.nutrientInput);
  const isCompact = labelSpec.widthMm <= 40 || labelSpec.heightMm <= 60;

  return (
    <section
      className={`label-preview ${isCompact ? "compact" : ""}`}
      style={{ width: `${labelSpec.widthMm}mm`, height: `${labelSpec.heightMm}mm` }}
    >
      <div className="logo-row" style={{ marginTop: `${labelSpec.logoGroupTopMarginMm}mm`, gap: `${labelSpec.gapMm}mm` }}>
        <NutrientLogo
          nutrient="sugar"
          valuePer100g={payload.nutrientInput.sugarPer100g}
          colour={colours.sugar}
          palette={payload.palette}
          minWidthMm={Math.max(labelSpec.logoMinWidthMm, labelSpec.logoWidthMm)}
          minHeightMm={Math.max(labelSpec.logoMinHeightMm, labelSpec.logoHeightMm)}
        />
        <NutrientLogo
          nutrient="salt"
          valuePer100g={payload.nutrientInput.saltPer100g}
          colour={colours.salt}
          palette={payload.palette}
          minWidthMm={Math.max(labelSpec.logoMinWidthMm, labelSpec.logoWidthMm)}
          minHeightMm={Math.max(labelSpec.logoMinHeightMm, labelSpec.logoHeightMm)}
        />
        <NutrientLogo
          nutrient="fat"
          valuePer100g={payload.nutrientInput.fatPer100g}
          colour={colours.fat}
          palette={payload.palette}
          minWidthMm={Math.max(labelSpec.logoMinWidthMm, labelSpec.logoWidthMm)}
          minHeightMm={Math.max(labelSpec.logoMinHeightMm, labelSpec.logoHeightMm)}
        />
      </div>

      <div className="label-title">{payload.productMeta.title}</div>
      {payload.productMeta.subtitle ? <div className="label-subtitle">{payload.productMeta.subtitle}</div> : null}

      <div className="meta-grid">
        <div className="meta-key">M.R.P.</div><div className="meta-value">{payload.productMeta.mrp}</div>
        <div className="meta-key">MFD.</div><div className="meta-value">{payload.productMeta.mfd}</div>
        <div className="meta-key">EXP.</div><div className="meta-value">{payload.productMeta.exp}</div>
        <div className="meta-key">Batch No.</div><div className="meta-value">{payload.productMeta.batchNo}</div>
      </div>

      <div className="label-footer">
        {payload.productMeta.footerLines.filter(Boolean).map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </section>
  );
}
