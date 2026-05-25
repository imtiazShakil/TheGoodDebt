import { IpcMain } from "electron";
import { AppError } from "./app-error.js";
import { orm } from "../repository/db.js";
import { Vault } from "../repository/entity/vault.js";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history.js";
import {
  DeleteResultDto,
  VaultBalanceHistoryDto,
  VaultBalanceHistoryQueryInput,
  VaultCreateInput,
  VaultDeleteInput,
  VaultDto,
  VaultUpdateInput,
  VaultWithLatestBalanceDto,
} from "./contract.js";
import {
  toVaultBalanceHistoryDto,
  toVaultDto,
  toVaultWithLatestBalanceDto,
} from "./entityDtoMapper.js";

/** Registers IPC handlers for vault CRUD and per-vault balance history queries. */
export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle(
    "GET vaults",
    async (): Promise<VaultWithLatestBalanceDto[]> => {
      const em = orm.em.fork();
      const vaults = await em.findAll(Vault);
      return Promise.all(
        vaults.map(async (vault) => {
          const latestBalance = await em.findOne(
            VaultBalanceHistory,
            { vault: vault.id },
            { orderBy: { createdAt: "DESC" } },
          );
          return toVaultWithLatestBalanceDto(vault, latestBalance);
        }),
      );
    },
  );

  ipcMain.handle(
    "POST vaults",
    async (_event, data: VaultCreateInput): Promise<VaultDto> => {
      const em = orm.em.fork();
      // Construct from the typed input rather than spreading `data` — the
      // frontend sends the full Vault interface (including an empty id), and
      // we must not let that reach em.create as the primary key.
      const vault = em.create(Vault, {
        name: data.name,
        description: data.description,
      });
      await em.persist(vault).flush();
      return toVaultDto(vault);
    },
  );

  ipcMain.handle(
    "PUT vaults",
    async (_event, data: VaultUpdateInput): Promise<VaultDto> => {
      const em = orm.em.fork();
      const vault = await em.findOneOrFail(Vault, { id: data.id });
      vault.name = data.name;
      vault.description = data.description;
      await em.persist(vault).flush();
      return toVaultDto(vault);
    },
  );

  ipcMain.handle(
    "DELETE vaults",
    async (_event, data: VaultDeleteInput): Promise<DeleteResultDto> => {
      const em = orm.em.fork();
      const vault = await em.findOneOrFail(Vault, { id: data.id });
      const hasHistory = await em.count(VaultBalanceHistory, {
        vault: data.id,
      });
      if (hasHistory > 0) {
        throw new AppError("errors.vault.deleteWithHistory");
      }
      await em.remove(vault).flush();
      return { id: data.id };
    },
  );

  ipcMain.handle(
    "GET vault-balance-history",
    async (
      _event,
      data: VaultBalanceHistoryQueryInput,
    ): Promise<VaultBalanceHistoryDto[]> => {
      const em = orm.em.fork();
      const rows = await em.find(
        VaultBalanceHistory,
        { vault: data.vaultId },
        { orderBy: { createdAt: "DESC" } },
      );
      return rows.map(toVaultBalanceHistoryDto);
    },
  );
}
