import { resolveAllColours } from "./compliance";
import { computeGridLayout, normalizeLabelSpec } from "./layout";
import type { RenderPayload } from "./types";

const nutrientCopy = {
  sugar: { si: "\u0dc3\u0dd3\u0db1\u0dd2", ta: "\u0b9a\u0bc0\u0ba9\u0bbf", en: "Sugar" },
  salt: { si: "\u0dbd\u0dd4\u0dab\u0dd4", ta: "\u0b89\u0baa\u0bcd\u0baa\u0bc1", en: "Salt" },
  fat: { si: "\u0db8\u0dda\u0daf\u0dba", ta: "\u0b95\u0bca\u0bb4\u0bc1\u0baa\u0bcd\u0baa\u0bc1", en: "Fat" }
} as const;

function renderNutrientBox(
  key: "sugar" | "salt" | "fat",
  value: number,
  color: string,
  widthMm: number,
  heightMm: number
): string {
  const copy = nutrientCopy[key];
  const displayValue =
    Number.isInteger(value) ? `${value}g/100g` : `${value.toFixed(2).replace(/\.?0+$/, "")}g/100g`;

  return `
        <div class="t-box box-${key}" style="background-color: ${color};">
          <div class="box-text-container">
            <div class="box-text">
              <span class="sinhala">${copy.si}</span>
              <span class="tamil">${copy.ta}</span>
              <span class="english">${copy.en}</span>
            </div>
          </div>
          <div class="box-value-container">
            <span class="box-value">${displayValue}</span>
          </div>
        </div>
  `;
}

function renderSingleLabel(payload: RenderPayload): string {
  const labelSpec = normalizeLabelSpec(payload.labelSpec);
  const colors = resolveAllColours(payload.nutrientInput);
  const nutrientWidth = Math.max(labelSpec.logoMinWidthMm, labelSpec.logoWidthMm);
  const nutrientHeight = Math.max(labelSpec.logoMinHeightMm, labelSpec.logoHeightMm);

  return `
    <section class="label-container" style="width:${labelSpec.widthMm}mm;height:${labelSpec.heightMm}mm;">
      <div class="top-boxes" style="gap:${labelSpec.gapMm}mm;margin-top:${labelSpec.logoGroupTopMarginMm}mm;">
        ${renderNutrientBox("sugar", payload.nutrientInput.sugarPer100g, payload.palette[colors.sugar], nutrientWidth, nutrientHeight)}
        ${renderNutrientBox("salt", payload.nutrientInput.saltPer100g, payload.palette[colors.salt], nutrientWidth, nutrientHeight)}
        ${renderNutrientBox("fat", payload.nutrientInput.fatPer100g, payload.palette[colors.fat], nutrientWidth, nutrientHeight)}
      </div>

      <div class="candy-title">${payload.productMeta.title}</div>

      <table class="details-table">
        <tr>
          <td>M.R.P ./රු.සි.මි.</td>
          <td>${payload.productMeta.mrp}</td>
        </tr>
        <tr>
          <td>MFD. / නි.දි</td>
          <td>${payload.productMeta.mfd}</td>
        </tr>
        <tr>
          <td>EXP. / ක.ඉ.දි</td>
          <td>${payload.productMeta.exp}</td>
        </tr>
        <tr>
          <td>Batch No/කා.අ.</td>
          <td>${payload.productMeta.batchNo}</td>
        </tr>
      </table>

      <div class="distributor-info">
        ${payload.productMeta.footerLines.map(line => `${line}<br>`).join("")}
      </div>

      ${payload.productMeta.subtitle ? `<div class="flavour">${payload.productMeta.subtitle}</div>` : ""}

      <div class="instructions">
        குளிர்ந்த மற்றும் உலர்ந்த இடத்தில்<br>
        வைக்கவும்./ සිසිල් සහ වියලි ස්ථානයක තබන්න
      </div>
    </section>
  `;
}

export function createA4PrintHtml(payload: RenderPayload): string {
  const labelSpec = normalizeLabelSpec(payload.labelSpec);
  const grid = computeGridLayout(labelSpec, payload.printSpec);
  const totalCells = grid.rows * grid.columns;
  const labels = Array.from({ length: totalCells }, () => renderSingleLabel(payload)).join("");

  const cutMarkHtml = payload.printSpec.showCutMarks
    ? `<div class="cut-overlay" style="
         margin:${payload.printSpec.marginTopMm}mm ${payload.printSpec.marginRightMm}mm ${payload.printSpec.marginBottomMm}mm ${payload.printSpec.marginLeftMm}mm;
         background-size:${labelSpec.widthMm + payload.printSpec.horizontalGapMm}mm ${labelSpec.heightMm + payload.printSpec.verticalGapMm}mm;
       "></div>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Label Sheet</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        width: ${payload.printSpec.pageWidthMm}mm;
        height: ${payload.printSpec.pageHeightMm}mm;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .sheet {
        width: ${payload.printSpec.pageWidthMm}mm;
        height: ${payload.printSpec.pageHeightMm}mm;
        padding: ${payload.printSpec.marginTopMm}mm ${payload.printSpec.marginRightMm}mm ${payload.printSpec.marginBottomMm}mm ${payload.printSpec.marginLeftMm}mm;
        display: grid;
        grid-template-columns: repeat(${grid.columns}, ${labelSpec.widthMm}mm);
        grid-template-rows: repeat(${grid.rows}, ${labelSpec.heightMm}mm);
        gap: ${payload.printSpec.verticalGapMm}mm ${payload.printSpec.horizontalGapMm}mm;
        position: relative;
      }
      
      .label-container {
        background-color: white;
        color: black;
        padding: 1mm;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .top-boxes {
        display: flex;
        justify-content: space-between;
        height: 20mm;
        margin-bottom: 0.5mm;
        width: 100%;
      }

      .t-box {
        flex: 1;
        height: 100%;
        border: 0.5mm solid black;
        border-radius: 1.5mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 0.8mm;
        box-sizing: border-box;
        position: relative;
      }

      .box-text-container {
        text-align: center;
        width: 100%;
      }

      .box-text {
        text-align: center;
        font-weight: 900;
        color: white;
        line-height: 1.1;
        -webkit-text-stroke: 0.15mm black;
        position: relative;
        letter-spacing: 0;
      }

      .box-text .sinhala {
        display: block;
        font-size: 2.3mm;
        margin-bottom: 0.2mm;
      }

      .box-text .tamil {
        display: block;
        font-size: 2.0mm;
        margin-bottom: 0.2mm;
      }
      
      .t-box:nth-child(3) .tamil {
          font-size: 1.7mm; 
          margin-top: 0.3mm;
      }

      .box-text .english {
        display: block;
        font-size: 2.4mm;
        margin-top: 0.1mm;
      }

      .box-value-container {
        background-color: white;
        width: 92%;
        height: 4.8mm;
        border: 0.4mm solid black;
        border-radius: 1.2mm;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 0.6mm;
      }

      .box-value {
        color: black;
        font-weight: bold;
        font-size: 1.8mm;
        letter-spacing: -0.1mm;
      }

      .candy-title {
        font-size: 2.1mm;
        font-weight: 900;
        margin-bottom: 0.8mm;
        margin-top: 0.5mm;
        letter-spacing: 0;
        white-space: nowrap;
      }

      .details-table {
        width: 100%;
        border-collapse: collapse;
        font-weight: bold;
        font-size: 1.9mm;
        margin-bottom: 0.5mm;
      }

      .details-table td {
        padding: 0;
        line-height: 1.15;
        vertical-align: top;
      }

      .details-table td:first-child {
        width: 55%;
      }

      .distributor-info {
        font-size: 1.55mm;
        line-height: 1.2;
        margin-bottom: 0.5mm;
        margin-top: 0.3mm;
      }

      .flavour {
        font-size: 1.6mm;
        font-weight: bold;
        margin-bottom: 0.4mm;
        margin-top: 0.4mm;
        text-transform: uppercase;
      }

      .instructions {
        font-size: 1.55mm;
        line-height: 1.2;
      }

      .cut-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(to right, rgba(20,20,20,0.35) 0, rgba(20,20,20,0.35) 0.2mm, transparent 0.2mm),
          linear-gradient(to bottom, rgba(20,20,20,0.35) 0, rgba(20,20,20,0.35) 0.2mm, transparent 0.2mm);
        background-repeat: repeat;
        opacity: 0.4;
      }
    </style>
  </head>
  <body>
    <main class="sheet">${labels}</main>
    ${cutMarkHtml}
  </body>
</html>`;
}
