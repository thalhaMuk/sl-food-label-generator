import { computeGridLayout, normalizeLabelSpec } from "../shared/layout";
import type { RenderPayload } from "../shared/types";
import LabelPreview from "./LabelPreview";

interface Props {
  payload: RenderPayload;
}

export default function A4SheetPreview({ payload }: Props) {
  const labelSpec = normalizeLabelSpec(payload.labelSpec);
  const grid = computeGridLayout(labelSpec, payload.printSpec);

  return (
    <div
      className="sheet-preview"
      style={{
        width: `${payload.printSpec.pageWidthMm}mm`,
        height: `${payload.printSpec.pageHeightMm}mm`,
        padding: `${payload.printSpec.marginTopMm}mm ${payload.printSpec.marginRightMm}mm ${payload.printSpec.marginBottomMm}mm ${payload.printSpec.marginLeftMm}mm`,
        gridTemplateColumns: `repeat(${grid.columns}, ${labelSpec.widthMm}mm)`,
        gridTemplateRows: `repeat(${grid.rows}, ${labelSpec.heightMm}mm)`,
        columnGap: `${payload.printSpec.horizontalGapMm}mm`,
        rowGap: `${payload.printSpec.verticalGapMm}mm`
      }}
    >
      {Array.from({ length: grid.total }).map((_, index) => (
        <LabelPreview key={index} payload={payload} />
      ))}
    </div>
  );
}
