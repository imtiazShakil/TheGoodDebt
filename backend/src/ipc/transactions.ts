import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { ContactDetails } from "../repository/entity/contact-details";
import { Vault } from "../repository/entity/vault";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history";
import {
  LendingContract,
  FinanceCategoryType,
} from "../repository/entity/lending-contract";
import { BorrowingContract } from "../repository/entity/borrowing-contract";
import {
  ExpenseType,
  Transaction,
  TransactionType,
} from "../repository/entity/transaction";

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

  if (type === TransactionType.Lend || type === TransactionType.LendRepay) {
    if (!hasLending) throw new Error(`${type} requires a lendingContract`);
    if (hasBorrowing || hasExpenseType)
      throw new Error(`${type} cannot have borrowingContract or expenseType`);
  } else if (
    type === TransactionType.Borrow ||
    type === TransactionType.BorrowRepay
  ) {
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
      const lastTransactions = await em.find(
        Transaction,
        {},
        { limit: 1, orderBy: { id: "DESC" } },
      );
      const last = lastTransactions[0];
      const prevSystemBalance = last?.balance ?? 0;
      const delta = INCREASE_TYPES.includes(data.transactionType)
        ? +data.amount
        : -data.amount;
      const newSystemBalance = prevSystemBalance + delta;

      const latestVbh = await em.findOne(
        VaultBalanceHistory,
        { vault: data.vault.id },
        { orderBy: { createdAt: "DESC" } },
      );

      const buckets = {
        qardAlHasanBalance: latestVbh?.qardAlHasanBalance ?? 0,
        zakatBalance: latestVbh?.zakatBalance ?? 0,
        sadaqaBalance: latestVbh?.sadaqaBalance ?? 0,
        waqfBalance: latestVbh?.waqfBalance ?? 0,
      };
      const field =
        CATEGORY_FIELD[data.financeCategoryType as FinanceCategoryType];
      buckets[field] = buckets[field] + delta;
      const totalBalance =
        buckets.qardAlHasanBalance +
        buckets.zakatBalance +
        buckets.sadaqaBalance +
        buckets.waqfBalance;

      let contactRef: ContactDetails | undefined;
      let lendingRef: LendingContract | undefined;
      let borrowingRef: BorrowingContract | undefined;

      if (data.lendingContract?.id) {
        const lc = await em.findOneOrFail(LendingContract, {
          id: data.lendingContract.id,
        });
        lendingRef = em.getReference(LendingContract, lc.id);
        contactRef = em.getReference(ContactDetails, lc.contact.id);
      } else if (data.borrowingContract?.id) {
        const bc = await em.findOneOrFail(BorrowingContract, {
          id: data.borrowingContract.id,
        });
        borrowingRef = em.getReference(BorrowingContract, bc.id);
        contactRef = em.getReference(ContactDetails, bc.contact.id);
      } else if (data.contact?.id) {
        contactRef = em.getReference(ContactDetails, data.contact.id);
      }

      const transaction = em.create(Transaction, {
        description: data.description,
        amount: data.amount,
        transactionType: data.transactionType,
        expenseType: data.expenseType ?? undefined,
        vault: em.getReference(Vault, data.vault.id),
        contact: contactRef,
        financeCategoryType: data.financeCategoryType,
        lendingContract: lendingRef,
        borrowingContract: borrowingRef,
        balance: newSystemBalance,
      } as unknown as Transaction);

      em.persist(transaction);

      const vbh = em.create(VaultBalanceHistory, {
        vault: em.getReference(Vault, data.vault.id),
        transaction,
        ...buckets,
        totalBalance,
      } as unknown as VaultBalanceHistory);
      em.persist(vbh);

      await em.flush();
      await em.populate(transaction, POPULATE as unknown as never);
      return transaction;
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
      const last = await em.findOne(
        Transaction,
        {},
        { orderBy: { id: "DESC" } },
      );
      if (!last || last.id !== data.id) {
        throw new Error("Only the most recent transaction can be deleted");
      }

      const vbh = await em.findOne(VaultBalanceHistory, {
        transaction: data.id,
      });
      if (vbh) em.remove(vbh);
      em.remove(last);
      await em.flush();
      return { id: data.id };
    });
  });
}
