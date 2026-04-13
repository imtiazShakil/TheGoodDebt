import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

// initialize the appdatasource
import { initializeDatabase } from "./repository/seed";
import { ContactDetails } from "./repository/entity/contact-details";
import { Vault } from "./repository/entity/vault";
import { LendingContract } from "./repository/entity/lending-contract";
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

  ipcMain.handle("GET vaults", async () => {
    const em = orm.em.fork();
    return await em.findAll(Vault);
  });

  ipcMain.handle("POST vaults", async (_event, data) => {
    data.id = undefined;
    const em = orm.em.fork();
    const vault = em.create(Vault, data);
    await em.persistAndFlush(vault);
    return vault;
  });

  ipcMain.handle("PUT vaults", async (_event, data) => {
    const em = orm.em.fork();
    const vault = await em.findOneOrFail(Vault, { id: data.id });
    vault.name = data.name;
    vault.description = data.description;
    await em.persistAndFlush(vault);
    return vault;
  });

  ipcMain.handle("DELETE vaults", async (_event, data) => {
    const em = orm.em.fork();
    const vault = await em.findOneOrFail(Vault, { id: data.id });
    await em.removeAndFlush(vault);
    return { id: data.id };
  });

  ipcMain.handle("SEARCH contacts", async (_event, data) => {
    const em = orm.em.fork();
    return await em.find(ContactDetails, {
      name: { $like: `%${data.query}%` },
    });
  });

  ipcMain.handle("GET lending-contracts", async () => {
    const em = orm.em.fork();
    return await em.findAll(LendingContract, { populate: ["contact"] });
  });

  ipcMain.handle("POST lending-contracts", async (_event, data) => {
    data.id = undefined;
    const em = orm.em.fork();
    const contract = em.create(LendingContract, {
      ...data,
      contact: em.getReference(ContactDetails, data.contact.id),
    });
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact"]);
    return contract;
  });

  ipcMain.handle("PUT lending-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(LendingContract, { id: data.id });
    contract.contact = em.getReference(ContactDetails, data.contact.id);
    contract.amount = data.amount;
    contract.durationDays = data.durationDays;
    contract.returnDate = data.returnDate;
    contract.financeCategoryType = data.financeCategoryType;
    contract.reasonForLending = data.reasonForLending;
    contract.contractStatus = data.contractStatus;
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact"]);
    return contract;
  });

  ipcMain.handle("DELETE lending-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(LendingContract, { id: data.id });
    await em.removeAndFlush(contract);
    return { id: data.id };
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
