import { useEffect, useMemo, useState } from "react";
import { DEFAULT_PALETTE, resolveAllColours } from "./shared/compliance";
import { createA4PrintHtml } from "./shared/printHtml";
import type { RenderPayload } from "./shared/types";

const defaultPayload: RenderPayload = {
  nutrientInput: {
    sugarPer100g: 58,
    saltPer100g: 0,
    fatPer100g: 0
  },
  productMeta: {
    title: "CANDY / \u0d9a\u0dd0\u0db1\u0dca\u0da9\u0dd2 / \u0b95\u0bbe\u0ba9\u0bcd\u0b9f\u0bbf",
    mrp: "\u0dbb\u0dd4/Rs 225/-",
    mfd: "27-10-2025",
    exp: "27-10-2027",
    batchNo: "A10",
    subtitle: "MENTHOLYPTUS FLAVOUR 27.9g",
    footerLines: [
      "Imported & Distributed By:",
      "Sterling Foods (Pvt) Ltd - 011 2099 337",
      "35/3, Colombage Mw.Colombo - 05."
    ]
  },
  labelSpec: {
    widthMm: 35,
    heightMm: 47.5,
    logoMinWidthMm: 10,
    logoMinHeightMm: 20,
    logoWidthMm: 10,
    logoHeightMm: 20,
    gapMm: 1,
    logoGroupTopMarginMm: 0
  },
  printSpec: {
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginTopMm: 4,
    marginRightMm: 13.5,
    marginBottomMm: 4,
    marginLeftMm: 13.5,
    horizontalGapMm: 2,
    verticalGapMm: 0.8,
    showCutMarks: true
  },
  palette: DEFAULT_PALETTE
};

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("label-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* ignore */ }
  return "dark";
}

function parseFooterLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function App() {
  const [payload, setPayload] = useState<RenderPayload>(defaultPayload);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("label-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const colours = useMemo(
    () => resolveAllColours(payload.nutrientInput),
    [payload.nutrientInput]
  );

  const [presets, setPresets] = useState<Record<string, RenderPayload>>(() => {
    try {
      const saved = localStorage.getItem("label-presets");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentPresetName, setCurrentPresetName] = useState("");

  const savePreset = () => {
    if (!currentPresetName.trim()) {
      alert("Please enter a preset name");
      return;
    }
    const newPresets = { ...presets, [currentPresetName]: payload };
    setPresets(newPresets);
    localStorage.setItem("label-presets", JSON.stringify(newPresets));
    setStatus(`Preset '${currentPresetName}' saved.`);
  };

  const loadPreset = (name: string) => {
    if (presets[name]) {
      setPayload(presets[name]);
      setCurrentPresetName(name);
      setStatus(`Loaded preset '${name}'.`);
    }
  };

  const deletePreset = (name: string) => {
    if (confirm(`Are you sure you want to delete the preset '${name}'?`)) {
      const newPresets = { ...presets };
      delete newPresets[name];
      setPresets(newPresets);
      localStorage.setItem("label-presets", JSON.stringify(newPresets));
      if (currentPresetName === name) {
        setCurrentPresetName("");
      }
      setStatus(`Preset '${name}' deleted.`);
    }
  };

  const footerText = useMemo(() => payload.productMeta.footerLines.join("\n"), [payload.productMeta.footerLines]);
  const printPreviewHtml = useMemo(() => createA4PrintHtml(payload), [payload]);

  const updatePayload = (updater: (prev: RenderPayload) => RenderPayload) => {
    setPayload((prev) => updater(prev));
  };

  const exportPdf = async () => {
    if (!window.electronApi?.exportPdf) {
      setStatus("Electron bridge not available. Run with npm run dev.");
      return;
    }

    setIsExporting(true);
    setStatus("Preparing print layout...");
    try {
      const html = createA4PrintHtml(payload);
      const result = await window.electronApi.exportPdf(html);
      if (result.canceled) {
        setStatus("Export cancelled");
      } else {
        setStatus(`Saved: ${result.filePath}`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="app-shell">
      <aside className="controls-panel">
        {/* ── App bar ── */}
        <div className="app-bar">
          <div className="app-bar-brand">
            <h1>Label Studio</h1>
            <p>Sri Lanka Food Colour-Code Generator</p>
          </div>
          <div className="app-bar-actions">
            <button
              type="button"
              className="btn-icon"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button type="button" className="btn-primary" disabled={isExporting} onClick={exportPdf}>
              {isExporting ? "Exporting\u2026" : "Export PDF"}
            </button>
          </div>
        </div>

        <div className="controls-scroll">
          {/* ── Presets ── */}
          <div className="preset-bar">
            <select
              value={currentPresetName}
              onChange={(e) => {
                const name = e.target.value;
                if (name) loadPreset(name);
                else setCurrentPresetName("");
              }}
            >
              <option value="">-- Select preset --</option>
              {Object.keys(presets).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <div className="preset-actions">
              <input
                placeholder="Preset name\u2026"
                value={currentPresetName}
                onChange={(e) => setCurrentPresetName(e.target.value)}
              />
              <button type="button" className="btn-secondary" onClick={savePreset}>Save</button>
              {currentPresetName && presets[currentPresetName] && (
                <button type="button" className="btn-danger" onClick={() => deletePreset(currentPresetName)}>Delete</button>
              )}
            </div>
          </div>

          {/* ── Nutritional Data ── */}
          <div className="section">
            <h4 className="section-label">Nutritional Data (g/100g)</h4>
            <div className="field-grid">
              <label>
                <span className="nutrient-label">
                  <span className="color-chip" style={{ background: payload.palette[colours.sugar], color: payload.palette[colours.sugar] }} />
                  Sugar
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={payload.nutrientInput.sugarPer100g}
                  onChange={(e) =>
                    updatePayload((prev) => ({
                      ...prev,
                      nutrientInput: { ...prev.nutrientInput, sugarPer100g: Number(e.target.value) }
                    }))
                  }
                />
              </label>
              <label>
                <span className="nutrient-label">
                  <span className="color-chip" style={{ background: payload.palette[colours.salt], color: payload.palette[colours.salt] }} />
                  Salt
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={payload.nutrientInput.saltPer100g}
                  onChange={(e) =>
                    updatePayload((prev) => ({
                      ...prev,
                      nutrientInput: { ...prev.nutrientInput, saltPer100g: Number(e.target.value) }
                    }))
                  }
                />
              </label>
              <label>
                <span className="nutrient-label">
                  <span className="color-chip" style={{ background: payload.palette[colours.fat], color: payload.palette[colours.fat] }} />
                  Fat
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={payload.nutrientInput.fatPer100g}
                  onChange={(e) =>
                    updatePayload((prev) => ({
                      ...prev,
                      nutrientInput: { ...prev.nutrientInput, fatPer100g: Number(e.target.value) }
                    }))
                  }
                />
              </label>
            </div>
          </div>

          {/* ── Product Details ── */}
          <div className="section">
            <h4 className="section-label">Product Details</h4>
            <div className="field-grid">
              <label className="full-width">
                Title
                <input
                  value={payload.productMeta.title}
                  onChange={(e) =>
                    updatePayload((prev) => ({ ...prev, productMeta: { ...prev.productMeta, title: e.target.value } }))
                  }
                />
              </label>
              <label className="full-width">
                Subtitle (optional)
                <input
                  value={payload.productMeta.subtitle ?? ""}
                  onChange={(e) =>
                    updatePayload((prev) => ({ ...prev, productMeta: { ...prev.productMeta, subtitle: e.target.value } }))
                  }
                />
              </label>
              <label>
                MRP
                <input
                  value={payload.productMeta.mrp}
                  onChange={(e) =>
                    updatePayload((prev) => ({ ...prev, productMeta: { ...prev.productMeta, mrp: e.target.value } }))
                  }
                />
              </label>
              <label>
                Batch No
                <input
                  value={payload.productMeta.batchNo}
                  onChange={(e) =>
                    updatePayload((prev) => ({ ...prev, productMeta: { ...prev.productMeta, batchNo: e.target.value } }))
                  }
                />
              </label>
              <label>
                MFD
                <input
                  value={payload.productMeta.mfd}
                  onChange={(e) =>
                    updatePayload((prev) => ({ ...prev, productMeta: { ...prev.productMeta, mfd: e.target.value } }))
                  }
                />
              </label>
              <label>
                EXP
                <input
                  value={payload.productMeta.exp}
                  onChange={(e) =>
                    updatePayload((prev) => ({ ...prev, productMeta: { ...prev.productMeta, exp: e.target.value } }))
                  }
                />
              </label>
              <label className="full-width">
                Footer Lines (one per line)
                <textarea
                  value={footerText}
                  onChange={(e) =>
                    updatePayload((prev) => ({
                      ...prev,
                      productMeta: { ...prev.productMeta, footerLines: parseFooterLines(e.target.value) }
                    }))
                  }
                />
              </label>
            </div>
          </div>

          {/* ── Advanced Settings (collapsible) ── */}
          <button
            type="button"
            className="advanced-toggle"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            <ChevronIcon />
            Advanced Settings
          </button>

          <div className="advanced-content" data-open={advancedOpen}>
            <div className="advanced-content-inner">
              {/* Layout Configuration */}
              <div className="section">
                <h4 className="section-label">Layout Configuration (mm)</h4>
                <div className="field-grid">
                  <label>
                    Label Width
                    <input
                      type="number"
                      min={20}
                      step="0.1"
                      value={payload.labelSpec.widthMm}
                      onChange={(e) =>
                        updatePayload((prev) => ({ ...prev, labelSpec: { ...prev.labelSpec, widthMm: Number(e.target.value) } }))
                      }
                    />
                  </label>
                  <label>
                    Label Height
                    <input
                      type="number"
                      min={20}
                      step="0.1"
                      value={payload.labelSpec.heightMm}
                      onChange={(e) =>
                        updatePayload((prev) => ({ ...prev, labelSpec: { ...prev.labelSpec, heightMm: Number(e.target.value) } }))
                      }
                    />
                  </label>
                  <label>
                    Colour Strip Width
                    <input
                      type="number"
                      min={10}
                      step="0.1"
                      value={payload.labelSpec.logoWidthMm}
                      onChange={(e) =>
                        updatePayload((prev) => ({
                          ...prev,
                          labelSpec: { ...prev.labelSpec, logoWidthMm: Number(e.target.value) }
                        }))
                      }
                    />
                  </label>
                  <label>
                    Colour Strip Height
                    <input
                      type="number"
                      min={20}
                      step="0.1"
                      value={payload.labelSpec.logoHeightMm}
                      onChange={(e) =>
                        updatePayload((prev) => ({
                          ...prev,
                          labelSpec: { ...prev.labelSpec, logoHeightMm: Number(e.target.value) }
                        }))
                      }
                    />
                  </label>
                  <label>
                    Horizontal Gap
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={payload.printSpec.horizontalGapMm}
                      onChange={(e) =>
                        updatePayload((prev) => ({
                          ...prev,
                          printSpec: { ...prev.printSpec, horizontalGapMm: Number(e.target.value) }
                        }))
                      }
                    />
                  </label>
                  <label>
                    Vertical Gap
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={payload.printSpec.verticalGapMm}
                      onChange={(e) =>
                        updatePayload((prev) => ({
                          ...prev,
                          printSpec: { ...prev.printSpec, verticalGapMm: Number(e.target.value) }
                        }))
                      }
                    />
                  </label>
                  <label>
                    Margin (all sides)
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={payload.printSpec.marginTopMm}
                      onChange={(e) => {
                        const margin = Number(e.target.value);
                        updatePayload((prev) => ({
                          ...prev,
                          printSpec: {
                            ...prev.printSpec,
                            marginTopMm: margin,
                            marginRightMm: margin,
                            marginBottomMm: margin,
                            marginLeftMm: margin
                          }
                        }));
                      }}
                    />
                  </label>
                  <label>
                    Show Cut Marks
                    <select
                      value={payload.printSpec.showCutMarks ? "yes" : "no"}
                      onChange={(e) =>
                        updatePayload((prev) => ({
                          ...prev,
                          printSpec: { ...prev.printSpec, showCutMarks: e.target.value === "yes" }
                        }))
                      }
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Palette Override */}
              <div className="section">
                <h4 className="section-label">Palette Override</h4>
                <div className="field-grid">
                  <label>
                    Red
                    <input
                      value={payload.palette.RED}
                      onChange={(e) =>
                        updatePayload((prev) => ({ ...prev, palette: { ...prev.palette, RED: e.target.value } }))
                      }
                    />
                  </label>
                  <label>
                    Amber
                    <input
                      value={payload.palette.AMBER}
                      onChange={(e) =>
                        updatePayload((prev) => ({ ...prev, palette: { ...prev.palette, AMBER: e.target.value } }))
                      }
                    />
                  </label>
                  <label>
                    Green
                    <input
                      value={payload.palette.GREEN}
                      onChange={(e) =>
                        updatePayload((prev) => ({ ...prev, palette: { ...prev.palette, GREEN: e.target.value } }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section className="preview-panel">
        <div className="preview-frame">
          <div className="preview-canvas">
            <iframe
              className="preview-iframe"
              title="Print Preview"
              srcDoc={printPreviewHtml}
            />
          </div>
          <span className="status-pill">{status}</span>
        </div>
      </section>
    </main>
  );
}
