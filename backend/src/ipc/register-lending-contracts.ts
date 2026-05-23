import { IpcMain } from "electron";
import { applyAttachment } from "./attachment-helpers.js";
import { orm } from "../repository/db.js";
import { ContactDetails } from "../repository/entity/contact-details.js";
import {
  ContractStatus,
  LendingContract,
} from "../repository/entity/lending-contract.js";
import { TransactionType } from "../repository/entity/transaction.js";
import {
  AttachedFileDto,
  DeleteResultDto,
  LendingContractCreateInput,
  LendingContractDeleteInput,
  LendingContractDto,
  LendingContractFileInput,
  LendingContractUpdateInput,
} from "./contract.js";
import { toLendingContractDto } from "./entityDtoMapper.js";
import {
  computeRepaidTotals,
  createLedgerEntry,
  removeContractAutoTransaction,
} from "./register-transactions.js";

/**
 * Registers IPC handlers for LendingContract CRUD.
 * Creating a contract automatically fires a Lend ledger entry into the selected vault.
 * Deleting is only allowed if the auto-created transaction is still the latest in the ledger.
 */
export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle(
    "GET lending-contracts",
    async (): Promise<LendingContractDto[]> => {
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
      return contracts.map((c) =>
        toLendingContractDto(c, repaidMap[c.id] ?? 0),
      );
    },
  );

  ipcMain.handle(
    "POST lending-contracts",
    async (
      _event,
      data: LendingContractCreateInput,
    ): Promise<LendingContractDto> => {
      return await orm.em.fork().transactional(async (em) => {
        // Construct the entity from the typed input rather than spreading
        // `data` — the frontend passes the full LendingContract object
        // (including its empty `id` and the nested ContactDetails), and we
        // only want the fields the input contract declares to reach em.create.
        const contract = em.create(LendingContract, {
          contact: em.getReference(ContactDetails, data.contact.id),
          amount: data.amount,
          durationDays: data.durationDays,
          returnDate: data.returnDate,
          financeCategoryType: data.financeCategoryType,
          reasonForLending: data.reasonForLending,
          contractStatus: ContractStatus.Active,
        } as unknown as LendingContract);
        if (data.attachedFile) applyAttachment(contract, data.attachedFile);
        em.persist(contract);
        await em.flush();

        await createLedgerEntry(em, {
          vaultId: data.vaultId,
          amount: contract.amount,
          transactionType: TransactionType.Lend,
          financeCategoryType: contract.financeCategoryType,
          description: contract.reasonForLending ?? "",
          contactId: data.contact.id,
          lendingContractId: contract.id,
        });

        await em.populate(contract, ["contact"]);
        return toLendingContractDto(contract, 0);
      });
    },
  );

  ipcMain.handle(
    "PUT lending-contracts",
    async (
      _event,
      data: LendingContractUpdateInput,
    ): Promise<LendingContractDto> => {
      const em = orm.em.fork();
      const contract = await em.findOneOrFail(LendingContract, { id: data.id });
      contract.durationDays = data.durationDays;
      contract.returnDate = data.returnDate;
      contract.reasonForLending = data.reasonForLending;
      if (data.attachedFile) applyAttachment(contract, data.attachedFile);
      await em.persist(contract).flush();
      await em.populate(contract, ["contact"]);
      const repaidMap = await computeRepaidTotals(
        em,
        [contract.id],
        "lendingContract",
        TransactionType.LendRepay,
      );
      return toLendingContractDto(contract, repaidMap[contract.id] ?? 0);
    },
  );

  ipcMain.handle(
    "GET lending-contract-file",
    async (
      _event,
      data: LendingContractFileInput,
    ): Promise<AttachedFileDto | null> => {
      const em = orm.em.fork();
      // Explicit `fields` opts the lazy fileBlob column into this one projection.
      const c = await em.findOne(
        LendingContract,
        { id: data.contractId },
        { fields: ["id", "fileName", "fileBlob"] },
      );
      if (!c?.fileName || !c?.fileBlob) return null;

      return { fileName: c.fileName, bytes: c.fileBlob };
    },
  );

  ipcMain.handle(
    "DELETE lending-contracts",
    async (
      _event,
      data: LendingContractDeleteInput,
    ): Promise<DeleteResultDto> => {
      return await orm.em.fork().transactional(async (em) => {
        const contract = await em.findOneOrFail(LendingContract, {
          id: data.id,
        });
        await removeContractAutoTransaction(em, "lendingContract", data.id);
        em.remove(contract);
        await em.flush();
        return { id: data.id };
      });
    },
  );
}
