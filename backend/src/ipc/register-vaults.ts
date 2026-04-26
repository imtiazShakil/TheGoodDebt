import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { Vault } from "../repository/entity/vault";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history";

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET vaults", async () => {
    const em = orm.em.fork();
    const vaults = await em.findAll(Vault);
    return Promise.all(
      vaults.map(async (vault) => {
        const latestBalance = await em.findOne(
          VaultBalanceHistory,
          { vault: vault.id },
          { orderBy: { createdAt: "DESC" } },
        );
        return {
          id: vault.id,
          name: vault.name,
          description: vault.description,
          createdAt: vault.createdAt,
          updatedAt: vault.updatedAt,
          latestBalance: latestBalance ?? undefined,
        };
      }),
    );
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
    const hasHistory = await em.count(VaultBalanceHistory, { vault: data.id });
    if (hasHistory > 0) {
      throw new Error("Cannot delete a vault that has transaction history");
    }
    await em.removeAndFlush(vault);
    return { id: data.id };
  });

  ipcMain.handle("GET vault-balance-history", async (_event, data) => {
    const em = orm.em.fork();
    return await em.find(
      VaultBalanceHistory,
      { vault: data.vaultId },
      { orderBy: { createdAt: "DESC" } },
    );
  });
}
