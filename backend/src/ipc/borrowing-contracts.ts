import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { ContactDetails } from "../repository/entity/contact-details";
import { BorrowingContract } from "../repository/entity/borrowing-contract";
import { ContractStatus } from "../repository/entity/lending-contract";
import {
  Transaction,
  TransactionType,
} from "../repository/entity/transaction";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history";
import { createLedgerEntry } from "./transactions";

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET borrowing-contracts", async () => {
    const em = orm.em.fork();
    return await em.findAll(BorrowingContract, {
      populate: ["contact", "guarantor1", "guarantor2"],
    });
  });

  ipcMain.handle("POST borrowing-contracts", async (_event, data) => {
    if (!data.vaultId) throw new Error("vaultId is required");
    const { vaultId, ...rest } = data;
    rest.id = undefined;

    return await orm.em.fork().transactional(async (em) => {
      const contract = em.create(BorrowingContract, {
        ...rest,
        contact: em.getReference(ContactDetails, data.contact.id),
        guarantor1: data.guarantor1?.id
          ? em.getReference(ContactDetails, data.guarantor1.id)
          : null,
        guarantor2: data.guarantor2?.id
          ? em.getReference(ContactDetails, data.guarantor2.id)
          : null,
        contractStatus: ContractStatus.Active,
      });
      em.persist(contract);
      await em.flush();

      await createLedgerEntry(em, {
        vaultId,
        amount: contract.amount,
        transactionType: TransactionType.Borrow,
        financeCategoryType: contract.financeCategoryType,
        description: contract.purposeOfLoan ?? "",
        contactId: data.contact.id,
        borrowingContractId: contract.id,
      });

      await em.populate(contract, ["contact", "guarantor1", "guarantor2"]);
      return contract;
    });
  });

  ipcMain.handle("PUT borrowing-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(BorrowingContract, { id: data.id });
    contract.durationDays = data.durationDays;
    contract.returnDate = data.returnDate;
    contract.purposeOfLoan = data.purposeOfLoan;
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact", "guarantor1", "guarantor2"]);
    return contract;
  });

  ipcMain.handle("DELETE borrowing-contracts", async (_event, data) => {
    return await orm.em.fork().transactional(async (em) => {
      const contract = await em.findOneOrFail(BorrowingContract, {
        id: data.id,
      });

      const autoTx = await em.findOne(Transaction, {
        borrowingContract: data.id,
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
