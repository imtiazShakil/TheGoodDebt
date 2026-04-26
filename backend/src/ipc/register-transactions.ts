import { EntityManager } from "@mikro-orm/core";
import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { BorrowingContract } from "../repository/entity/borrowing-contract";
import { ContactDetails } from "../repository/entity/contact-details";
import {
  ContractStatus,
  FinanceCategoryType,
  LendingContract,
} from "../repository/entity/lending-contract";
import {
  ExpenseType,
  Transaction,
  TransactionType,
} from "../repository/entity/transaction";
import { Vault } from "../repository/entity/vault";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history";

const POPULATE = [
  "vault",
  "contact",
  "lendingContract",
  "lendingContract.contact",
  "borrowingContract",
  "borrowingContract.contact",
] as const;

const INCREASE_TYPES: TransactionType[] = [
  TransactionType.Lend,
  TransactionType.BorrowRepay,
];

const CATEGORY_FIELD: Record<
  FinanceCategoryType,
  "qardAlHasanBalance" | "zakatBalance" | "sadaqaBalance" | "waqfBalance"
> = {
  [FinanceCategoryType.QardAlHasan]: "qardAlHasanBalance",
  [FinanceCategoryType.Zakat]: "zakatBalance",
  [FinanceCategoryType.Sadaqa]: "sadaqaBalance",
  [FinanceCategoryType.Waqf]: "waqfBalance",
};

export async function computeRepaidTotals(
  em: EntityManager,
  contractIds: number[],
  contractKey: "lendingContract" | "borrowingContract",
  transactionType: TransactionType,
): Promise<Record<number, number>> {
  if (contractIds.length === 0) return {};
  const txs = await em.find(Transaction, {
    [contractKey]: { $in: contractIds },
    transactionType,
  });
  const result: Record<number, number> = {};
  for (const tx of txs) {
    const id = (tx[contractKey] as { id: number }).id;
    result[id] = (result[id] ?? 0) + tx.amount;
  }
  return result;
}

export async function assertVaultCategoryBalance(
  em: EntityManager,
  vaultId: number,
  financeCategoryType: FinanceCategoryType,
  requiredAmount: number,
): Promise<void> {
  const latestVbh = await em.findOne(
    VaultBalanceHistory,
    { vault: vaultId },
    { orderBy: { createdAt: "DESC" } },
  );
  const field = CATEGORY_FIELD[financeCategoryType];
  const available = latestVbh?.[field] ?? 0;
  if (available < requiredAmount) {
    throw new Error(
      `Insufficient ${financeCategoryType} balance: available ${available}, required ${requiredAmount}`,
    );
  }
}

export interface LedgerEntryInput {
  vaultId: number;
  amount: number;
  transactionType: TransactionType;
  financeCategoryType: FinanceCategoryType;
  description: string;
  expenseType?: ExpenseType;
  contactId?: number;
  lendingContractId?: number;
  borrowingContractId?: number;
}

export async function createLedgerEntry(
  em: EntityManager,
  data: LedgerEntryInput,
): Promise<Transaction> {
  const lastTransactions = await em.find(
    Transaction,
    {},
    { limit: 1, orderBy: { id: "DESC" } },
  );
  const prevSystemBalance = lastTransactions[0]?.balance ?? 0;
  const delta = INCREASE_TYPES.includes(data.transactionType)
    ? +data.amount
    : -data.amount;
  const newSystemBalance = prevSystemBalance + delta;

  const latestVbh = await em.findOne(
    VaultBalanceHistory,
    { vault: data.vaultId },
    { orderBy: { createdAt: "DESC" } },
  );

  const buckets = {
    qardAlHasanBalance: latestVbh?.qardAlHasanBalance ?? 0,
    zakatBalance: latestVbh?.zakatBalance ?? 0,
    sadaqaBalance: latestVbh?.sadaqaBalance ?? 0,
    waqfBalance: latestVbh?.waqfBalance ?? 0,
  };
  const field = CATEGORY_FIELD[data.financeCategoryType];
  buckets[field] = buckets[field] + delta;
  const totalBalance =
    buckets.qardAlHasanBalance +
    buckets.zakatBalance +
    buckets.sadaqaBalance +
    buckets.waqfBalance;

  const transaction = em.create(Transaction, {
    description: data.description,
    amount: data.amount,
    transactionType: data.transactionType,
    expenseType: data.expenseType ?? undefined,
    vault: em.getReference(Vault, data.vaultId),
    contact: data.contactId
      ? em.getReference(ContactDetails, data.contactId)
      : undefined,
    financeCategoryType: data.financeCategoryType,
    lendingContract: data.lendingContractId
      ? em.getReference(LendingContract, data.lendingContractId)
      : undefined,
    borrowingContract: data.borrowingContractId
      ? em.getReference(BorrowingContract, data.borrowingContractId)
      : undefined,
    balance: newSystemBalance,
  });
  em.persist(transaction);

  const vbh = em.create(VaultBalanceHistory, {
    vault: em.getReference(Vault, data.vaultId),
    transaction,
    ...buckets,
    totalBalance,
  });
  em.persist(vbh);

  await em.flush();
  await em.populate(transaction, POPULATE as unknown as never);
  return transaction;
}

function validatePayload(data: {
  transactionType: TransactionType;
  lendingContract?: { id?: number };
  borrowingContract?: { id?: number };
  expenseType?: ExpenseType;
}) {
  const type = data.transactionType;
  const hasLending = !!data.lendingContract?.id;
  const hasBorrowing = !!data.borrowingContract?.id;
  const hasExpenseType = !!data.expenseType;

  if (type === TransactionType.Lend || type === TransactionType.Borrow) {
    throw new Error(
      `${type} transactions are created automatically via contracts`,
    );
  } else if (type === TransactionType.LendRepay) {
    if (!hasLending) throw new Error(`${type} requires a lendingContract`);
    if (hasBorrowing || hasExpenseType)
      throw new Error(`${type} cannot have borrowingContract or expenseType`);
  } else if (type === TransactionType.BorrowRepay) {
    if (!hasBorrowing) throw new Error(`${type} requires a borrowingContract`);
    if (hasLending || hasExpenseType)
      throw new Error(`${type} cannot have lendingContract or expenseType`);
  } else if (type === TransactionType.Expense) {
    if (!hasExpenseType) throw new Error("Expense requires expenseType");
    if (hasLending || hasBorrowing)
      throw new Error("Expense cannot have a contract reference");
  } else {
    throw new Error(`Unknown transactionType: ${type}`);
  }
}

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET transactions", async () => {
    const em = orm.em.fork();
    return await em.findAll(Transaction, {
      populate: POPULATE as unknown as never,
      orderBy: { id: "DESC" },
    });
  });

  ipcMain.handle("POST transactions", async (_event, data) => {
    validatePayload(data);

    return await orm.em.fork().transactional(async (em) => {
      let contactId: number | undefined;
      if (data.lendingContract?.id) {
        const lc = await em.findOneOrFail(LendingContract, {
          id: data.lendingContract.id,
        });
        contactId = lc.contact.id;
        await assertVaultCategoryBalance(
          em,
          data.vault.id,
          lc.financeCategoryType,
          data.amount,
        );
        const repaidMap = await computeRepaidTotals(
          em,
          [lc.id],
          "lendingContract",
          TransactionType.LendRepay,
        );
        const remaining = lc.amount - (repaidMap[lc.id] ?? 0);
        if (data.amount > remaining) {
          throw new Error(
            `Amount ${data.amount} exceeds remaining repayable balance of ${remaining}`,
          );
        }
        if (data.amount === remaining) {
          lc.contractStatus = ContractStatus.Completed;
        }
      } else if (data.borrowingContract?.id) {
        const bc = await em.findOneOrFail(BorrowingContract, {
          id: data.borrowingContract.id,
        });
        contactId = bc.contact.id;
        const repaidMap = await computeRepaidTotals(
          em,
          [bc.id],
          "borrowingContract",
          TransactionType.BorrowRepay,
        );
        const remaining = bc.amount - (repaidMap[bc.id] ?? 0);
        if (data.amount > remaining) {
          throw new Error(
            `Amount ${data.amount} exceeds remaining repayable balance of ${remaining}`,
          );
        }
        if (data.amount === remaining) {
          bc.contractStatus = ContractStatus.Completed;
        }
      } else if (data.contact?.id) {
        contactId = data.contact.id;
      }

      return await createLedgerEntry(em, {
        vaultId: data.vault.id,
        amount: data.amount,
        transactionType: data.transactionType,
        financeCategoryType: data.financeCategoryType,
        description: data.description,
        expenseType: data.expenseType ?? undefined,
        contactId,
        lendingContractId: data.lendingContract?.id,
        borrowingContractId: data.borrowingContract?.id,
      });
    });
  });

  ipcMain.handle("PUT transactions", async (_event, data) => {
    const em = orm.em.fork();
    const transaction = await em.findOneOrFail(Transaction, { id: data.id });
    transaction.description = data.description;
    await em.persistAndFlush(transaction);
    await em.populate(transaction, POPULATE as unknown as never);
    return transaction;
  });

  ipcMain.handle("DELETE transactions", async (_event, data) => {
    return await orm.em.fork().transactional(async (em) => {
      const lastTransactions = await em.find(
        Transaction,
        {},
        {
          limit: 1,
          orderBy: { id: "DESC" },
          populate: ["lendingContract", "borrowingContract"],
        },
      );
      const last = lastTransactions ? lastTransactions[0] : null;
      if (!last || last.id !== data.id) {
        throw new Error("Only the most recent transaction can be deleted");
      }

      const vbh = await em.findOne(VaultBalanceHistory, {
        transaction: data.id,
      });
      if (vbh) em.remove(vbh);

      if (
        last.transactionType === TransactionType.LendRepay &&
        last.lendingContract
      ) {
        if (last.lendingContract.contractStatus === ContractStatus.Completed) {
          last.lendingContract.contractStatus = ContractStatus.Active;
        }
      } else if (
        last.transactionType === TransactionType.BorrowRepay &&
        last.borrowingContract
      ) {
        if (
          last.borrowingContract.contractStatus === ContractStatus.Completed
        ) {
          last.borrowingContract.contractStatus = ContractStatus.Active;
        }
      } else {
        if (last.lendingContract) em.remove(last.lendingContract);
        if (last.borrowingContract) em.remove(last.borrowingContract);
      }

      em.remove(last);
      await em.flush();
      return { id: data.id };
    });
  });
}
