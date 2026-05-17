import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { BaseModel } from "./base-model.js";
import { ContactDetails } from "./contact-details.js";
import { FinanceCategoryType, LendingContract } from "./lending-contract.js";
import { BorrowingContract } from "./borrowing-contract.js";
import { Vault } from "./vault.js";

export enum TransactionType {
  Lend = "Lend",
  Borrow = "Borrow",
  Expense = "Expense",
  LendRepay = "LendRepay",
  BorrowRepay = "BorrowRepay",
}

export enum ExpenseType {
  BankCharge = "Bank Charge",
  Conveyance = "Conveyance",
  PhoneExpenses = "Phone Expenses",
  Entertainment = "Entertainment",
  Miscellaneous = "Miscellaneous",
  LegalExpenses = "Legal Expenses",
}

/** Immutable ledger entry. Each row carries a running system-wide balance across all vaults. */
@Entity()
export class Transaction extends BaseModel {
  @Property({ type: "string" })
  description!: string;

  @Property({ type: "number" })
  amount!: number;

  @Property({ type: "string" })
  transactionType!: TransactionType;

  @Property({ type: "string", nullable: true })
  expenseType?: ExpenseType;

  @ManyToOne(() => Vault)
  vault!: Vault;

  @ManyToOne(() => ContactDetails, { nullable: true })
  contact?: ContactDetails;

  @Property({ type: "string" })
  financeCategoryType!: FinanceCategoryType;

  @ManyToOne(() => LendingContract, { nullable: true })
  lendingContract?: LendingContract;

  @ManyToOne(() => BorrowingContract, { nullable: true })
  borrowingContract?: BorrowingContract;

  @Property({ type: "number" })
  balance!: number;
}
