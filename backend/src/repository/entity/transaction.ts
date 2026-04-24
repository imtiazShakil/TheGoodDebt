import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ContactDetails } from "./contact-details";
import { Vault } from "./vault";
import { FinanceCategoryType, LendingContract } from "./lending-contract";
import { BorrowingContract } from "./borrowing-contract";

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

@Entity()
export class Transaction {
  @PrimaryKey()
  id!: number;

  @Property()
  description!: string;

  @Property()
  amount!: number;

  @Property()
  transactionType!: TransactionType;

  @Property({ nullable: true })
  expenseType?: ExpenseType;

  @ManyToOne(() => Vault)
  vault!: Vault;

  @ManyToOne(() => ContactDetails, { nullable: true })
  contact?: ContactDetails;

  @Property()
  financeCategoryType!: FinanceCategoryType;

  @ManyToOne(() => LendingContract, { nullable: true })
  lendingContract?: LendingContract;

  @ManyToOne(() => BorrowingContract, { nullable: true })
  borrowingContract?: BorrowingContract;

  @Property()
  balance!: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
