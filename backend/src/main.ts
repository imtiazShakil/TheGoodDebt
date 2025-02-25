import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

// initialize the appdatasource
import { AppDataSource } from "./repository/datasource";
import { initializeDatabase } from "./repository/seed";
import { ContactDetails } from "./repository/entity/contact-details";

let mainWindow: BrowserWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // mainWindow.loadFile(path.join(__dirname, "../index.html"));
  mainWindow.loadURL("http://localhost:5173"); // Point to frontend dev server

  mainWindow.on("closed", () => {
    mainWindow = null!;
  });
}

app.whenReady().then(() => {
  ipcMain.handle("GET contacts", async (event) => {
    const contactRepository = AppDataSource.getRepository(ContactDetails);
    return await contactRepository.find();
  });

  createWindow();
  // to initialize the initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap
  AppDataSource.initialize()
    .then(async () => {
      initializeDatabase();
    })
    .catch((error) => console.log(error));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
