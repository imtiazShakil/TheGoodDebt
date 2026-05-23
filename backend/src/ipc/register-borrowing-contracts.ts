import { IpcMain } from "electron";
import { orm } from "../repository/db.js";
import { BorrowingContract } from "../repository/entity/borrowing-contract.js";
import { ContactDetails } from "../repository/entity/contact-details.js";
import { ContractStatus } from "../repository/entity/lending-contract.js";
import { TransactionType } from "../repository/entity/transaction.js";
import { applyAttachment } from "./attachment-helpers.js";
import {
  AttachedFileDto,
  BorrowingContractCreateInput,
  BorrowingContractDeleteInput,
  BorrowingContractDto,
  BorrowingContractFileInput,
  BorrowingContractUpdateInput,
  DeleteResultDto,
} from "./contract.js";
import { toBorrowingContractDto } from "./entityDtoMapper.js";
import {
  assertVaultCategoryBalance,
  computeRepaidTotals,
  createLedgerEntry,
  removeContractAutoTransaction,
} from "./register-transactions.js";

/**
 * Registers IPC handlers for BorrowingContract CRUD.
 * Creating a contract validates the vault has sufficient category balance, then fires a Borrow ledger entry.
 * Deleting is only allowed if the auto-created transaction is still the latest in the ledger.
 */
export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle(
    "GET borrowing-contracts",
    async (): Promise<BorrowingContractDto[]> => {
      const em = orm.em.fork();
      const contracts = await em.findAll(BorrowingContract, {
        populate: ["contact", "guarantor1", "guarantor2"],
      });
      const ids = contracts.map((c) => c.id);
      const repaidMap = await computeRepaidTotals(
        em,
        ids,
        "borrowingContract",
        TransactionType.BorrowRepay,
      );
      return contracts.map((c) =>
        toBorrowingContractDto(c, repaidMap[c.id] ?? 0),
      );
    },
  );

  ipcMain.handle(
    "POST borrowing-contracts",
    async (
      _event,
      data: BorrowingContractCreateInput,
    ): Promise<BorrowingContractDto> => {
      return await orm.em.fork().transactional(async (em) => {
        await assertVaultCategoryBalance(
          em,
          data.vaultId,
          data.financeCategoryType,
          data.amount,
        );

        // Construct from the typed input rather than spreading `data` — see
        // the lending-contracts equivalent for the rationale (frontend sends
        // the full BorrowingContract object including its empty id).
        const contract = em.create(BorrowingContract, {
          contact: em.getReference(ContactDetails, data.contact.id),
          amount: data.amount,
          durationDays: data.durationDays,
          returnDate: data.returnDate,
          financeCategoryType: data.financeCategoryType,
          purposeOfLoan: data.purposeOfLoan,
          guarantor1: data.guarantor1?.id
            ? em.getReference(ContactDetails, data.guarantor1.id)
            : null,
          guarantor2: data.guarantor2?.id
            ? em.getReference(ContactDetails, data.guarantor2.id)
            : null,
          firstReminder: data.firstReminder,
          secondReminder: data.secondReminder,
          thirdReminder: data.thirdReminder,
          guarantorsReminder: data.guarantorsReminder,
          contractStatus: ContractStatus.Active,
        } as unknown as BorrowingContract);
        if (data.attachedFile) applyAttachment(contract, data.attachedFile);
        em.persist(contract);
        await em.flush();

        await createLedgerEntry(em, {
          vaultId: data.vaultId,
          amount: contract.amount,
          transactionType: TransactionType.Borrow,
          financeCategoryType: contract.financeCategoryType,
          description: contract.purposeOfLoan ?? "",
          contactId: data.contact.id,
          borrowingContractId: contract.id,
        });

        await em.populate(contract, ["contact", "guarantor1", "guarantor2"]);
        return toBorrowingContractDto(contract, 0);
      });
    },
  );

  ipcMain.handle(
    "PUT borrowing-contracts",
    async (
      _event,
      data: BorrowingContractUpdateInput,
    ): Promise<BorrowingContractDto> => {
      const em = orm.em.fork();
      const contract = await em.findOneOrFail(BorrowingContract, {
        id: data.id,
      });
      contract.durationDays = data.durationDays;
      contract.returnDate = data.returnDate;
      contract.purposeOfLoan = data.purposeOfLoan;
      contract.firstReminder = data.firstReminder;
      contract.secondReminder = data.secondReminder;
      contract.thirdReminder = data.thirdReminder;
      contract.guarantorsReminder = data.guarantorsReminder;
      if (data.attachedFile) applyAttachment(contract, data.attachedFile);
      await em.persist(contract).flush();
      await em.populate(contract, ["contact", "guarantor1", "guarantor2"]);
      const repaidMap = await computeRepaidTotals(
        em,
        [contract.id],
        "borrowingContract",
        TransactionType.BorrowRepay,
      );
      return toBorrowingContractDto(contract, repaidMap[contract.id] ?? 0);
    },
  );

  ipcMain.handle(
    "GET borrowing-contract-file",
    async (
      _event,
      data: BorrowingContractFileInput,
    ): Promise<AttachedFileDto | null> => {
      const em = orm.em.fork();
      // Explicit `fields` opts the lazy fileBlob column into this one projection.
      const c = await em.findOne(
        BorrowingContract,
        { id: data.contractId },
        { fields: ["id", "fileName", "fileBlob"] },
      );
      if (!c?.fileName || !c?.fileBlob) return null;

      return { fileName: c.fileName, bytes: c.fileBlob };
    },
  );

  ipcMain.handle(
    "DELETE borrowing-contracts",
    async (
      _event,
      data: BorrowingContractDeleteInput,
    ): Promise<DeleteResultDto> => {
      return await orm.em.fork().transactional(async (em) => {
        const contract = await em.findOneOrFail(BorrowingContract, {
          id: data.id,
        });
        await removeContractAutoTransaction(em, "borrowingContract", data.id);
        em.remove(contract);
        await em.flush();
        return { id: data.id };
      });
    },
  );
}
