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

export interface Vault extends BaseEntity {
  name: string;
  description?: string;
}

export interface LendingContract extends BaseEntity {
  contact: ContactDetails;
  amount: number;
  durationDays: number;
  returnDate: string;
  financeCategoryType: "Qard al-Hasan" | "Zakat" | "Sadaqa" | "Waqf";
  reasonForLending?: string;
  contractStatus: "Active" | "Completed" | "Defaulted";
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
  loanRecallStatus?:
    | "1st Reminder"
    | "2nd Reminder"
    | "3rd Reminder"
    | "Guarantors reminder";
  contractStatus: "Active" | "Completed" | "Defaulted";
  adjustmentWithTransactionId?: number;
}

export type LoanRecallStatus = BorrowingContract["loanRecallStatus"];
