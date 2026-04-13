const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
  exportPdf: async (html) => ipcRenderer.invoke("export-pdf", { html })
});
