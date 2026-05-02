export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ContactDetails extends BaseEntity {
  name: string;
  fatherName: string;
  nidInfo: string;
  phone: string;
  address: string;
}

export interface VaultBalanceHistory extends BaseEntity {
  qardAlHasanBalance: number;
  zakatBalance: number;
  sadaqaBalance: number;
  waqfBalance: number;
  totalBalance: number;
  transaction?: Transaction;
}

export interface Vault extends BaseEntity {
  name: string;
  description?: string;
  latestBalance?: VaultBalanceHistory;
}

export interface LendingContract extends BaseEntity {
  contact: ContactDetails;
  amount: number;
  durationDays: number;
  returnDate: string;
  financeCategoryType: "Qard al-Hasan" | "Zakat" | "Sadaqa" | "Waqf";
  reasonForLending?: string;
  contractStatus: "Active" | "Completed" | "Defaulted";
  totalRepaid?: number;
}

export type FinanceCategoryType = LendingContract["financeCategoryType"];
export type ContractStatus = LendingContract["contractStatus"];

export interface BorrowingContract extends BaseEntity {
  contact: ContactDetails;
  amount: number;
  durationDays: number;
  returnDate: string;
  financeCategoryType: "Qard al-Hasan" | "Zakat" | "Sadaqa" | "Waqf";
  purposeOfLoan?: string;
  guarantor1?: ContactDetails;
  guarantor2?: ContactDetails;
  firstReminder?: string;
  secondReminder?: string;
  thirdReminder?: string;
  guarantorsReminder?: string;
  contractStatus: "Active" | "Completed" | "Defaulted";
  adjustmentWithTransactionId?: number;
  totalRepaid?: number;
}


export interface Transaction extends BaseEntity {
  description: string;
  amount: number;
  transactionType: "Lend" | "Borrow" | "Expense" | "LendRepay" | "BorrowRepay";
  expenseType?:
    | "Bank Charge"
    | "Conveyance"
    | "Phone Expenses"
    | "Entertainment"
    | "Miscellaneous"
    | "Legal Expenses";
  vault: Vault;
  contact?: ContactDetails;
  financeCategoryType: FinanceCategoryType;
  lendingContract?: LendingContract;
  borrowingContract?: BorrowingContract;
  balance: number;
}

export type TransactionType = Transaction["transactionType"];
export type ExpenseType = Transaction["expenseType"];
