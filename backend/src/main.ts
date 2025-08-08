import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

// initialize the appdatasource
import { initializeDatabase } from "./repository/seed";
import { ContactDetails } from "./repository/entity/contact-details";
import { closeORM, initORM, orm } from "./repository/db";

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

app.whenReady().then(async () => {
  await initORM();
  await initializeDatabase();

  ipcMain.handle("GET contacts", async (event) => {
    const em = orm.em.fork();
    return await em.findAll(ContactDetails);
  });

  ipcMain.handle("POST contacts", async (event, data) => {
    data.id = undefined; // set the id to undefined to create a new contact
    // save and get the saved data
    const em = orm.em.fork();
    let contact = em.create(ContactDetails, data);

    await em.persistAndFlush(contact);

    return contact;
  });

  ipcMain.handle("PUT contacts", async (event, data) => {
    const em = orm.em.fork();
    const contact = await em.findOneOrFail(ContactDetails, { id: data.id });

    if (contact) {
      contact.name = data.name;
      contact.fatherName = data.fatherName;
      contact.nidInfo = data.nidInfo;
      contact.address = data.address;
      contact.phone = data.phone;
    }
    em.persistAndFlush(contact);
    return contact;
  });

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
