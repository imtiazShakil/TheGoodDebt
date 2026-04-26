import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

import { initializeDatabase } from "./repository/seed";
import { closeORM, initORM } from "./repository/db";
import { registerHandlers as registerContactHandlers } from "./ipc/contacts";
import { registerHandlers as registerVaultHandlers } from "./ipc/vaults";
import { registerHandlers as registerLendingHandlers } from "./ipc/lending-contracts";
import { registerHandlers as registerBorrowingHandlers } from "./ipc/borrowing-contracts";
import { registerHandlers as registerTransactionHandlers } from "./ipc/transactions";

let mainWindow: BrowserWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  mainWindow.on("closed", () => {
    mainWindow = null!;
  });
}

app.whenReady().then(async () => {
  await initORM();
  await initializeDatabase();

  registerContactHandlers(ipcMain);
  registerVaultHandlers(ipcMain);
  registerLendingHandlers(ipcMain);
  registerBorrowingHandlers(ipcMain);
  registerTransactionHandlers(ipcMain);

  createWindow();
});

app.on("window-all-closed", () => {
  closeORM();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
