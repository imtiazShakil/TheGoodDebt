import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { Vault } from "../repository/entity/vault";

export function registerHandlers(ipcMain: IpcMain) {
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
}
