const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("export-pdf", async (_event, payload) => {
    const { html } = payload;
    const tempWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: true
      }
    });

    await tempWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    await tempWindow.webContents.executeJavaScript(
      "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true);"
    );

    const pdfBuffer = await tempWindow.webContents.printToPDF({
      pageSize: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      landscape: false,
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });

    tempWindow.destroy();

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Export Label Sheet as PDF",
      defaultPath: "label-sheet.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    await fs.writeFile(filePath, pdfBuffer);
    return { canceled: false, filePath };
  });

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
