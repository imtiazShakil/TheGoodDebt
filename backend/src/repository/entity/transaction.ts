import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";
import { ContactDetails } from "./contact-details";
import { FinanceCategoryType, LendingContract } from "./lending-contract";
import { BorrowingContract } from "./borrowing-contract";
import { Vault } from "./vault";

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
export class Transaction extends BaseModel {
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
}
