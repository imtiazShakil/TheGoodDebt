import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { ContactDetails } from "../repository/entity/contact-details";
import {
  ContractStatus,
  LendingContract,
} from "../repository/entity/lending-contract";
import { Transaction, TransactionType } from "../repository/entity/transaction";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history";
import { computeRepaidTotals, createLedgerEntry } from "./register-transactions";

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET lending-contracts", async () => {
    const em = orm.em.fork();
    const contracts = await em.findAll(LendingContract, {
      populate: ["contact"],
    });
    const ids = contracts.map((c) => c.id);
    const repaidMap = await computeRepaidTotals(
      em,
      ids,
      "lendingContract",
      TransactionType.LendRepay,
    );
    return contracts.map((c) => ({ ...c, totalRepaid: repaidMap[c.id] ?? 0 }));
  });

  ipcMain.handle("POST lending-contracts", async (_event, data) => {
    if (!data.vaultId) throw new Error("vaultId is required");
    const { vaultId, ...rest } = data;
    rest.id = undefined;

    return await orm.em.fork().transactional(async (em) => {
      const contract = em.create(LendingContract, {
        ...rest,
        contact: em.getReference(ContactDetails, data.contact.id),
        contractStatus: ContractStatus.Active,
      });
      em.persist(contract);
      await em.flush();

      await createLedgerEntry(em, {
        vaultId,
        amount: contract.amount,
        transactionType: TransactionType.Lend,
        financeCategoryType: contract.financeCategoryType,
        description: contract.reasonForLending ?? "",
        contactId: data.contact.id,
        lendingContractId: contract.id,
      });

      await em.populate(contract, ["contact"]);
      return contract;
    });
  });

  ipcMain.handle("PUT lending-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(LendingContract, { id: data.id });
    contract.durationDays = data.durationDays;
    contract.returnDate = data.returnDate;
    contract.reasonForLending = data.reasonForLending;
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact"]);
    return contract;
  });

  ipcMain.handle("DELETE lending-contracts", async (_event, data) => {
    return await orm.em.fork().transactional(async (em) => {
      const contract = await em.findOneOrFail(LendingContract, {
        id: data.id,
      });

      const autoTx = await em.findOne(Transaction, {
        lendingContract: data.id,
      });
      if (autoTx) {
        const last = await em.findOne(
          Transaction,
          {},
          { orderBy: { id: "DESC" } },
        );
        if (!last || last.id !== autoTx.id) {
          throw new Error(
            "Cannot delete: a newer transaction exists after this contract's auto-transaction",
          );
        }
        const vbh = await em.findOne(VaultBalanceHistory, {
          transaction: autoTx.id,
        });
        if (vbh) em.remove(vbh);
        em.remove(autoTx);
      }

      em.remove(contract);
      await em.flush();
      return { id: data.id };
    });
  });
}
